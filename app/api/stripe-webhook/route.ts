import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.user_id;
    const creditQuantity = parseInt(session.metadata?.credit_quantity || '0');

    if (!userId || !creditQuantity) {
      console.error('Missing metadata in checkout session:', session.id);
      return;
    }

    // Calculate bonus credits based on quantity
    let bonusCredits = 0;
    if (creditQuantity >= 50) {
      bonusCredits = 15;
    } else if (creditQuantity >= 25) {
      bonusCredits = 5;
    } else if (creditQuantity >= 10) {
      bonusCredits = 2;
    }

    const totalCredits = creditQuantity + bonusCredits;

    // Add credits to user's account using the database function
    const { data, error } = await supabaseAdmin.rpc('update_user_credits', {
      p_user_id: userId,
      p_amount: totalCredits,
      p_transaction_type: 'purchase',
      p_description: `Purchased ${creditQuantity} credits${bonusCredits > 0 ? ` (+${bonusCredits} bonus)` : ''} via Stripe`
    });

    if (error) {
      console.error('Error adding credits:', error);
      return;
    }

    // Update the transaction with Stripe payment intent ID
    if (session.payment_intent) {
      const { error: updateError } = await supabaseAdmin
        .from('credit_transactions')
        .update({ 
          stripe_payment_intent_id: session.payment_intent as string 
        })
        .eq('user_id', userId)
        .eq('type', 'purchase')
        .eq('amount', totalCredits)
        .order('created_at', { ascending: false })
        .limit(1);

      if (updateError) {
        console.error('Error updating transaction with Stripe ID:', updateError);
      }
    }

    console.log(`Successfully added ${totalCredits} credits to user ${userId}`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
} 