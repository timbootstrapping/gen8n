export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          plan: string | null
          api_keys: Json | null
          usage_count: number | null
          is_admin: boolean | null
          created_at: string
          updated_at: string
          first_name: string | null
          last_name: string | null
          credits: number | null
          credits_remaining: number | null
          last_reset: string | null
          usage_history: Json | null
          reserved_credits: number | null
        }
        Insert: {
          id?: string
          email: string
          plan?: string | null
          api_keys?: Json | null
          usage_count?: number | null
          is_admin?: boolean | null
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          credits?: number | null
          credits_remaining?: number | null
          last_reset?: string | null
          usage_history?: Json | null
          reserved_credits?: number | null
        }
        Update: {
          id?: string
          email?: string
          plan?: string | null
          api_keys?: Json | null
          usage_count?: number | null
          is_admin?: boolean | null
          created_at?: string
          updated_at?: string
          first_name?: string | null
          last_name?: string | null
          credits?: number | null
          credits_remaining?: number | null
          last_reset?: string | null
          usage_history?: Json | null
          reserved_credits?: number | null
        }
      }
      workflows: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          json: Json | null
          sticky_notes: Json | null
          status: 'pending' | 'ready' | 'error' | 'complete' | null
          created_at: string
          updated_at: string
          workflow_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          json?: Json | null
          sticky_notes?: Json | null
          status?: 'pending' | 'ready' | 'error' | 'complete' | null
          created_at?: string
          updated_at?: string
          workflow_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          json?: Json | null
          sticky_notes?: Json | null
          status?: 'pending' | 'ready' | 'error' | 'complete' | null
          created_at?: string
          updated_at?: string
          workflow_url?: string | null
        }
      }
      feedback: {
        Row: {
          id: string
          user_id: string
          content: string
          type: 'bug' | 'feature' | 'comment'
          related_workflow_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          type: 'bug' | 'feature' | 'comment'
          related_workflow_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          type?: 'bug' | 'feature' | 'comment'
          related_workflow_id?: string | null
          created_at?: string
        }
      }
      profile: {
        Row: {
          id: string
          user_id: string
          company_or_project: string | null
          usage_intent: string | null
          marketing_source: string | null
          n8n_base_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_or_project?: string | null
          usage_intent?: string | null
          marketing_source?: string | null
          n8n_base_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_or_project?: string | null
          usage_intent?: string | null
          marketing_source?: string | null
          n8n_base_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          main_provider: string | null
          fallback_provider: string | null
          anthropic_key: string | null
          openai_key: string | null
          openrouter_key: string | null
          google_key: string | null
          anthropic_key_name: string | null
          openai_key_name: string | null
          openrouter_key_name: string | null
          google_key_name: string | null
          use_own_api_keys: boolean
          onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          main_provider?: string | null
          fallback_provider?: string | null
          anthropic_key?: string | null
          openai_key?: string | null
          openrouter_key?: string | null
          google_key?: string | null
          anthropic_key_name?: string | null
          openai_key_name?: string | null
          openrouter_key_name?: string | null
          google_key_name?: string | null
          use_own_api_keys?: boolean
          onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          main_provider?: string | null
          fallback_provider?: string | null
          anthropic_key?: string | null
          openai_key?: string | null
          openrouter_key?: string | null
          google_key?: string | null
          anthropic_key_name?: string | null
          openai_key_name?: string | null
          openrouter_key_name?: string | null
          google_key_name?: string | null
          use_own_api_keys?: boolean
          onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'purchase' | 'usage' | 'refund' | 'bonus'
          amount: number
          description: string | null
          workflow_id: string | null
          stripe_payment_intent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'purchase' | 'usage' | 'refund' | 'bonus'
          amount: number
          description?: string | null
          workflow_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'purchase' | 'usage' | 'refund' | 'bonus'
          amount?: number
          description?: string | null
          workflow_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_plan: 'free' | 'starter' | 'pro' | 'power'
      feedback_type: 'bug' | 'feature' | 'comment'
      workflow_status: 'pending' | 'ready' | 'error' | 'complete'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 