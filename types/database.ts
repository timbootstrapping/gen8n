import { Database } from './supabase';

// Table row types for easier imports
export type User = Database['public']['Tables']['users']['Row'];
export type Workflow = Database['public']['Tables']['workflows']['Row'];
export type Profile = Database['public']['Tables']['profile']['Row'];
export type Settings = Database['public']['Tables']['settings']['Row'];
export type Feedback = Database['public']['Tables']['feedback']['Row'];

// Insert types for creating new records
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type WorkflowInsert = Database['public']['Tables']['workflows']['Insert'];
export type ProfileInsert = Database['public']['Tables']['profile']['Insert'];
export type SettingsInsert = Database['public']['Tables']['settings']['Insert'];
export type FeedbackInsert = Database['public']['Tables']['feedback']['Insert'];

// Update types for updating existing records
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type WorkflowUpdate = Database['public']['Tables']['workflows']['Update'];
export type ProfileUpdate = Database['public']['Tables']['profile']['Update'];
export type SettingsUpdate = Database['public']['Tables']['settings']['Update'];
export type FeedbackUpdate = Database['public']['Tables']['feedback']['Update'];

// Enum types
export type UserPlan = Database['public']['Enums']['user_plan'];
export type FeedbackType = Database['public']['Enums']['feedback_type'];
export type WorkflowStatus = Database['public']['Enums']['workflow_status']; 