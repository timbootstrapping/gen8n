import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { validateGenerationRequest } from "@/lib/creditHelpers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Workflow generation request:", {
      workflow_id: body.workflow_id,
      name: body.name,
      user_id: body.user_id,
    });

    // Get user ID from request body (we'll need to verify this through headers/session)
    const userId = body.user_id;
    
    if (!userId) {
      return new NextResponse("User ID required", { status: 401 });
    }

    // Get access token from cookies or headers
    let access_token: string | null = null;
    // Try cookies first
    const cookieStore = cookies();
    access_token = cookieStore.get('sb-access-token')?.value || null;
    // Fallback to Authorization header
    if (!access_token) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        access_token = authHeader.replace('Bearer ', '');
      }
    }
    if (!access_token) {
      return new NextResponse("Not authenticated", { status: 401 });
    }
    // Create a session-aware Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${access_token}` } }
    });

    // Validate required fields
    if (!body.workflow_id) {
      return new NextResponse("Missing required field: workflow_id", { status: 400 });
    }

    // Validate if user can generate workflows (with RLS)
    const validation = await validateGenerationRequest(userId, supabase);
    
    if (!validation.canGenerate) {
      return new NextResponse(
        JSON.stringify({ 
          error: validation.reason,
          useOwnKeys: validation.useOwnKeys,
          availableCredits: validation.availableCredits,
          missingProviders: validation.missingProviders
        }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    let apiKeys: Record<string, string> = {};
    let useOwnKeys = validation.useOwnKeys;
    let mainProvider = 'anthropic';
    let fallbackProvider = 'openai';

    if (useOwnKeys) {
      // Fetch user's API keys and provider preferences
      const { data: settings, error: settingsError } = await supabaseAdmin
        .from('settings')
        .select('main_provider, fallback_provider, anthropic_key, openai_key, openrouter_key, google_key')
        .eq('user_id', userId)
        .single();

      if (settingsError) {
        console.error("Error fetching user settings:", settingsError);
        return new NextResponse("Error fetching user settings", { status: 500 });
      }

      // Use user's provider preferences
      mainProvider = settings.main_provider || 'anthropic';
      fallbackProvider = settings.fallback_provider || 'openai';

      // Build API keys object (only include non-null keys)
      if (settings.anthropic_key) apiKeys.anthropic = settings.anthropic_key;
      if (settings.openai_key) apiKeys.openai = settings.openai_key;
      if (settings.openrouter_key) apiKeys.openrouter = settings.openrouter_key;
      if (settings.google_key) apiKeys.google = settings.google_key;

      // Double-check that we have both main and fallback provider keys
      if (!apiKeys[mainProvider]) {
        return new NextResponse(`${mainProvider} API key is required as main provider`, { status: 400 });
      }
      if (!apiKeys[fallbackProvider]) {
        return new NextResponse(`${fallbackProvider} API key is required as fallback provider`, { status: 400 });
      }
    } else {
      // Using Gen8n's API keys - these should be stored in environment variables
      apiKeys = {
        anthropic: process.env.GEN8N_ANTHROPIC_KEY || '',
        openai: process.env.GEN8N_OPENAI_KEY || '',
        openrouter: process.env.GEN8N_OPENROUTER_KEY || '',
        google: process.env.GEN8N_GOOGLE_KEY || ''
      };

      // Filter out empty keys
      apiKeys = Object.fromEntries(
        Object.entries(apiKeys).filter(([_, value]) => value !== '')
      );

      if (Object.keys(apiKeys).length === 0) {
        return new NextResponse("Gen8n API keys not configured", { status: 500 });
      }

      // Gen8n uses its own provider preferences (default to anthropic + openai)
      mainProvider = 'anthropic';
      fallbackProvider = 'openai';
    }

    // Fetch n8n base URL from profile table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profile')
      .select('n8n_base_url')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return new NextResponse("Error fetching user profile", { status: 500 });
    }

    // Check if n8n base URL is configured
    if (!profile?.n8n_base_url) {
      return new NextResponse("n8n Base URL not configured. Please set it in your settings.", { status: 400 });
    }

    // Build the complete payload for the external webhook
    const webhookPayload = {
      ...body,
      user_id: userId, // Use authenticated user ID
      base_url: profile.n8n_base_url,
      api_keys: apiKeys,
      main_provider: mainProvider,
      fallback_provider: fallbackProvider,
      use_own_keys: useOwnKeys
    };

    // Send to external n8n webhook
    const res = await fetch(
      "https://n8n.ximus.io/webhook-test/n8n-developer-trigger",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      }
    );

    const text = await res.text();
    
    if (!res.ok) {
      console.error("External webhook error:", res.status, text);
      return new NextResponse(`External webhook failed: ${text}`, { status: res.status });
    }

    // Note: Credit deduction/reservation is now handled in the n8n workflow
    // The workflow will:
    // 1. Reserve 1 credit at the start (if using Gen8n credits)
    // 2. Remove the credit from reserved_credits when generation succeeds
    // 3. Refund the credit to credits and remove from reserved_credits if generation fails

    return new NextResponse(text, { 
      status: res.status,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error("Workflow Trigger Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
