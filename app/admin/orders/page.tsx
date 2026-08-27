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
      `${apiUrl}/api/business/orders?businessId=${businessId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-business-id': process.env.OUTSYDE_BUSINESS_ID ?? '',
        },
        cache: 'no-store',
      }
    );
    if (res.ok) {
      const data: unknown = await res.json();
      const raw: RawOrder[] = Array.isArray(data)
        ? data
        : ((data as { orders?: RawOrder[] }).orders ?? []);

      const newestId =
        raw.length > 0
          ? [...raw].sort(
              (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            )[0].id
          : null;

      // paid orders first (ASC by date), then all others (DESC by date)
      const sorted = [...raw].sort((a, b) => {
        const aPaid = a.status === 'paid' ? 0 : 1;
        const bPaid = b.status === 'paid' ? 0 : 1;
        if (aPaid !== bPaid) return aPaid - bPaid;
        if (aPaid === 0) {
          return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        }
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });

      orders = sorted.map((r) => {
        let parsedItems: Array<{ name: string; qty: number; price: number }> = [];
        if (r.items) {
          if (typeof r.items === 'string') {
            try { const p = JSON.parse(r.items); parsedItems = Array.isArray(p) ? p : []; } catch { parsedItems = []; }
          } else {
            parsedItems = Array.isArray(r.items) ? r.items : [];
          }
        }
        const rawAddr = r.shipping_address as unknown;
        const safeAddr = typeof rawAddr === 'string' ? rawAddr : rawAddr == null ? null : JSON.stringify(rawAddr);
        return {
          id: r.id,
          order_number: r.order_number ?? 0,
          customer_id: r.customer_id ?? '',
          items: parsedItems,
          total_amount: r.total_amount ?? 0,
          status: r.status ?? 'pending',
          shipping_address: safeAddr,
          created_at: r.created_at ?? new Date().toISOString(),
          tracking_number: r.tracking_number ?? null,
          carrier: r.carrier ?? null,
          isNewest: r.id === newestId,
        };
      });
    } else {
      fetchError = `Failed to load orders (${res.status}).`;
    }
  } catch {
    fetchError = 'Could not reach data service.';
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '2.2rem', fontWeight: 500, color: '#1E3020', margin: '0 0 8px' }}>
        All Orders
      </h1>
      <p style={{ color: 'rgba(30,48,32,0.5)', fontSize: '0.85rem', marginBottom: 32, fontFamily: 'Jost, sans-serif' }}>
        {fetchError ? '' : `${orders.length} total order${orders.length !== 1 ? 's' : ''}`}
      </p>

      {fetchError && (
        <p style={{ color: '#C0392B', fontSize: '0.85rem', marginBottom: 24, fontFamily: 'Jost, sans-serif' }}>{fetchError}</p>
      )}

      {!fetchError && <OrdersClient initialOrders={orders} />}
    </div>
  );
}
