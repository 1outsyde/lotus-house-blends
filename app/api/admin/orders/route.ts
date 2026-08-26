import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');

  let backendRes: Response;
  try {
    backendRes = await fetch(`${process.env.OUTSYDE_API_URL}/api/business/orders`, {
      headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) },
    });
  } catch {
    return NextResponse.json({ error: 'Service unavailable.' }, { status: 500 });
  }

  const data = await backendRes.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendRes.status });
}
