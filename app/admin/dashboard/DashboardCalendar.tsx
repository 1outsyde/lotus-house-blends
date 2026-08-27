'use client';
import { useState } from 'react';

interface DayEntry {
  status: string;
  orderNumber: number;
  amount: number;
}

interface Props {
  dateMap: Record<string, DayEntry[]>;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

// Spec: Pending=amber, Paid=blue, Shipped=green, Delivered=gray
function dotColor(status: string): string {
  if (status === 'pending')   return '#D4890A';
  if (status === 'paid')      return '#2563EB';
  if (status === 'shipped')   return '#2D7A47';
  if (status === 'delivered') return '#6B7280';
  if (status === 'cancelled') return '#C0392B';
  return '#9CA3AF';
}

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  pending:    { bg: 'rgba(212,137,10,0.12)',  text: '#9A6B0E' },
  paid:       { bg: 'rgba(37,99,235,0.10)',   text: '#1D4ED8' },
  shipped:    { bg: 'rgba(45,122,71,0.12)',   text: '#2D7A47' },
  delivered:  { bg: 'rgba(107,114,128,0.12)', text: '#4B5563' },
  cancelled:  { bg: 'rgba(192,57,43,0.10)',   text: '#C0392B' },
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatDateLabel(ds: string): string {
  const [y, m, d] = ds.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

export default function DashboardCalendar({ dateMap }: Props) {
  const now = new Date();
  const [year, setYear]               = useState(now.getFullYear());
  const [month, setMonth]             = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  }
  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  }

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from<null>({ length: firstDow }).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const navBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#1E3020',
    fontSize: '1.4rem',
    lineHeight: 1,
    padding: '2px 10px',
    borderRadius: 4,
  };

  const selectedEntries = selectedDate ? (dateMap[selectedDate] ?? []) : [];

  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 36 }}>
      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={prev} style={navBtn} aria-label="Previous month">‹</button>
        <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem', fontWeight: 500, color: '#1E3020', margin: 0 }}>
          {MONTHS[month]} {year}
        </p>
        <button onClick={next} style={navBtn} aria-label="Next month">›</button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.58rem', letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.35)', padding: '2px 0', fontFamily: 'Jost, sans-serif' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', rowGap: 2 }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} style={{ padding: '6px 0' }} />;

          const ds = toDateStr(year, month, day);
          const entries = dateMap[ds] ?? [];
          const uniqueStatuses = [...new Set(entries.map(e => e.status))].slice(0, 3);
          const isToday = ds === todayStr;
          const isSelected = ds === selectedDate;
          const hasOrders = entries.length > 0;

          return (
            <div
              key={idx}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3px 0' }}
              onClick={() => hasOrders ? setSelectedDate(isSelected ? null : ds) : undefined}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: isSelected ? '#B8831A' : isToday ? '#1E3020' : 'transparent',
                color: isSelected ? '#fff' : isToday ? '#F2EBD9' : '#1E3020',
                fontSize: '0.78rem',
                fontFamily: 'Jost, sans-serif',
                cursor: hasOrders ? 'pointer' : 'default',
                transition: 'background 0.12s',
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

      {/* Day popover */}
      {selectedDate && selectedEntries.length > 0 && (
        <div style={{ marginTop: 16, padding: '16px 20px', background: 'rgba(30,48,32,0.04)', borderRadius: 6, border: '1px solid rgba(30,48,32,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '0.95rem', fontWeight: 500, color: '#1E3020', margin: 0 }}>
              {formatDateLabel(selectedDate)}
            </p>
            <button
              onClick={() => setSelectedDate(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(30,48,32,0.4)', fontSize: '1.1rem', lineHeight: 1, padding: '0 2px' }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selectedEntries.map((entry, i) => {
              const badge = STATUS_BADGE[entry.status] ?? { bg: 'rgba(30,48,32,0.08)', text: 'rgba(30,48,32,0.6)' };
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(30,48,32,0.6)' }}>
                    #{String(entry.orderNumber).padStart(4, '0')}
                  </span>
                  <span style={{
                    fontSize: '0.6rem', letterSpacing: '.1em', textTransform: 'uppercase',
                    padding: '3px 8px', borderRadius: 2,
                    background: badge.bg, color: badge.text,
                    fontFamily: 'Jost, sans-serif',
                  }}>
                    {entry.status}
                  </span>
                  <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1rem', color: '#1E3020' }}>
                    ${(entry.amount / 100).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(30,48,32,0.08)' }}>
        {[
          { color: '#D4890A', label: 'Pending' },
          { color: '#2563EB', label: 'Paid' },
          { color: '#2D7A47', label: 'Shipped' },
          { color: '#6B7280', label: 'Delivered' },
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
