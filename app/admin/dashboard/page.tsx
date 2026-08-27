import { cookies } from 'next/headers';
import DashboardCalendar from './DashboardCalendar';
import UpNextCard from './UpNextCard';

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

function toDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('outsyde_access_token')?.value ?? '';

  const apiUrl = process.env.OUTSYDE_API_URL;

  let orders: Order[] = [];
  let fetchError = '';

  try {
    const businessId = process.env.NEXT_PUBLIC_OUTSYDE_BUSINESS_ID;
    const res = await fetch(
      `${apiUrl}/api/business/orders${businessId ? `?businessId=${businessId}` : ''}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    );
    if (res.ok) {
      const { orders: fetched } = await res.json() as { orders: Order[] };
      orders = fetched ?? [];
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

  const upNextRaw = [...orders]
    .filter((o) => o.status === 'paid')
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0] ?? null;

  const upNext = upNextRaw ? {
    id: upNextRaw.id,
    orderNumber: upNextRaw.order_number,
    shippingAddress: upNextRaw.shipping_address ?? '—',
    itemsSummary: itemsSummary(upNextRaw.items),
    totalAmount: upNextRaw.total_amount,
  } : null;

  // Richer date map: each key → array of { status, orderNumber, amount }
  const dateMap: Record<string, Array<{ status: string; orderNumber: number; amount: number }>> = {};
  for (const order of orders) {
    if (!order.created_at) continue;
    const key = toDateKey(order.created_at);
    if (!dateMap[key]) dateMap[key] = [];
    dateMap[key].push({
      status: order.status,
      orderNumber: order.order_number,
      amount: order.total_amount,
    });
  }

  const statCards = [
    { label: 'Total Orders', value: String(totalOrders) },
    { label: 'Total Revenue', value: fmt(totalRevenueCents) },
    { label: 'Avg Order Value', value: fmt(avgOrderValueCents) },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.2rem', fontWeight: 500, color: '#1E3020', margin: '0 0 32px' }}>
        Dashboard
      </h1>

      {fetchError && (
        <p style={{ color: '#C0392B', fontSize: '0.85rem', marginBottom: 20, fontFamily: 'Jost, sans-serif' }}>{fetchError}</p>
      )}

      {/* Stat cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
        {statCards.map(({ label, value }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', minWidth: 140 }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(30,48,32,0.42)', marginBottom: 8, fontFamily: 'Jost, sans-serif' }}>
              {label}
            </p>
            <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.2rem', fontWeight: 600, color: '#1E3020', margin: 0 }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Up Next */}
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.5rem', fontWeight: 500, color: '#1E3020', margin: '0 0 16px' }}>
          Up Next
        </h2>
        <UpNextCard order={upNext} />
      </div>

      {/* Calendar */}
      <DashboardCalendar dateMap={dateMap} />
    </div>
  );
}
