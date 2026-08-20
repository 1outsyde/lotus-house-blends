import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { LHB_CONFIG } from '@/lib/lhb-config';

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Stripe secret key is not configured.' }, { status: 500 });
  }

  const stripe = new Stripe(key, { apiVersion: '2026-07-29.dahlia' });

  try {
    const body = await req.json();
    const items: CartItem[] = body.items ?? [];
    const customerEmail: string = body.customerEmail ?? '';

    if (!items.length) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    const amount = Math.round(
      items.reduce((sum, item) => sum + item.price * item.qty, 0) * 100
    );

    const platformFee = Math.round(amount * 0.02);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      receipt_email: customerEmail || undefined,
      metadata: {
        businessId: LHB_CONFIG.businessId,
        items: JSON.stringify(items),
      },
      automatic_payment_methods: { enabled: true },
      // Route payment through Stripe Connect: 2% platform fee stays with Outsyde,
      // remainder transfers to LHB's connected account on capture.
      application_fee_amount: platformFee,
      transfer_data: {
        destination: LHB_CONFIG.stripeAccountId,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
