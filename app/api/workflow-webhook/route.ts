import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { workflow_id, json, sticky_notes, status } = body;

    const { error } = await supabaseAdmin
      .from('workflows')
      .update({ json, sticky_notes, status, updated_at: new Date().toISOString() })
      .eq('id', workflow_id);

    if (error) {
      console.error('Webhook update error', error);
      return new Response('Failed', { status: 500 });
    }

    return new Response('OK');
  } catch (err) {
    console.error('Webhook handler error', err);
    return new Response('Invalid payload', { status: 400 });
  }
} 