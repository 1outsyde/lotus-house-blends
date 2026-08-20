import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const rows = await sql`
    SELECT
      id, order_num,
      customer_name,
      status,
      tracking_number, tracking_carrier, tracking_url, shipped_at,
      total_cents, items,
      created_at
    FROM orders
    WHERE id = ${orderId}
  `;

  if (!rows[0]) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const o = rows[0] as any;
  return NextResponse.json({
    id:               o.id,
    orderNum:         o.order_num,
    customerName:     o.customer_name,
    status:           o.status,
    trackingNumber:   o.tracking_number,
    trackingCarrier:  o.tracking_carrier,
    trackingUrl:      o.tracking_url,
    shippedAt:        o.shipped_at,
    totalCents:       o.total_cents,
    items:            typeof o.items === 'string' ? JSON.parse(o.items) : (o.items ?? []),
    createdAt:        o.created_at,
  });
}
