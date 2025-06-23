import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const CREDIT_PRICE = 150; // $1.50 in cents

export async function POST(req: NextRequest) {
  try {
    const { quantity, user_id } = await req.json();

    if (!quantity || quantity < 1 || quantity > 1000) {
      return NextResponse.json(
        { error: 'Invalid quantity. Must be between 1 and 1000.' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    // Get user info for Stripe metadata
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', user_id)
      .single();

    const amount = quantity * CREDIT_PRICE;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Gen8n Credits (${quantity})`,
              description: `${quantity} workflow generation credits for Gen8n`,
            },
            unit_amount: CREDIT_PRICE,
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/settings?purchase=success`,
      cancel_url: `${req.nextUrl.origin}/settings?purchase=cancelled`,
      metadata: {
        user_id: user_id,
        credit_quantity: quantity.toString(),
        user_email: userData?.email || '',
      },
      customer_email: userData?.email || undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 