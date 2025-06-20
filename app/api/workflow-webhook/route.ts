import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { workflow_id, json, sticky_notes, status } = await req.json();

    if (!workflow_id) {
      console.error('Missing workflow_id');
      return new Response('Missing workflow_id', { status: 400 });
    }

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