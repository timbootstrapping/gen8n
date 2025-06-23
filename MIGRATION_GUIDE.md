# Gen8n Credit System Migration Guide

This guide will walk you through migrating Gen8n from a subscription-based model to a usage-based credit system with API key toggle functionality.

## Overview

The new system allows users to either:
1. **Use Gen8n Credits** - Pay $1.50 per generation using Gen8n's API keys
2. **Use Own API Keys** - Unlimited generations with their own provider keys

## Step 1: Database Migration

Run the SQL migration in your Supabase SQL editor:

```sql
-- Copy and paste the contents of database_migration.sql
```

This will:
- Add `use_own_api_keys` column to settings table
- Add `credits_remaining` column to users table  
- Create `credit_transactions` table for purchase/usage tracking
- Add helper functions for credit management
- Give existing users 2 free credits

## Step 2: Environment Variables

Add these environment variables for Gen8n's internal API keys:

```env
# Gen8n's own API keys (for credit system)
GEN8N_ANTHROPIC_KEY=your_anthropic_key_here
GEN8N_OPENAI_KEY=your_openai_key_here
GEN8N_OPENROUTER_KEY=your_openrouter_key_here
GEN8N_GOOGLE_KEY=your_google_key_here

# Stripe for credit purchases
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Step 3: Stripe Setup

1. Create Stripe products for credits
2. Set up webhook endpoint at `/api/stripe-webhook`
3. Configure webhook to listen for `checkout.session.completed` events

## Step 4: Test the System

### For New Users:
1. Sign up → Choose between credits or API keys
2. If credits: Get 2 free, can purchase more
3. If API keys: Add Anthropic key (required), others optional

### For Existing Users:
1. Get 2 free credits automatically
2. Can toggle between credits/API keys in settings
3. Previous API keys are preserved

## Step 5: Remove Old Subscription Logic

Once migration is complete:
1. Remove any subscription-related UI components
2. Update billing references to point to credit system
3. Cancel any existing Stripe subscriptions

## Key Features

### Settings Page
- **Billing Tab**: Toggle between credits and API keys
- **API Keys Tab**: Manage provider keys
- **Profile Tab**: Update personal info

### Generation Flow
- Shows current credit balance or API key status
- Blocks generation if no credits/keys available
- Deducts credits only on successful generation
- Refreshes balance after generation

### Credit Purchase
- Modal with preset quantities (5, 10, 25, 50 credits)
- Bonus credits for larger purchases
- Stripe checkout integration
- Instant credit updates via webhook

### Security
- API keys encrypted at rest
- Only show last 4 characters in UI
- User can only access their own credits/keys
- Server-side validation for all operations

## Pricing Structure

- **Credits**: $1.50 per generation
- **Bonus System**:
  - 10+ credits: +2 bonus
  - 25+ credits: +5 bonus  
  - 50+ credits: +15 bonus
- **API Keys**: User pays provider costs directly (~$0.10-0.50 per generation)

## Support

The system handles all edge cases:
- Can't switch to credits with 0 balance
- Can't switch to API keys without required Anthropic key
- Failed generations don't deduct credits
- Credit transactions are logged for support

## Rollback Plan

If issues arise:
1. Revert API route changes
2. Re-enable subscription logic
3. Database schema supports both systems temporarily

This migration maintains full backward compatibility while introducing the new credit system. 