'use client';

import { useState } from 'react';
import FulfillModal from './FulfillModal';
import { buildTrackingUrl, type Carrier } from '@/lib/lhb-config';

export interface OrderRow {
  id: string;
  order_number: number;
  customer_id: string;
  customer_name: string | null;
  items: Array<{ name: string; qty: number; price: number }>;
  total_amount: number;
  status: string;
  shipping_address: string | null;
  created_at: string;
  tracking_number: string | null;
  carrier: string | null;
  isNewest?: boolean;
}

function formatAddress(raw: string | object | null | undefined): string {
  if (!raw) return '—';
  try {
    const addr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!addr.line1 && !addr.city) return typeof raw === 'string' ? raw : '—';
    return `${addr.line1}\n${addr.city}, ${addr.state} ${addr.zipCode}`;
  } catch {
    return typeof raw === 'string' ? raw : '—';
  }
}

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  pending:    { bg: 'rgba(212,137,10,0.12)',  text: '#9A6B0E' },
  paid:       { bg: 'rgba(37,99,235,0.10)',   text: '#1D4ED8' },
  processing: { bg: 'rgba(37,99,235,0.10)',   text: '#1D4ED8' },
  shipped:    { bg: 'rgba(45,122,71,0.12)',   text: '#2D7A47' },
  delivered:  { bg: 'rgba(107,114,128,0.12)', text: '#4B5563' },
  cancelled:  { bg: 'rgba(192,57,43,0.10)',   text: '#C0392B' },
};

const UNFULFILLED = new Set(['paid', 'pending', 'processing']);

