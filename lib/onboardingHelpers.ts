import { supabase } from './supabaseClient';
import { ProfileInsert, SettingsInsert } from '@/types/database';

export interface OnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  companyOrProject: string;
  usageIntent: string;
  mainProvider: string;
  fallbackProvider?: string;
  apiKeys: Record<string, string>;
  marketingSource: string;
  skippedKeys: boolean;
}

export async function saveOnboardingProfile(userId: string, data: Partial<OnboardingData>) {
  const profileData: ProfileInsert = {
    user_id: userId,
    company_or_project: data.companyOrProject || null,
    usage_intent: data.usageIntent || null,
    marketing_source: data.marketingSource || null
  };

  const { error } = await supabase
    .from('profile')
    .upsert(profileData);
  
  if (error) throw error;
}

export async function saveOnboardingSettings(userId: string, data: Partial<OnboardingData>) {
  const settingsData: SettingsInsert = {
    user_id: userId,
    main_provider: data.mainProvider || null,
    fallback_provider: data.fallbackProvider || null,
    anthropic_key: data.apiKeys?.anthropic || null,
    openai_key: data.apiKeys?.openai || null,
    openrouter_key: data.apiKeys?.openrouter || null,
    google_key: data.apiKeys?.google || null,
    onboarding_complete: true
  };

  const { error } = await supabase
    .from('settings')
    .upsert(settingsData);
  
  if (error) throw error;
}

// Local storage helpers for persistence
const ONBOARDING_KEY = 'gen8n_onboarding_data';

export function saveOnboardingToStorage(data: Partial<OnboardingData>) {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(data));
}

export function loadOnboardingFromStorage(): Partial<OnboardingData> {
  try {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function clearOnboardingStorage() {
  localStorage.removeItem(ONBOARDING_KEY);
} 