'use client';

import { useState } from 'react';
import FulfillModal from '../orders/FulfillModal';
import type { Carrier } from '@/lib/lhb-config';

interface UpNextOrder {
  id: string;
  orderNumber: number;
  shippingAddress: string;
  itemsSummary: string;
  totalAmount: number;
}

interface Props {
  order: UpNextOrder | null;
}

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function UpNextCard({ order }: Props) {
  const [fulfilling, setFulfilling] = useState(false);
  const [shipped, setShipped] = useState(false);

  if (!order || shipped) {
    return (
      <p style={{ color: 'rgba(30,48,32,0.48)', fontSize: '0.9rem', fontFamily: 'Jost, sans-serif' }}>
        All caught up.
      </p>
    );
  }

  function handleShipped(_data: { trackingNumber: string; carrier: Carrier; trackingUrl: string | null }) {
    setShipped(true);
    setFulfilling(false);
  }

  return (
    <>
      <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', border: '1px solid rgba(30,48,32,0.08)' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'rgba(30,48,32,0.45)', marginBottom: 8 }}>
          #{String(order.orderNumber).padStart(4, '0')}
        </p>
        <p style={{ fontSize: '0.95rem', color: '#1E3020', fontFamily: 'Jost, sans-serif', marginBottom: 4 }}>
          {order.shippingAddress}
        </p>
        <p style={{ fontSize: '0.82rem', color: 'rgba(30,48,32,0.55)', fontFamily: 'Jost, sans-serif', marginBottom: 12 }}>
          {order.itemsSummary}
        </p>
        <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.25rem', fontWeight: 500, color: '#1E3020', marginBottom: 20 }}>
          {fmt(order.totalAmount)}
        </p>
        <button
          onClick={() => setFulfilling(true)}
          style={{
            padding: '9px 22px',
            background: '#1E3020',
            color: '#F2EBD9',
            border: 'none',
            fontFamily: 'Jost, sans-serif',
            fontSize: '0.7rem',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            borderRadius: 2,
          }}
        >
          Mark as Shipped
        </button>
      </div>

      {fulfilling && (
        <FulfillModal
          orderId={order.id}
          customerName={`#${String(order.orderNumber).padStart(4, '0')}`}
          onClose={() => setFulfilling(false)}
          onShipped={handleShipped}
        />
      )}
    </>
  );
}
