import { cookies } from 'next/headers';
import Link from 'next/link';

interface Order {
  id: string;
  order_number: number;
  customer_id: string;
  items: Array<{ name: string; qty: number; price: number }> | string;
  total_amount: number;
  status: string;
  shipping_address: string | null;
  created_at: string;
  tracking_number: string | null;
  carrier: string | null;
}

function itemsSummary(items: Order['items']): string {
  const parsed: Array<{ name: string; qty: number }> =
    typeof items === 'string' ? JSON.parse(items) : (items ?? []);
  if (!Array.isArray(parsed) || parsed.length === 0) return 'No items';
  return parsed.map((it) => `${it.name} ×${it.qty}`).join(', ');
}

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const statCard = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '24px 28px',
  minWidth: 160,
} as const;

const statLabel = {
  fontSize: '0.7rem',
  letterSpacing: '.16em',
  textTransform: 'uppercase' as const,
  color: 'rgba(245,240,230,0.4)',
  marginBottom: 10,
};

const statValue = {
  fontFamily: 'Georgia, serif',
  fontSize: '2.5rem',
  color: '#f5f0e6',
};

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('outsyde_access_token')?.value ?? '';

  const apiUrl = process.env.OUTSYDE_API_URL;
  const businessId = process.env.NEXT_PUBLIC_OUTSYDE_BUSINESS_ID;

  let orders: Order[] = [];
  let fetchError = '';

  try {
    const res = await fetch(
      `${apiUrl}/api/business/orders?businessId=${businessId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    );
    if (res.ok) {
      const data: unknown = await res.json();
      orders = Array.isArray(data) ? data : ((data as { orders?: Order[] }).orders ?? []);
    } else {
      fetchError = `Failed to load orders (${res.status}).`;
    }
  } catch {
    fetchError = 'Could not reach data service.';
  }

  const totalOrders = orders.length;
  const totalRevenueCents = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total_amount ?? 0), 0);
  const avgOrderValueCents = totalOrders > 0 ? Math.round(totalRevenueCents / totalOrders) : 0;

  const upNext = [...orders]
    .filter((o) => o.status === 'paid')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0] ?? null;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div>
      <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 500, marginBottom: 8 }}>
        Dashboard
      </h1>
      <p style={{ color: 'rgba(245,240,230,0.5)', fontSize: '0.85rem', marginBottom: 40 }}>
        Lotus House Blends — overview
      </p>

      {fetchError && (
        <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: 24 }}>{fetchError}</p>
      )}

      {/* Stat cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 48 }}>
        <div style={statCard}>
          <p style={statLabel}>Total Orders</p>
          <p style={statValue}>{totalOrders}</p>
        </div>
        <div style={statCard}>
          <p style={statLabel}>Total Revenue</p>
          <p style={statValue}>{fmt(totalRevenueCents)}</p>
        </div>
        <div style={statCard}>
          <p style={statLabel}>Avg Order Value</p>
          <p style={statValue}>{fmt(avgOrderValueCents)}</p>
        </div>
      </div>

      {/* Up Next */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 400, marginBottom: 16 }}>
          Up Next
        </h2>
        {upNext ? (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '24px 28px' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'rgba(245,240,230,0.6)', marginBottom: 8 }}>
              #{String(upNext.order_number).padStart(4, '0')}
            </p>
            <p style={{ fontSize: '0.85rem', color: '#f5f0e6', marginBottom: 6 }}>
              {upNext.shipping_address ?? '—'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(245,240,230,0.5)', marginBottom: 12 }}>
              {itemsSummary(upNext.items)}
            </p>
            <p style={{ fontSize: '0.9rem', color: '#f5f0e6', marginBottom: 16 }}>
              {fmt(upNext.total_amount)}
            </p>
            <Link
              href="/admin/orders"
              style={{ fontSize: '0.75rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.6)', textDecoration: 'none' }}
            >
              Go to Orders →
            </Link>
          </div>
        ) : (
          <p style={{ color: 'rgba(245,240,230,0.4)', fontSize: '0.9rem' }}>All caught up.</p>
        )}
      </div>

      {/* Recent Orders */}
      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.3rem', fontWeight: 400, marginBottom: 20 }}>
        Recent Orders
      </h2>
      <div style={{ border: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Order', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                <th
                  key={h}
                  style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.65rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.4)', fontWeight: 400 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'rgba(245,240,230,0.6)', fontFamily: 'monospace' }}>
                  #{String(order.order_number).padStart(4, '0')}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'rgba(245,240,230,0.6)', fontFamily: 'monospace' }}>
                  {String(order.customer_id).slice(0, 8).toUpperCase()}
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: '#f5f0e6' }}>
                  {fmt(order.total_amount)}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: '0.65rem', letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f5f0e6' }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'rgba(245,240,230,0.6)' }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && !fetchError && (
              <tr>
                <td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', color: 'rgba(245,240,230,0.3)', fontSize: '0.85rem' }}>
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
