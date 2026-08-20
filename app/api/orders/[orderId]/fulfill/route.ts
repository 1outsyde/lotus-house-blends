import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import sql from '@/lib/db';
import { detectCarrier, buildTrackingUrl, type Carrier } from '@/lib/lhb-config';
import { sendShipmentNotificationEmail } from '@/lib/backend-email';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !(session.user as any)?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId } = await params;
  const body = await req.json() as { trackingNumber?: string; carrier?: string };
  const { trackingNumber, carrier: carrierInput } = body;

  if (!trackingNumber?.trim()) {
    return NextResponse.json({ error: 'trackingNumber is required' }, { status: 400 });
  }

  const resolvedCarrier: Carrier = (carrierInput as Carrier) || detectCarrier(trackingNumber);
  const trackingUrl = buildTrackingUrl(resolvedCarrier, trackingNumber);
  const shippedAt = new Date().toISOString();

  const rows = await sql`
    UPDATE orders
    SET
      status           = 'shipped',
      tracking_number  = ${trackingNumber.trim()},
      tracking_carrier = ${resolvedCarrier},
      tracking_url     = ${trackingUrl},
      shipped_at       = ${shippedAt}
    WHERE id = ${orderId}
    RETURNING
      id, customer_name, customer_email,
      shipping_line1, shipping_city, shipping_state, shipping_zip,
      items, total_cents, tracking_number, tracking_carrier, tracking_url, shipped_at, status
  `;

  if (!rows[0]) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const order = rows[0] as any;

  // Dual email: vendor + admin + customer
  sendShipmentNotificationEmail({
    orderId:       order.id,
    customerName:  order.customer_name,
    customerEmail: order.customer_email,
    items:         order.items as Array<{ name: string; qty: number; price: number }>,
    totalCents:    order.total_cents,
    shippingAddress: {
      line1: order.shipping_line1,
      city:  order.shipping_city,
      state: order.shipping_state,
      zip:   order.shipping_zip,
    },
    trackingNumber,
    carrier:    resolvedCarrier,
    trackingUrl,
  }).catch((err) => console.error('[LHB] shipment email failed:', err));

  return NextResponse.json({ success: true, order });
}
