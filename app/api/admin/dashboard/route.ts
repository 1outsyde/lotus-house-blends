import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');

  let statsRes: Response, ordersRes: Response;
  try {
    [statsRes, ordersRes] = await Promise.all([
      fetch(`${process.env.OUTSYDE_API_URL}/api/business/stats`, {
        headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) },
      }),
      fetch(`${process.env.OUTSYDE_API_URL}/api/business/orders`, {
        headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) },
      }),
    ]);
  } catch {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 500 });
  }

  const stats = await statsRes.json().catch(() => ({}));
  const orders = await ordersRes.json().catch(() => ({}));
  return NextResponse.json({ stats: stats.stats ?? null, orders: orders.orders ?? [] });
}
