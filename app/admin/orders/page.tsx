'use client';

import { useEffect, useState } from 'react';
import OrdersClient, { type OrderRow } from './OrdersClient';

function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('outsyde_access_token') : null;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/admin/orders', { headers })
      .then(r => r.json())
      .then((data) => {
        if (!Array.isArray(data.orders)) {
          setError('Failed to load orders.');
          return;
        }

        // Sort: unfulfilled first, then by newest
        const sorted = [...data.orders].sort((a: any, b: any) => {
          const aUnfulfilled = !['shipped', 'delivered'].includes(a.status) ? 0 : 1;
          const bUnfulfilled = !['shipped', 'delivered'].includes(b.status) ? 0 : 1;
          if (aUnfulfilled !== bUnfulfilled) return aUnfulfilled - bUnfulfilled;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // Mark the most recently placed order
        const newestId = data.orders.length > 0
          ? [...data.orders].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.id
          : null;

        const mapped: OrderRow[] = sorted.map((r: any) => ({
          id: r.id,
          order_number: r.orderNumber,
          customer_id: r.customerId,
          items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items ?? []),
          total_amount: r.totalAmount,
          status: r.status ?? 'pending',
          shipping_address: r.shippingAddress ?? null,
          created_at: r.createdAt,
          tracking_number: r.trackingNumber ?? null,
          carrier: r.carrier ?? null,
          isNewest: r.id === newestId,
        }));

        setOrders(mapped);
      })
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '2rem', fontWeight: 500, marginBottom: 8 }}>
        All Orders
      </h1>
      <p style={{ color: 'rgba(245,240,230,0.5)', fontSize: '0.85rem', marginBottom: 32 }}>
        {loading ? 'Loading…' : `${orders.length} total order${orders.length !== 1 ? 's' : ''}`}
      </p>

      {error && (
        <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: 24 }}>{error}</p>
      )}

      {!loading && !error && <OrdersClient initialOrders={orders} />}
    </div>
  );
}
