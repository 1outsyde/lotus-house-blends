import { NextRequest, NextResponse } from 'next/server';
import { detectCarrier } from '@/lib/lhb-config';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const token = req.cookies.get('outsyde_access_token')?.value;
  const { orderId } = await params;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  // Verify role
  let meRes: Response;
  try {
    meRes = await fetch(`${process.env.OUTSYDE_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 500 });
  }

  if (!meRes.ok) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const me = await meRes.json() as { user?: { role?: string } };
  const role = me?.user?.role;
  if (role !== 'vendor' && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  // Parse body
  let trackingNumber: string;
  let carrierInput: string | undefined;
  try {
    const body = await req.json() as { trackingNumber?: string; carrier?: string };
    trackingNumber = (body.trackingNumber ?? '').trim();
    carrierInput = body.carrier;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!trackingNumber) {
    return NextResponse.json({ error: 'trackingNumber is required.' }, { status: 400 });
  }

  const resolvedCarrier = carrierInput ?? detectCarrier(trackingNumber);

  // Proxy to outsyde-backend
  let backendRes: Response;
  try {
    backendRes = await fetch(`${process.env.OUTSYDE_API_URL}/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ trackingNumber, carrier: resolvedCarrier, status: 'shipped' }),
    });
  } catch {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 500 });
  }

  const data = await backendRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendRes.status });
}
