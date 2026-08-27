import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.OUTSYDE_API_URL;
const BIZ_ID = process.env.OUTSYDE_BUSINESS_ID;

function proxyHeaders(req: NextRequest): Record<string, string> {
  const auth = req.cookies.get('outsyde_access_token')?.value;
  const cookieHeader = req.headers.get('cookie');
  return {
    'Content-Type': 'application/json',
    'x-business-id': BIZ_ID ?? '',
    ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${BASE}/api/vendor/products`, {
      headers: proxyHeaders(req),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BASE}/api/vendor/products`, {
      method: 'POST',
      headers: proxyHeaders(req),
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 500 });
  }
}
