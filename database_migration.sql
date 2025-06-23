-- Final Migration: Convert to usage-based credit system with API key toggle
-- Run this in your Supabase SQL editor

-- Add the use_own_api_keys column to settings table
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS use_own_api_keys BOOLEAN DEFAULT FALSE;

-- Add individual API key management columns if they don't exist
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS anthropic_key_name TEXT,
ADD COLUMN IF NOT EXISTS openai_key_name TEXT,
ADD COLUMN IF NOT EXISTS openrouter_key_name TEXT,
ADD COLUMN IF NOT EXISTS google_key_name TEXT;

-- Set default names for existing keys
UPDATE settings 
SET anthropic_key_name = 'Anthropic API Key'
WHERE anthropic_key IS NOT NULL AND anthropic_key_name IS NULL;

UPDATE settings 
SET openai_key_name = 'OpenAI API Key'
WHERE openai_key IS NOT NULL AND openai_key_name IS NULL;

UPDATE settings 
SET openrouter_key_name = 'OpenRouter API Key'
WHERE openrouter_key IS NOT NULL AND openrouter_key_name IS NULL;

UPDATE settings 
SET google_key_name = 'Google API Key'
WHERE google_key IS NOT NULL AND google_key_name IS NULL;

-- Create a table to track credit transactions (purchase/usage history)
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  amount INTEGER NOT NULL, -- positive for additions, negative for usage
  description TEXT,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL, -- for usage tracking
  stripe_payment_intent_id TEXT, -- for purchase tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS credit_transactions_created_at_idx ON credit_transactions(created_at);

-- Add RLS policies for credit_transactions
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credit transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit transactions" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update existing users to have 2 free credits if they don't have credits already
UPDATE users 
SET credits = COALESCE(credits, 0) + 2 
WHERE (credits IS NULL OR credits = 0);

-- Create function to check if user can generate workflows
CREATE OR REPLACE FUNCTION can_user_generate(p_user_id UUID) RETURNS BOOLEAN AS $$
DECLARE
  user_credits INTEGER;
  user_reserved_credits INTEGER;
  use_own_keys BOOLEAN;
  main_provider TEXT;
  fallback_provider TEXT;
  has_main_key BOOLEAN := FALSE;
  has_fallback_key BOOLEAN := FALSE;
BEGIN
  -- Get user's credit count and API key preference
  SELECT u.credits, u.reserved_credits, s.use_own_api_keys, s.main_provider, s.fallback_provider
  INTO user_credits, user_reserved_credits, use_own_keys, main_provider, fallback_provider
  FROM users u
  LEFT JOIN settings s ON s.user_id = u.id
  WHERE u.id = p_user_id;
  
  -- If using own API keys, check if they have both main and fallback keys
  IF use_own_keys THEN
    -- Check if main provider key exists
    IF main_provider = 'anthropic' THEN
      SELECT (anthropic_key IS NOT NULL) INTO has_main_key FROM settings WHERE user_id = p_user_id;
    ELSIF main_provider = 'openai' THEN
      SELECT (openai_key IS NOT NULL) INTO has_main_key FROM settings WHERE user_id = p_user_id;
    ELSIF main_provider = 'openrouter' THEN
      SELECT (openrouter_key IS NOT NULL) INTO has_main_key FROM settings WHERE user_id = p_user_id;
    ELSIF main_provider = 'google' THEN
      SELECT (google_key IS NOT NULL) INTO has_main_key FROM settings WHERE user_id = p_user_id;
    END IF;
    
    -- Check if fallback provider key exists (and it's different from main)
    IF fallback_provider IS NOT NULL AND fallback_provider != main_provider THEN
      IF fallback_provider = 'anthropic' THEN
        SELECT (anthropic_key IS NOT NULL) INTO has_fallback_key FROM settings WHERE user_id = p_user_id;
      ELSIF fallback_provider = 'openai' THEN
        SELECT (openai_key IS NOT NULL) INTO has_fallback_key FROM settings WHERE user_id = p_user_id;
      ELSIF fallback_provider = 'openrouter' THEN
        SELECT (openrouter_key IS NOT NULL) INTO has_fallback_key FROM settings WHERE user_id = p_user_id;
      ELSIF fallback_provider = 'google' THEN
        SELECT (google_key IS NOT NULL) INTO has_fallback_key FROM settings WHERE user_id = p_user_id;
      END IF;
    END IF;
    
    RETURN COALESCE(has_main_key, FALSE) AND COALESCE(has_fallback_key, FALSE);
  ELSE
    -- Using Gen8n credits, check available credits (total - reserved)
    RETURN COALESCE(user_credits, 0) - COALESCE(user_reserved_credits, 0) > 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to safely add credits for purchases
CREATE OR REPLACE FUNCTION add_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_stripe_payment_intent_id TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update user credits
  UPDATE users
  SET credits = COALESCE(credits, 0) + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (
    user_id,
    type,
    amount,
    description,
    stripe_payment_intent_id
  ) VALUES (
    p_user_id,
    p_transaction_type,
    p_amount,
    p_description,
    p_stripe_payment_intent_id
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 