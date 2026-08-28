import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const OUTSYDE_API_URL = process.env.OUTSYDE_API_URL!
const OUTSYDE_BUSINESS_ID = process.env.OUTSYDE_BUSINESS_ID!

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('outsyde_access_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')

  try {
    const res = await fetch(`${OUTSYDE_API_URL}/api/vendor/subscription`, {
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': OUTSYDE_BUSINESS_ID,
        Authorization: `Bearer ${token}`,
        Cookie: cookieHeader,
      },
      cache: 'no-store',
    })
    const data = await res.json().catch(() => null)
    return NextResponse.json(data ?? { subscription: null }, { status: res.ok ? 200 : res.status })
  } catch {
    return NextResponse.json({ subscription: null }, { status: 500 })
  }
}
