'use client';

import { useEffect, useState } from 'react';

interface Stats {
  orderCount: number;
  monthlyRevenueCents: number;
}

interface RecentOrder {
  id: string;
  orderNumber: number;
  customerId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('outsyde_access_token') : null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch('/api/admin/dashboard', { headers })
      .then(r => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
        if (Array.isArray(data.orders)) {
          const sorted = [...data.orders].sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setRecentOrders(sorted.slice(0, 5));
        }
      })
      .catch(() => setError('Failed to load dashboard data.'));
  }, []);

  return (
    <div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 500, marginBottom: 8 }}>
        Dashboard
      </h1>
      <p style={{ color: 'rgba(245,240,230,0.5)', fontSize: '0.85rem', marginBottom: 40 }}>
        Lotus House Blends — overview
      </p>

      {error && (
        <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: 24 }}>{error}</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, marginBottom: 48, maxWidth: 600 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px 28px' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.4)', marginBottom: 10 }}>
            Total Orders
          </p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', color: '#f5f0e6' }}>
            {stats ? stats.orderCount : '—'}
          </p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px 28px' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.4)', marginBottom: 10 }}>
            Monthly Revenue
          </p>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: '2.5rem', color: '#f5f0e6' }}>
            {stats ? `$${(stats.monthlyRevenueCents / 100).toFixed(2)}` : '—'}
          </p>
        </div>
      </div>

      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 400, marginBottom: 20 }}>
        Recent Orders
      </h2>
      <div style={{ border: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Order', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.65rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.4)', fontWeight: 400 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'rgba(245,240,230,0.6)', fontFamily: 'monospace' }}>
                  #{String(order.orderNumber).padStart(4, '0')}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'rgba(245,240,230,0.6)', fontFamily: 'monospace' }}>
                  {String(order.customerId).slice(0, 8).toUpperCase()}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#f5f0e6' }}>
                  ${(order.totalAmount / 100).toFixed(2)}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: '0.65rem', letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f0e6' }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'rgba(245,240,230,0.6)' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && !error && (
              <tr>
                <td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', color: 'rgba(245,240,230,0.3)', fontSize: '0.85rem' }}>
                  {stats === null ? 'Loading…' : 'No orders yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
