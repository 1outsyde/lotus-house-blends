import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import SubscriptionClient from './SubscriptionClient'

const OUTSYDE_API_URL = process.env.OUTSYDE_API_URL!
const OUTSYDE_BUSINESS_ID = process.env.OUTSYDE_BUSINESS_ID!

async function fetchBFF(token: string, cookieHeader: string, path: string, auth = true) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    }
    if (auth) {
      headers['x-business-id'] = OUTSYDE_BUSINESS_ID
      headers['Authorization'] = `Bearer ${token}`
    }
    const res = await fetch(`${OUTSYDE_API_URL}${path}`, {
      headers,
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    if (!res.ok) return null
    return await res.json().catch(() => null)
  } catch {
    return null
  }
}

export default async function SubscriptionPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('outsyde_access_token')?.value
  if (!token) redirect('/login?redirect=/admin/subscription')

  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')

  const [subRaw, tiersRaw] = await Promise.all([
    fetchBFF(token, cookieHeader, '/api/vendor/subscription', true),
    fetchBFF(token, cookieHeader, '/api/subscription-tiers', false),
  ])

  const subscription = subRaw?.subscription ?? null
  const tiers = tiersRaw?.tiers ?? []

  return <SubscriptionClient subscription={subscription} tiers={tiers} />
}
