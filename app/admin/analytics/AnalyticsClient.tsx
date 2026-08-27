'use client'

import { useState, useCallback } from 'react'

interface StatData {
  orderCount: number
  monthlyRevenueCents: number
  averageRating: number
}

interface DayData {
  date: string
  label: string
  revenue_cents: number
  order_count: number
}

interface PeriodData {
  label: string
  revenue_cents: number
  order_count: number
}

interface ForecastData {
  forecast_low: number
  forecast_high: number
  projected_month: number
  confidence: number
  mtd_cents: number
}

interface YoYMonth {
  month: string
  label: string
  revenue_cents: number
  yoy_revenue_cents: number
  yoy_delta: number
}

interface AnalyticsClientProps {
  stats: StatData | null
  dailyData: DayData[]
  weeklyData: PeriodData[]
  monthlyData: PeriodData[]
  forecast: ForecastData | null
  yoy: YoYMonth[]
}

type PeriodKey = 'daily' | 'weekly' | 'monthly'

const MOSS = '#1E3020'
const GOLD = '#B8831A'
const PARCHMENT = '#F2EBD9'

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function fmtShort(cents: number): string {
  const dollars = cents / 100
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(1)}k`
  return `$${dollars.toFixed(0)}`
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: '#fff',
      border: `1px solid rgba(30,48,32,0.1)`,
      borderRadius: 8,
      padding: '20px 24px',
      flex: '1 1 180px',
      minWidth: 160,
    }}>
      <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.5)', margin: '0 0 8px' }}>{label}</p>
      <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.9rem', fontWeight: 600, color: MOSS, margin: 0, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.7rem', color: 'rgba(30,48,32,0.4)', margin: '5px 0 0' }}>{sub}</p>}
    </div>
  )
}

function BarChart({ data }: { data: PeriodData[] }) {
  const [hovered, setHovered] = useState<number | null>(null)

  if (data.length === 0) {
    return (
      <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: 'rgba(30,48,32,0.35)', textAlign: 'center', padding: '32px 0' }}>
        No data available
      </p>
    )
  }

  const maxVal = Math.max(...data.map(d => d.revenue_cents), 1)
  const chartH = 200
  const barWidth = Math.max(16, Math.min(48, Math.floor(560 / data.length) - 8))

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: chartH + 28, padding: '0 4px', minWidth: Math.max(480, data.length * (barWidth + 8)) }}>
        {data.map((d, i) => {
          const barH = Math.max(4, Math.round((d.revenue_cents / maxVal) * chartH))
          const isHovered = hovered === i
          return (
            <div
              key={i}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 auto', cursor: 'default', position: 'relative' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  bottom: barH + 28 + 6,
                  background: MOSS,
                  color: PARCHMENT,
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '0.68rem',
                  padding: '4px 8px',
                  borderRadius: 4,
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                  pointerEvents: 'none',
                }}>
                  {fmt(d.revenue_cents)}
                  {d.order_count != null && <span style={{ opacity: 0.7 }}> · {d.order_count} orders</span>}
                </div>
              )}
              <div style={{
                width: '80%',
                height: barH,
                background: isHovered ? '#9a6d15' : GOLD,
                borderRadius: '3px 3px 0 0',
                transition: 'background 0.1s',
              }} />
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', color: 'rgba(30,48,32,0.45)', margin: '4px 0 0', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                {d.label}
              </p>
            </div>
          )
        })}
      </div>
      {/* Y axis hint */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Jost, sans-serif', fontSize: '0.58rem', color: 'rgba(30,48,32,0.35)', marginTop: 4, padding: '0 4px' }}>
        <span>$0</span>
        <span>{fmtShort(maxVal)}</span>
      </div>
    </div>
  )
}

function exportCSV(yoy: YoYMonth[], period: PeriodKey) {
  const header = 'Month,Revenue,Prior Year Revenue,YoY Delta %'
  const rows = yoy.map(r =>
    [r.label || r.month, (r.revenue_cents / 100).toFixed(2), (r.yoy_revenue_cents / 100).toFixed(2), r.yoy_delta?.toFixed(1) ?? ''].join(',')
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `analytics-${period}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AnalyticsClient({ stats, dailyData, weeklyData, monthlyData, forecast, yoy }: AnalyticsClientProps) {
  const [period, setPeriod] = useState<PeriodKey>('weekly')

  const chartData: PeriodData[] = period === 'daily'
    ? (dailyData as DayData[]).map(d => ({ label: d.label || d.date, revenue_cents: d.revenue_cents, order_count: d.order_count }))
    : period === 'weekly' ? weeklyData
    : monthlyData

  const handleExport = useCallback(() => exportCSV(yoy, period), [yoy, period])

  const avgOrderCents = stats && stats.orderCount > 0
    ? Math.round(stats.monthlyRevenueCents / stats.orderCount)
    : 0

  const isEmpty = !stats && dailyData.length === 0 && weeklyData.length === 0 && monthlyData.length === 0 && !forecast && yoy.length === 0

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2rem', fontWeight: 500, color: MOSS, margin: '0 0 4px' }}>Analytics</h1>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: 'rgba(30,48,32,0.5)', margin: 0 }}>Sales performance overview</p>
        </div>
        {yoy.length > 0 && (
          <button
            onClick={handleExport}
            style={{
              fontFamily: 'Jost, sans-serif',
              fontSize: '0.68rem',
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              background: 'transparent',
              border: `1px solid ${GOLD}`,
              color: GOLD,
              padding: '8px 16px',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Section A — Stat Cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 36 }}>
        <StatCard
          label="Monthly Revenue"
          value={stats ? fmt(stats.monthlyRevenueCents) : '—'}
        />
        <StatCard
          label="Orders (MTD)"
          value={stats ? String(stats.orderCount) : '—'}
        />
        <StatCard
          label="Avg Order Value"
          value={stats && stats.orderCount > 0 ? fmt(avgOrderCents) : '—'}
        />
        <StatCard
          label="Avg Rating"
          value={stats ? (stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—') : '—'}
          sub={stats && stats.averageRating > 0 ? 'out of 5' : undefined}
        />
      </div>

      {/* Section B — Performance Chart */}
      <div style={{ background: '#fff', border: `1px solid rgba(30,48,32,0.1)`, borderRadius: 8, padding: '24px 24px 20px', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem', fontWeight: 500, color: MOSS, margin: 0 }}>Performance</h2>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['daily', 'weekly', 'monthly'] as PeriodKey[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  fontFamily: 'Jost, sans-serif',
                  fontSize: '0.62rem',
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  background: period === p ? MOSS : 'transparent',
                  color: period === p ? PARCHMENT : 'rgba(30,48,32,0.5)',
                  border: `1px solid ${period === p ? MOSS : 'rgba(30,48,32,0.2)'}`,
                  padding: '5px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <BarChart data={chartData} />
      </div>

      {/* Section C — Revenue Forecast */}
      {forecast && forecast.projected_month > 0 && (
        <div style={{ background: '#fff', border: `1px solid rgba(30,48,32,0.1)`, borderRadius: 8, padding: '24px', marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem', fontWeight: 500, color: MOSS, margin: '0 0 16px' }}>Revenue Forecast</h2>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.5)', margin: '0 0 4px' }}>Projected Range</p>
              <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 600, color: MOSS, margin: 0 }}>
                {fmt(forecast.forecast_low)} – {fmt(forecast.forecast_high)}
              </p>
            </div>
            {forecast.mtd_cents != null && (
              <div>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.5)', margin: '0 0 4px' }}>Month-to-Date</p>
                <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 600, color: MOSS, margin: 0 }}>
                  {fmt(forecast.mtd_cents)}
                </p>
              </div>
            )}
            {forecast.confidence != null && (
              <div>
                <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.65rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.5)', margin: '0 0 4px' }}>Confidence</p>
                <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 600, color: GOLD, margin: 0 }}>
                  {forecast.confidence == null
                    ? '—'
                    : forecast.confidence <= 1
                      ? `${(forecast.confidence * 100).toFixed(0)}%`
                      : `${Math.round(forecast.confidence)}%`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section D — Year Over Year */}
      {yoy.length > 0 && (
        <div style={{ background: '#fff', border: `1px solid rgba(30,48,32,0.1)`, borderRadius: 8, padding: '24px', marginBottom: 28 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem', fontWeight: 500, color: MOSS, margin: '0 0 16px' }}>Year Over Year</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Jost, sans-serif', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid rgba(30,48,32,0.1)` }}>
                  {['Month', 'Revenue', 'Prior Year', 'Change'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 12px 10px', fontSize: '0.62rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.45)', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {yoy.map((row, i) => {
                  const delta = row.yoy_delta
                  const positive = delta >= 0
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid rgba(30,48,32,0.06)` }}>
                      <td style={{ padding: '10px 12px', color: MOSS }}>{row.label || row.month}</td>
                      <td style={{ padding: '10px 12px', color: MOSS }}>{fmt(row.revenue_cents)}</td>
                      <td style={{ padding: '10px 12px', color: 'rgba(30,48,32,0.55)' }}>{fmt(row.yoy_revenue_cents)}</td>
                      <td style={{ padding: '10px 12px', color: delta == null ? 'rgba(30,48,32,0.4)' : positive ? '#2d7a3a' : '#c0392b', fontWeight: 500 }}>
                        {delta != null ? `${positive ? '+' : ''}${delta.toFixed(1)}%` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.4rem', color: 'rgba(30,48,32,0.35)', margin: '0 0 8px' }}>No analytics data yet</p>
          <p style={{ fontFamily: 'Jost, sans-serif', fontSize: '0.78rem', color: 'rgba(30,48,32,0.3)', margin: 0 }}>Data will appear once orders are placed.</p>
        </div>
      )}
    </div>
  )
}
