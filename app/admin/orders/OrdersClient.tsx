'use client';

import { useState } from 'react';
import FulfillModal from './FulfillModal';
import { buildTrackingUrl, type Carrier } from '@/lib/lhb-config';

export interface OrderRow {
  id: string;
  order_num: string;
  customer_name: string;
  customer_email: string;
  shipping_name: string;
  shipping_line1: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  subtotal_cents: number;
  total_cents: number;
  status: string;
  items: Array<{ name: string; qty: number; price: number }>;
  created_at: string;
  tracking_number: string | null;
  tracking_carrier: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  notes: string | null;
  isNewest?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  paid:       'rgba(200,168,130,0.15)',
  pending:    'rgba(200,168,130,0.15)',
  processing: 'rgba(100,140,200,0.15)',
  shipped:    'rgba(80,180,120,0.15)',
  delivered:  'rgba(80,180,120,0.25)',
  cancelled:  'rgba(200,80,80,0.15)',
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
        ? { ...o, status: 'shipped', tracking_number: data.trackingNumber, tracking_carrier: data.carrier, tracking_url: data.trackingUrl, shipped_at: new Date().toISOString() }
        : o
    ));
    setFulfilling(null);
  }

  const btnBase: React.CSSProperties = {
    padding: '6px 16px', fontSize: '0.7rem', letterSpacing: '.1em',
    textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.12)',
    cursor: 'pointer', fontFamily: 'inherit',
  };

  return (
    <>
      {/* Filter toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <button
          onClick={() => setFilter('needs_shipping')}
          style={{
            ...btnBase,
            background: filter === 'needs_shipping' ? '#1E3020' : 'transparent',
            color: filter === 'needs_shipping' ? '#F2EBD9' : 'rgba(245,240,230,0.5)',
          }}
        >
          Needs Shipping
          {pendingCount > 0 && (
            <span style={{
              marginLeft: 6, background: '#C8A882', color: '#1a1a18',
              borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem',
              fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter('all')}
          style={{
            ...btnBase,
            background: filter === 'all' ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: filter === 'all' ? '#f5f0e6' : 'rgba(245,240,230,0.5)',
          }}
        >
          All Orders ({orders.length})
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {displayed.map((order) => {
          const items = order.items ?? [];
          const isShipped = order.status === 'shipped' || order.status === 'delivered';
          const trackUrl = order.tracking_url
            ?? (order.tracking_number && order.tracking_carrier
              ? buildTrackingUrl(order.tracking_carrier as Carrier, order.tracking_number)
              : null);

          return (
            <div key={order.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${order.isNewest ? 'rgba(200,168,130,0.4)' : 'rgba(255,255,255,0.08)'}`,
              padding: 24, position: 'relative',
            }}>
              {/* NEW badge */}
              {order.isNewest && !isShipped && (
                <span style={{
                  position: 'absolute', top: 12, right: 12,
                  background: '#C8A882', color: '#1a1a18',
                  fontSize: '0.6rem', fontWeight: 700, letterSpacing: '.12em',
                  padding: '3px 8px', textTransform: 'uppercase',
                }}>
                  NEW
                </span>
              )}

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.4)', marginBottom: 4 }}>
                    Order ID
                  </p>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'rgba(245,240,230,0.6)' }}>
                    {order.order_num}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontFamily: 'Georgia,serif', fontSize: '1.4rem', color: '#f5f0e6' }}>
                    ${(order.total_cents / 100).toFixed(2)}
                  </span>
                  <span style={{
                    fontSize: '0.65rem', letterSpacing: '.1em', textTransform: 'uppercase',
                    padding: '4px 12px',
                    background: STATUS_COLORS[order.status] ?? 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#f5f0e6',
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Customer + shipping */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.4)', marginBottom: 8 }}>Customer</p>
                  <p style={{ fontSize: '0.9rem', color: '#f5f0e6', marginBottom: 2 }}>{order.customer_name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(245,240,230,0.5)' }}>{order.customer_email}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.4)', marginBottom: 8 }}>Ship To</p>
                  <p style={{ fontSize: '0.85rem', color: '#f5f0e6', lineHeight: 1.6 }}>
                    {order.shipping_name}<br />
                    {order.shipping_line1}<br />
                    {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: '0.65rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.4)', marginBottom: 12 }}>Items</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((item: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: '#f5f0e6' }}>{item.name}</span>
                      <span style={{ color: 'rgba(245,240,230,0.5)' }}>
                        x{item.qty} — ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking info (when shipped) */}
              {isShipped && order.tracking_number && (
                <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(80,180,120,0.06)', border: '1px solid rgba(80,180,120,0.15)' }}>
                  <p style={{ fontSize: '0.65rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.4)', marginBottom: 8 }}>Shipment</p>
                  <p style={{ fontSize: '0.85rem', color: '#f5f0e6', marginBottom: 4 }}>
                    <span style={{ color: 'rgba(245,240,230,0.5)' }}>{order.tracking_carrier}</span>
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
                        color: '#C8A882', textDecoration: 'none',
                        borderBottom: '1px solid rgba(200,168,130,0.3)',
                      }}
                    >
                      Track Package →
                    </a>
                  )}
                  {order.shipped_at && (
                    <p style={{ fontSize: '0.72rem', color: 'rgba(245,240,230,0.3)', marginTop: 8 }}>
                      Shipped {new Date(order.shipped_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '0.72rem', color: 'rgba(245,240,230,0.3)', margin: 0 }}>
                  {new Date(order.created_at).toLocaleString()}
                </p>
                {!isShipped && (
                  <button
                    onClick={() => setFulfilling(order)}
                    style={{
                      padding: '8px 18px', background: '#1E3020', color: '#F2EBD9',
                      border: 'none', fontFamily: 'inherit', fontSize: '0.72rem',
                      letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer',
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
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'rgba(245,240,230,0.3)', fontSize: '0.9rem' }}>
            {filter === 'needs_shipping' ? 'All orders have been shipped.' : 'No orders yet.'}
          </div>
        )}
      </div>

      {fulfilling && (
        <FulfillModal
          orderId={fulfilling.id}
          customerName={fulfilling.customer_name}
          onClose={() => setFulfilling(null)}
          onShipped={(data) => handleShipped(fulfilling.id, data)}
        />
      )}
    </>
  );
}
