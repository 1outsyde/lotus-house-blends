import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.OUTSYDE_API_URL;

export async function POST(req: NextRequest) {
  try {
    const incoming = await req.formData();
    const forwarded = new FormData();
    for (const [key, value] of incoming.entries()) {
      forwarded.append(key, value);
    }
    forwarded.append('folder', 'products');

    const auth = req.cookies.get('outsyde_access_token')?.value;
    const cookieHeader = req.headers.get('cookie');

    const res = await fetch(`${BASE}/api/media/upload-image`, {
      method: 'POST',
      headers: {
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: forwarded,
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
  }
}
