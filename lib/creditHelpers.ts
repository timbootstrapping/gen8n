import { supabase } from './supabaseClient';
import { CreditTransactionInsert, CreditTransactionType } from '@/types/database';

export interface CreditBalance {
  credits: number;
  reserved_credits: number;
  use_own_api_keys: boolean;
  has_required_api_keys: boolean;
  main_provider: string | null;
  fallback_provider: string | null;
}

// Get user's current credit balance and API key status
export async function getUserCreditBalance(userId: string, supabaseClient = supabase): Promise<CreditBalance | null> {
  try {
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('credits, reserved_credits')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user credits:', userError);
      return null;
    }

    const { data: settingsData, error: settingsError } = await supabaseClient
      .from('settings')
      .select('use_own_api_keys, main_provider, fallback_provider, anthropic_key, openai_key, openrouter_key, google_key')
      .eq('user_id', userId)
      .single();

    if (settingsError) {
      console.error('Error fetching user settings:', settingsError);
      return null;
    }

    // Check if user has both main and fallback API keys
    const hasMainKey = settingsData?.main_provider ? getApiKeyByProvider(settingsData, settingsData.main_provider) : false;
    const hasFallbackKey = settingsData?.fallback_provider && settingsData.fallback_provider !== settingsData.main_provider 
      ? getApiKeyByProvider(settingsData, settingsData.fallback_provider) : false;

    return {
      credits: userData.credits || 0,
      reserved_credits: userData.reserved_credits || 0,
      use_own_api_keys: settingsData?.use_own_api_keys || false,
      has_required_api_keys: hasMainKey && hasFallbackKey,
      main_provider: settingsData?.main_provider || null,
      fallback_provider: settingsData?.fallback_provider || null
    };
  } catch (error) {
    console.error('Error in getUserCreditBalance:', error);
    return null;
  }
}

// Helper function to check if API key exists for a provider
function getApiKeyByProvider(settings: any, provider: string): boolean {
  switch (provider) {
    case 'anthropic':
      return !!settings.anthropic_key;
    case 'openai':
      return !!settings.openai_key;
    case 'openrouter':
      return !!settings.openrouter_key;
    case 'google':
      return !!settings.google_key;
    default:
      return false;
  }
}

// Check if user can generate workflows
export async function canUserGenerate(userId: string): Promise<boolean> {
  const balance = await getUserCreditBalance(userId);
  if (!balance) return false;

  if (balance.use_own_api_keys) {
    return balance.has_required_api_keys;
  } else {
    // Check available credits (total - reserved)
    return (balance.credits - balance.reserved_credits) > 0;
  }
}

// Add credits (for purchases or bonuses)
export async function addCredits(
  userId: string,
  amount: number,
  type: CreditTransactionType = 'purchase',
  description?: string,
  stripePaymentIntentId?: string
): Promise<boolean> {
  try {
    // Use the database function to safely add credits
    const { data, error } = await supabase.rpc('add_user_credits', {
      p_user_id: userId,
      p_amount: amount,
      p_transaction_type: type,
      p_description: description || `Added ${amount} credits`,
      p_stripe_payment_intent_id: stripePaymentIntentId
    });

    if (error) {
      console.error('Error adding credits:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error in addCredits:', error);
    return false;
  }
}

// Get credit transaction history
export async function getCreditTransactions(
  userId: string,
  limit: number = 50
): Promise<any[] | null> {
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select(`
        *,
        workflows (
          name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching credit transactions:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCreditTransactions:', error);
    return null;
  }
}

// Toggle API key usage preference
export async function toggleApiKeyUsage(
  userId: string,
  useOwnApiKeys: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('settings')
      .update({ use_own_api_keys: useOwnApiKeys })
      .eq('user_id', userId);

    if (error) {
      console.error('Error toggling API key usage:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in toggleApiKeyUsage:', error);
    return false;
  }
}

// Initialize new user with free credits
export async function initializeUserCredits(userId: string): Promise<boolean> {
  try {
    // Give new users 2 free credits
    const success = await addCredits(
      userId,
      2,
      'bonus',
      'Welcome bonus - 2 free credits'
    );

    return success;
  } catch (error) {
    console.error('Error initializing user credits:', error);
    return false;
  }
}

// Check if user has sufficient credits and required API keys before generation
export async function validateGenerationRequest(userId: string, supabaseClient = supabase): Promise<{
  canGenerate: boolean;
  reason?: string;
  useOwnKeys: boolean;
  availableCredits?: number;
  missingProviders?: string[];
}> {
  try {
    const balance = await getUserCreditBalance(userId, supabaseClient);
    
    if (!balance) {
      return {
        canGenerate: false,
        reason: 'Could not fetch user balance',
        useOwnKeys: false
      };
    }

    if (balance.use_own_api_keys) {
      if (!balance.has_required_api_keys) {
        const missingProviders: string[] = [];
        if (!balance.main_provider) {
          missingProviders.push('main provider');
        } else if (!getApiKeyByProvider(balance as any, balance.main_provider)) {
          missingProviders.push(`${balance.main_provider} (main)`);
        }
        
        if (!balance.fallback_provider) {
          missingProviders.push('fallback provider');
        } else if (!getApiKeyByProvider(balance as any, balance.fallback_provider)) {
          missingProviders.push(`${balance.fallback_provider} (fallback)`);
        }

        return {
          canGenerate: false,
          reason: 'Missing required API keys',
          useOwnKeys: true,
          missingProviders
        };
      }
      
      return {
        canGenerate: true,
        useOwnKeys: true
      };
    } else {
      const availableCredits = balance.credits - balance.reserved_credits;
      
      if (availableCredits <= 0) {
        return {
          canGenerate: false,
          reason: 'Insufficient available credits',
          useOwnKeys: false,
          availableCredits
        };
      }
      
      return {
        canGenerate: true,
        useOwnKeys: false,
        availableCredits
      };
    }
  } catch (error) {
    console.error('Error in validateGenerationRequest:', error);
    return {
      canGenerate: false,
      reason: 'Internal error',
      useOwnKeys: false
    };
  }
} 