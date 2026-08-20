import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import sql from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json({ error: 'Stripe secret key is not configured.' }, { status: 500 });
  }

  const stripe = new Stripe(key, { apiVersion: '2026-07-29.dahlia' });

  try {
    const body = await req.json();
    const {
      paymentIntentId,
      customerName,
      customerEmail,
      shippingName,
      shippingLine1,
      shippingLine2 = null,
      shippingCity,
      shippingState,
      shippingZip,
      billingSameAsShipping = true,
      billingName = null,
      billingLine1 = null,
      billingLine2 = null,
      billingCity = null,
      billingState = null,
      billingZip = null,
      items,
      subtotalCents,
      totalCents,
    } = body;

    // Verify payment succeeded before saving the order
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not confirmed' }, { status: 400 });
    }

    const rows = await sql`
      INSERT INTO orders (
        customer_name, customer_email,
        shipping_name, shipping_line1, shipping_line2,
        shipping_city, shipping_state, shipping_zip, shipping_country,
        billing_same_as_shipping,
        billing_name, billing_line1, billing_line2,
        billing_city, billing_state, billing_zip, billing_country,
        items, subtotal_cents, total_cents,
        stripe_payment_intent_id, stripe_payment_status, status
      ) VALUES (
        ${customerName}, ${customerEmail},
        ${shippingName}, ${shippingLine1}, ${shippingLine2},
        ${shippingCity}, ${shippingState}, ${shippingZip}, 'US',
        ${billingSameAsShipping},
        ${billingName}, ${billingLine1}, ${billingLine2},
        ${billingCity}, ${billingState}, ${billingZip}, ${billingSameAsShipping ? null : 'US'},
        ${JSON.stringify(items)}, ${subtotalCents}, ${totalCents},
        ${paymentIntentId}, ${pi.status}, 'paid'
      )
      RETURNING id
    `;

    const orderId = rows[0].id as string;

    // Fire confirmation email to vendor + admin (non-blocking)
    sendOrderConfirmationEmail({
      orderId,
      customerName,
      customerEmail,
      items: (items as Array<{ name: string; qty: number; price: number }>),
      totalCents,
      shippingAddress: {
        line1: shippingLine1,
        city:  shippingCity,
        state: shippingState,
        zip:   shippingZip,
      },
    }).catch((err) => console.error('[LHB] order confirmation email failed:', err));

    return NextResponse.json({ orderId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