export default function OrdersClient({ initialOrders }: { initialOrders: OrderRow[] }) {
  const [filter, setFilter] = useState<'needs_shipping' | 'all'>('needs_shipping');
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [fulfilling, setFulfilling] = useState<OrderRow | null>(null);

  const displayed = filter === 'needs_shipping'
    ? orders.filter(o => UNFULFILLED.has(o.status))
    : orders;

  const pendingCount = orders.filter(o => UNFULFILLED.has(o.status)).length;

  function handleShipped(orderId: string, data: { trackingNumber: string; carrier: Carrier; trackingUrl: string | null }) {
    setOrders(prev => prev.map(o =>
      o.id === orderId
        ? { ...o, status: 'shipped', tracking_number: data.trackingNumber, carrier: data.carrier }
        : o
    ));
    setFulfilling(null);
  }

  const filterBtn = (active: boolean): React.CSSProperties => ({
    padding: '7px 16px',
    fontSize: '0.7rem',
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    border: '1px solid rgba(30,48,32,0.18)',
    cursor: 'pointer',
    fontFamily: 'Jost, sans-serif',
    borderRadius: 3,
    background: active ? '#1E3020' : 'transparent',
    color: active ? '#F2EBD9' : 'rgba(30,48,32,0.5)',
    transition: 'background 0.12s, color 0.12s',
  });

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .lhb-order-meta { grid-template-columns: 1fr !important; gap: 12px !important; }
        }
      `}</style>

      {/* Filter toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <button onClick={() => setFilter('needs_shipping')} style={filterBtn(filter === 'needs_shipping')}>
          Needs Shipping
          {pendingCount > 0 && (
            <span style={{
              marginLeft: 6, background: '#B8831A', color: '#fff',
              borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem',
              fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {pendingCount}
            </span>
          )}
        </button>
        <button onClick={() => setFilter('all')} style={filterBtn(filter === 'all')}>
          All Orders ({orders.length})
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {displayed.map((order) => {
          const items = order.items ?? [];
          const isShipped = order.status === 'shipped' || order.status === 'delivered';
          const trackUrl = order.tracking_number && order.carrier
            ? buildTrackingUrl(order.carrier as Carrier, order.tracking_number)
            : null;
          const badge = STATUS_BADGE[order.status] ?? { bg: 'rgba(30,48,32,0.08)', text: 'rgba(30,48,32,0.6)' };

          return (
            <div key={order.id} style={{
              background: '#fff',
              border: `1px solid ${order.isNewest ? 'rgba(184,131,26,0.4)' : 'rgba(30,48,32,0.1)'}`,
              borderRadius: 6,
              padding: 24,
              position: 'relative',
            }}>
              {/* NEW badge */}
              {order.isNewest && !isShipped && (
                <span style={{
                  position: 'absolute', top: 12, right: 12,
                  background: '#B8831A', color: '#fff',
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '.12em',
                  padding: '3px 9px', textTransform: 'uppercase', borderRadius: 2,
                  fontFamily: 'Jost, sans-serif',
                }}>
                  NEW
                </span>
              )}

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: '0.6rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.42)', marginBottom: 4, fontFamily: 'Jost, sans-serif' }}>
                    Order
                  </p>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'rgba(30,48,32,0.7)' }}>
                    #{String(order.order_number ?? 0).padStart(4, '0')}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.4rem', fontWeight: 500, color: '#1E3020' }}>
                    ${(order.total_amount / 100).toFixed(2)}
                  </span>
                  <span style={{
                    fontSize: '0.6rem', letterSpacing: '.1em', textTransform: 'uppercase',
                    padding: '4px 10px', borderRadius: 2,
                    background: badge.bg, color: badge.text,
                    fontFamily: 'Jost, sans-serif', whiteSpace: 'nowrap',
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Customer + shipping */}
              <div className="lhb-order-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(30,48,32,0.08)' }}>
                <div>
                  <p style={{ fontSize: '0.6rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.42)', marginBottom: 8, fontFamily: 'Jost, sans-serif' }}>Customer</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'rgba(30,48,32,0.6)' }}>{order.customer_name ?? (order.customer_id ?? '').slice(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.6rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.42)', marginBottom: 8, fontFamily: 'Jost, sans-serif' }}>Ship To</p>
                  <p style={{ fontSize: '0.85rem', color: '#1E3020', lineHeight: 1.6, fontFamily: 'Jost, sans-serif' }}>
                    <span style={{ whiteSpace: 'pre-line' }}>{formatAddress(order.shipping_address)}</span>
                  </p>
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.6rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.42)', marginBottom: 12, fontFamily: 'Jost, sans-serif' }}>Items</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#1E3020', fontFamily: 'Jost, sans-serif' }}>{item.name}</span>
                      <span style={{ color: 'rgba(30,48,32,0.55)', fontFamily: 'Jost, sans-serif' }}>
                        ×{item.qty} — ${((item.price / 100) * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking info (when shipped) */}
              {isShipped && order.tracking_number && (
                <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(45,122,71,0.06)', border: '1px solid rgba(45,122,71,0.18)', borderRadius: 4 }}>
                  <p style={{ fontSize: '0.6rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.42)', marginBottom: 8, fontFamily: 'Jost, sans-serif' }}>Shipment</p>
                  <p style={{ fontSize: '0.85rem', color: '#1E3020', marginBottom: 4, fontFamily: 'Jost, sans-serif' }}>
                    <span style={{ color: 'rgba(30,48,32,0.55)' }}>{order.carrier}</span>
                    {' '}
                    <span style={{ fontFamily: 'monospace' }}>{order.tracking_number}</span>
                  </p>
                  {trackUrl && (
                    <a
                      href={trackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block', marginTop: 6,
                        fontSize: '0.7rem', letterSpacing: '.1em', textTransform: 'uppercase',
                        color: '#B8831A', textDecoration: 'none',
                        borderBottom: '1px solid rgba(184,131,26,0.3)',
                        fontFamily: 'Jost, sans-serif',
                      }}
                    >
                      Track Package →
                    </a>
                  )}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.72rem', color: 'rgba(30,48,32,0.35)', margin: 0, fontFamily: 'Jost, sans-serif' }}>
                  {new Date(order.created_at).toLocaleString()}
                </p>
                {!isShipped && (
                  <button
                    onClick={() => setFulfilling(order)}
                    style={{
                      padding: '9px 22px', background: '#1E3020', color: '#F2EBD9',
                      border: 'none', fontFamily: 'Jost, sans-serif', fontSize: '0.7rem',
                      letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer',
                      borderRadius: 2,
                    }}
                  >
                    Mark as Shipped
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {displayed.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'rgba(30,48,32,0.38)', fontSize: '0.9rem', fontFamily: 'Jost, sans-serif' }}>
            {filter === 'needs_shipping' ? 'All orders have been shipped.' : 'No orders yet.'}
          </div>
        )}
      </div>

      {fulfilling && (
        <FulfillModal
          orderId={fulfilling.id}
          customerName={`#${String(fulfilling.order_number ?? 0).padStart(4, '0')}`}
          onClose={() => setFulfilling(null)}
          onShipped={(data) => handleShipped(fulfilling.id, data)}
        />
      )}
    </>
  );
}
