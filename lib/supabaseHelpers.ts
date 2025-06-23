import { supabase } from './supabaseClient';

// Client-side auth helpers
export async function signUpUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`
    }
  });
  return { data, error };
}

export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  });
  return { data, error };
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

// Database helpers (for when user is authenticated)
export async function checkPlanAndUsage(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('plan, usage_count')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function storeWorkflow(workflow: {
  user_id: string;
  name: string;
  description: string;
  json: any;
  sticky_notes: any;
  status: 'pending' | 'complete' | 'error';
}) {
  const { error } = await supabase.from('workflows').insert(workflow);
  if (error) throw error;
}

export async function storeFeedback(feedback: {
  user_id: string;
  type: 'bug' | 'feature' | 'comment';
  content: string;
  related_workflow_id?: string;
}) {
  const { error } = await supabase.from('feedback').insert(feedback);
  if (error) throw error;
}

export async function getUserWorkflows(userId: string) {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
} 