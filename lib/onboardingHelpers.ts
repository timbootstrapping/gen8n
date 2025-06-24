import { supabase } from './supabaseClient';
import { ProfileInsert, SettingsInsert } from '@/types/database';

export interface OnboardingData {
  firstName: string;
  lastName: string;
  email: string;
  companyOrProject: string;
  usageIntent: string;
  n8nBaseUrl: string;
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
    marketing_source: data.marketingSource || null,
    n8n_base_url: data.n8nBaseUrl || null
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
const ONBOARDING_STEP_KEY = 'gen8n_onboarding_step';

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

export function saveCurrentStep(step: number) {
  localStorage.setItem(ONBOARDING_STEP_KEY, step.toString());
}

export function loadCurrentStep(): number | null {
  try {
    const stored = localStorage.getItem(ONBOARDING_STEP_KEY);
    return stored ? parseInt(stored, 10) : null;
  } catch {
    return null;
  }
}

export function clearOnboardingStorage() {
  localStorage.removeItem(ONBOARDING_KEY);
  localStorage.removeItem(ONBOARDING_STEP_KEY);
}

// Check if user has completed onboarding
export async function checkOnboardingStatus(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('onboarding_complete')
      .eq('user_id', userId)
      .single();
    
    if (error) return false;
    return data?.onboarding_complete || false;
  } catch {
    return false;
  }
}

export async function ensureSettingsRow(userId: string) {
  // Insert a settings row if it doesn't exist
  const { data, error } = await supabase
    .from('settings')
    .select('user_id')
    .eq('user_id', userId)
    .single();
  if (!data) {
    await supabase.from('settings').upsert({ user_id: userId, onboarding_complete: false });
  }
} 