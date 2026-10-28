import { NextRequest, NextResponse } from 'next/server';
import { LHB_CONFIG } from '@/lib/lhb-config';
import { sanitizeLineAddons } from '@/lib/productAddons';

interface CartItem {
  id: string;
  name: string;
  price: number; // dollars
  qty: number;
  image: string;
  productId?: string;
  addons?: unknown;
}

export async function POST(req: NextRequest) {
  const backendUrl = process.env.OUTSYDE_API_URL;
  if (!backendUrl) {
    return NextResponse.json({ error: 'Backend URL not configured.' }, { status: 500 });
  }

  let body: { items?: CartItem[]; customerEmail?: string; shippingAddress?: Record<string, string>; promoCodeId?: unknown };
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
  // Add-on picks pass through as ids and text only; the backend prices and checks them (backend #371).
  const backendItems = [];
  for (const item of rawItems) {
    const addons = sanitizeLineAddons(item.addons);
    if (addons === null) {
      return NextResponse.json({ error: 'Something in your cart is no longer valid. Please remove it and add it again.' }, { status: 400 });
    }
    backendItems.push({
      vendorId: LHB_CONFIG.businessId,
      productId: typeof item.productId === 'string' && item.productId ? item.productId : item.id,
      name: item.name,
      priceCents: Math.round(item.price * 100),
      quantity: item.qty,
      ...(addons !== undefined ? { addons } : {}),
    });
  }

  const backendBody: Record<string, unknown> = {
    items: backendItems,
  };

  // Forward shipping address if the frontend supplied one.
  if (body.shippingAddress) {
    backendBody.shippingAddress = body.shippingAddress;
  }

  // Forward an Outsyde rewards code only when the customer picked one.
  // With no code the request is exactly as before.
  const promoCodeId =
    typeof body.promoCodeId === 'string' && body.promoCodeId.trim() ? body.promoCodeId.trim() : null;
  if (promoCodeId) {
    backendBody.promoCodeId = promoCodeId;
  }

  // The rewards code belongs to the signed in customer, so also send the
  // Bearer token (same pattern as /api/consumer/points) when a code is used.
  const token = req.cookies.get('outsyde_access_token')?.value;
  const authHeader = req.headers.get('authorization');
  const promoAuth: Record<string, string> = promoCodeId
    ? (authHeader ? { Authorization: authHeader } : token ? { Authorization: `Bearer ${token}` } : {})
    : {};

  let backendRes: Response;
  try {
    backendRes = await fetch(`${backendUrl}/api/cart/payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward the auth cookie so the backend can identify the user.
        Cookie: req.headers.get('cookie') ?? '',
        ...promoAuth,
      },
      body: JSON.stringify(backendBody),
    });
  } catch {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 503 });
  }

  const data = await backendRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendRes.status });
}
