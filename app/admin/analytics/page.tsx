import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AnalyticsClient from './AnalyticsClient'

const OUTSYDE_API_URL = process.env.OUTSYDE_API_URL!
const OUTSYDE_BUSINESS_ID = process.env.OUTSYDE_BUSINESS_ID!

async function fetchBFF(token: string, cookieHeader: string, path: string) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(`${OUTSYDE_API_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-business-id': OUTSYDE_BUSINESS_ID,
        Authorization: `Bearer ${token}`,
        Cookie: cookieHeader,
      },
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

export default async function AnalyticsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('outsyde_access_token')?.value
  if (!token) redirect('/login?redirect=/admin/analytics')

  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')

  const [statsRaw, dailyRaw, weeklyRaw, monthlyRaw, forecastRaw, yoyRaw] = await Promise.all([
    fetchBFF(token, cookieHeader, '/api/business/stats'),
    fetchBFF(token, cookieHeader, '/api/vendor/analytics/daily'),
    fetchBFF(token, cookieHeader, '/api/vendor/analytics/weekly'),
    fetchBFF(token, cookieHeader, '/api/vendor/analytics/monthly'),
    fetchBFF(token, cookieHeader, '/api/vendor/analytics/revenue-forecast'),
    fetchBFF(token, cookieHeader, '/api/vendor/analytics/year-over-year'),
  ])

  const stats = statsRaw?.stats ?? null
  const dailyData = dailyRaw?.data ?? dailyRaw?.days ?? []
  const weeklyData = weeklyRaw?.data ?? weeklyRaw?.weeks ?? []
  const monthlyData = monthlyRaw?.data ?? monthlyRaw?.months ?? []
  const forecast = forecastRaw?.forecast ?? forecastRaw ?? null
  const yoy = yoyRaw?.data ?? yoyRaw?.months ?? []

  return (
    <AnalyticsClient
      stats={stats}
      dailyData={dailyData}
      weeklyData={weeklyData}
      monthlyData={monthlyData}
      forecast={forecast}
      yoy={yoy}
    />
  )
}
