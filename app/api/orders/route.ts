import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import sql from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/email';

const LHB_BUSINESS_ID = '8523e3c5-fc07-461b-9452-087d2b4aada6';

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'Stripe secret key not configured.' },
      { status: 500 }
    );
  }

  const stripe = new Stripe(key, { apiVersion: '2026-07-29.dahlia' });

  try {
    const body = await req.json();
    const {
      paymentIntentId,
      customerId,
      shippingAddress,
      items,
      totalCents,
    } = body as {
      paymentIntentId: string;
      customerId: string;
      shippingAddress: string;
      items: Array<{ id: string; name: string; qty: number; price: number; image: string }>;
      totalCents: number;
    };

    // Validate required fields
    if (!paymentIntentId || !customerId || !items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // Verify payment succeeded before writing the order
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not confirmed.' },
        { status: 400 }
      );
    }

    // INSERT using only columns that exist in the shared Outsyde orders table
    const rows = await sql`
      INSERT INTO orders (
        business_id,
        customer_id,
        items,
        total_amount,
        stripe_payment_intent_id,
        shipping_address,
        status
      ) VALUES (
        ${LHB_BUSINESS_ID},
        ${customerId},
        ${JSON.stringify(items)},
        ${totalCents},
        ${paymentIntentId},
        ${shippingAddress ?? ''},
        'paid'
      )
      RETURNING id, order_number
    `;

    if (!rows[0]) {
      return NextResponse.json(
        { error: 'Failed to create order.' },
        { status: 500 }
      );
    }

    const orderId     = rows[0].id as string;
    const orderNumber = rows[0].order_number as number;

    // TODO: customerName and customerEmail are no longer collected at checkout.
    // Update sendOrderConfirmationEmail to accept customerId and fetch details from backend.
    // TODO: shippingAddress is a flat string; email template expects { line1, city, state, zip }.
    sendOrderConfirmationEmail({
      orderId,
      orderNumber,
      customerName: '',
      customerEmail: '',
      items,
      totalCents,
      shippingAddress: { line1: shippingAddress ?? '', city: '', state: '', zip: '' },
    }).catch((err) =>
      console.error('[LHB] order confirmation email failed:', err)
    );

    return NextResponse.json({ orderId, orderNumber });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[LHB] /api/orders error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
