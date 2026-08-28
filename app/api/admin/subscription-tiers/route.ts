import { NextResponse } from 'next/server'

const OUTSYDE_API_URL = process.env.OUTSYDE_API_URL!

export async function GET() {
  try {
    const res = await fetch(`${OUTSYDE_API_URL}/api/subscription-tiers`, {
      cache: 'no-store',
    })
    const data = await res.json().catch(() => null)
    return NextResponse.json(data ?? { tiers: [] }, { status: res.ok ? 200 : res.status })
  } catch {
    return NextResponse.json({ tiers: [] }, { status: 500 })
  }
}
