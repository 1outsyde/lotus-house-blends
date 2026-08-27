import { cookies } from 'next/headers';
import OrdersClient, { type OrderRow } from './OrdersClient';

interface RawOrder {
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

export default async function AdminOrders() {
  const cookieStore = await cookies();
  const token = cookieStore.get('outsyde_access_token')?.value ?? '';

  const apiUrl = process.env.OUTSYDE_API_URL;
  const businessId = process.env.NEXT_PUBLIC_OUTSYDE_BUSINESS_ID;

  let orders: OrderRow[] = [];
  let fetchError = '';

  try {
    const res = await fetch(
      `${apiUrl}/api/business/orders${businessId ? `?businessId=${businessId}` : ''}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      }
    );
    if (res.ok) {
      const { orders: raw = [] } = await res.json() as { orders?: RawOrder[] };

      const newestId =
        raw.length > 0
          ? [...raw].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0].id
          : null;

      // paid orders first (ASC by date), then all others (DESC by date)
      const sorted = [...raw].sort((a, b) => {
        const aPaid = a.status === 'paid' ? 0 : 1;
        const bPaid = b.status === 'paid' ? 0 : 1;
        if (aPaid !== bPaid) return aPaid - bPaid;
        if (aPaid === 0) {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      orders = sorted.map((r) => ({
        id: r.id,
        order_number: r.order_number,
        customer_id: r.customer_id,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items ?? []),
        total_amount: r.total_amount,
        status: r.status ?? 'pending',
        shipping_address: r.shipping_address ?? null,
        created_at: r.created_at,
        tracking_number: r.tracking_number ?? null,
        carrier: r.carrier ?? null,
        isNewest: r.id === newestId,
      }));
    } else {
      fetchError = `Failed to load orders (${res.status}).`;
    }
  } catch {
    fetchError = 'Could not reach data service.';
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '2rem', fontWeight: 500, marginBottom: 8 }}>
        All Orders
      </h1>
      <p style={{ color: 'rgba(245,240,230,0.5)', fontSize: '0.85rem', marginBottom: 32 }}>
        {fetchError ? '' : `${orders.length} total order${orders.length !== 1 ? 's' : ''}`}
      </p>

      {fetchError && (
        <p style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: 24 }}>{fetchError}</p>
      )}

      {!fetchError && <OrdersClient initialOrders={orders} />}
    </div>
  );
}
