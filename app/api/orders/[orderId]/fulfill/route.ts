import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';
import { detectCarrier, buildTrackingUrl, type Carrier } from '@/lib/lhb-config';
import { sendShipmentNotificationEmail } from '@/lib/email';
import { isAdminEmail } from '@/lib/auth-utils';

const BACKEND = process.env.OUTSYDE_API_URL!

async function getAuthUser(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (!auth) return null
  const res = await fetch(`${BACKEND}/api/auth/me`, { headers: { Authorization: auth } })
  if (!res.ok) return null
  const data = await res.json()
  return data.user ?? (data.id ? data : null)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const user = await getAuthUser(req)
  if (!user || (user.role !== 'vendor' && user.role !== 'admin' && !isAdminEmail(user.email ?? ''))) {
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

  const rows = await sql`
    UPDATE orders
    SET
      status          = 'shipped',
      tracking_number = ${trackingNumber.trim()},
      carrier         = ${resolvedCarrier}
    WHERE id = ${orderId}
    RETURNING
      id, order_number, customer_id, items, total_amount,
      tracking_number, carrier, shipping_address, status
  `;

  if (!rows[0]) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const order = rows[0] as any;

  sendShipmentNotificationEmail({
    orderId:      order.id,
    orderNumber:  order.order_number,
    customerName: '',
    customerEmail: '',
    items:        order.items as Array<{ name: string; qty: number; price: number }>,
    totalCents:   order.total_amount,
    shippingAddress: { line1: order.shipping_address ?? '', city: '', state: '', zip: '' },
    trackingNumber: trackingNumber.trim(),
    carrier:        resolvedCarrier,
    trackingUrl,
  }).catch((err) => console.error('[LHB] shipment email failed:', err));

  return NextResponse.json({ success: true, order: { ...order, tracking_url: trackingUrl } });
}
