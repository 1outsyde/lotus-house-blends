import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.OUTSYDE_API_URL;
const BIZ_ID = process.env.OUTSYDE_BUSINESS_ID;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = req.cookies.get('outsyde_access_token')?.value;
  const cookieHeader = req.headers.get('cookie');

  try {
    const res = await fetch(`${BASE}/api/vendor/products/${id}/go-live`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': BIZ_ID ?? '',
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 500 });
  }
}
