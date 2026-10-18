import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.OUTSYDE_API_URL!

export async function POST(req: NextRequest) {
  let body: { pointsToRedeem?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 })
  }

  const pointsToRedeem = body?.pointsToRedeem
  if (typeof pointsToRedeem !== 'number' || !Number.isInteger(pointsToRedeem) || pointsToRedeem <= 0) {
    return NextResponse.json({ success: false, error: 'Please choose a valid rewards option.' }, { status: 400 })
  }

  const token = req.cookies.get('outsyde_access_token')?.value
  const authHeader = req.headers.get('authorization')

  let res: Response
  try {
    res = await fetch(`${BACKEND}/api/points/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : token ? { Authorization: `Bearer ${token}` } : {}),
        Cookie: req.headers.get('cookie') ?? '',
      },
      body: JSON.stringify({ pointsToRedeem }),
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Service unavailable.' }, { status: 503 })
  }

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
