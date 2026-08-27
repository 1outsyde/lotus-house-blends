'use client';
import { useState } from 'react';

interface Props {
  dateMap: Record<string, string[]>;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function dotColor(status: string): string {
  if (status === 'paid' || status === 'pending') return '#B8831A';
  if (status === 'shipped') return '#2D7A47';
  if (status === 'delivered') return '#1A5C35';
  if (status === 'cancelled') return '#C0392B';
  return '#888';
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function DashboardCalendar({ dateMap }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from<null>({ length: firstDow }).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const btnSt = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#1E3020',
    fontSize: '1.4rem',
    lineHeight: 1,
    padding: '2px 10px',
    borderRadius: 4,
    fontFamily: 'sans-serif',
  };

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 36 }}>
      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={prev} style={btnSt} aria-label="Previous month">‹</button>
        <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 500, color: '#1E3020', margin: 0 }}>
          {MONTHS[month]} {year}
        </p>
        <button onClick={next} style={btnSt} aria-label="Next month">›</button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAYS.map(d => (
          <div
            key={d}
            style={{ textAlign: 'center', fontSize: '0.58rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.35)', padding: '2px 0', fontFamily: 'Jost, sans-serif' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 2 }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} style={{ padding: '6px 0' }} />;

          const ds = toDateStr(year, month, day);
          const statuses = dateMap[ds] ?? [];
          const uniqueStatuses = [...new Set(statuses)].slice(0, 3);
          const isToday = ds === todayStr;

          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3px 0' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: isToday ? '#1E3020' : 'transparent',
                color: isToday ? '#F2EBD9' : '#1E3020',
                fontSize: '0.78rem',
                fontFamily: 'Jost, sans-serif',
              }}>
                {day}
              </span>
              {uniqueStatuses.length > 0 && (
                <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                  {uniqueStatuses.map((s, i) => (
                    <span key={i} style={{
                      display: 'inline-block',
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: dotColor(s),
                      flexShrink: 0,
                    }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(30,48,32,0.08)' }}>
        {[
          { color: '#B8831A', label: 'Paid' },
          { color: '#2D7A47', label: 'Shipped' },
          { color: '#1A5C35', label: 'Delivered' },
          { color: '#C0392B', label: 'Cancelled' },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.63rem', color: 'rgba(30,48,32,0.52)', fontFamily: 'Jost, sans-serif', letterSpacing: '.05em' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
