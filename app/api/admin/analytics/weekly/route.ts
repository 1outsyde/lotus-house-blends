import { NextRequest, NextResponse } from 'next/server';

const OUTSYDE_API_URL = process.env.OUTSYDE_API_URL!;
const OUTSYDE_BUSINESS_ID = process.env.OUTSYDE_BUSINESS_ID!;

function proxyHeaders(req: NextRequest): Record<string, string> {
  const auth = req.cookies.get('outsyde_access_token')?.value;
  const cookieHeader = req.headers.get('cookie');
  return {
    'Content-Type': 'application/json',
    'x-business-id': OUTSYDE_BUSINESS_ID,
    ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${OUTSYDE_API_URL}/api/vendor/analytics/weekly`, {
      headers: proxyHeaders(req),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 500 });
  }
}
