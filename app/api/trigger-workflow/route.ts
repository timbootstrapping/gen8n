import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Webhook payload (without sensitive data):", {
      workflow_id: body.workflow_id,
      name: body.name,
      user_id: body.user_id,
      // Don't log sensitive information
    });

    // Validate required fields
    if (!body.user_id || !body.workflow_id) {
      return new NextResponse("Missing required fields: user_id or workflow_id", { status: 400 });
    }

    // Fetch API keys securely from Supabase
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('settings')
      .select('main_provider, fallback_provider, anthropic_key, openai_key, openrouter_key, google_key')
      .eq('user_id', body.user_id)
      .single();

    if (settingsError) {
      console.error("Error fetching user settings:", settingsError);
      return new NextResponse("Error fetching user settings", { status: 500 });
    }

    // Build API keys object (only include non-null keys)
    const api_keys: Record<string, string> = {};
    if (settings.anthropic_key) api_keys.anthropic = settings.anthropic_key;
    if (settings.openai_key) api_keys.openai = settings.openai_key;
    if (settings.openrouter_key) api_keys.openrouter = settings.openrouter_key;
    if (settings.google_key) api_keys.google = settings.google_key;

    // Check if user has at least one API key configured
    if (Object.keys(api_keys).length === 0) {
      return new NextResponse("No API keys configured. Please add API keys in settings.", { status: 400 });
    }

    // Build the complete payload for the external webhook
    const webhookPayload = {
      ...body, // Includes workflow_id, name, description, nodes, base_url, user_id
      api_keys,
      main_provider: settings.main_provider || 'anthropic',
      fallback_provider: settings.fallback_provider || null,
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

    return new NextResponse(text, { status: res.status });
  } catch (err) {
    console.error("Workflow Trigger Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
