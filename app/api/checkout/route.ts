import { NextRequest, NextResponse } from 'next/server';
import { LHB_CONFIG } from '@/lib/lhb-config';

interface CartItem {
  id: string;
  name: string;
  price: number; // dollars
  qty: number;
  image: string;
}

export async function POST(req: NextRequest) {
  const backendUrl = process.env.OUTSYDE_API_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: 'Backend URL not configured.' }, { status: 500 });
  }

  let body: { items?: CartItem[]; customerEmail?: string; shippingAddress?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const rawItems: CartItem[] = body.items ?? [];
  if (!rawItems.length) {
    return NextResponse.json({ error: 'No items in cart.' }, { status: 400 });
  }

  // Transform LHB cart items to the shape expected by POST /api/cart/payment-intent.
  // Each item needs vendorId (= LHB's businessId), productId, name, priceCents, quantity.
  const backendItems = rawItems.map(item => ({
    vendorId: LHB_CONFIG.businessId,
    productId: item.id,
    name: item.name,
    priceCents: Math.round(item.price * 100),
    quantity: item.qty,
  }));

  const backendBody: Record<string, unknown> = {
    items: backendItems,
  };

  // Forward shipping address if the frontend supplied one.
  if (body.shippingAddress) {
    backendBody.shippingAddress = body.shippingAddress;
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${backendUrl}/api/cart/payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward the auth cookie so the backend can identify the user.
        Cookie: req.headers.get('cookie') ?? '',
      },
      body: JSON.stringify(backendBody),
    });
  } catch {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 });
  }

  const data = await backendRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendRes.status });
}
