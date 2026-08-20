import { neon } from '@neondatabase/serverless';
import OrdersClient, { type OrderRow } from './OrdersClient';

const sql = neon(process.env.DATABASE_URL!);

export default async function AdminOrders() {
  // Oldest unfulfilled first (fulfillment priority); newest at top for notification awareness
  const rows = await sql`
    SELECT
      id, order_num,
      customer_name, customer_email,
      shipping_name, shipping_line1, shipping_city, shipping_state, shipping_zip,
      subtotal_cents, total_cents,
      status, items, notes,
      tracking_number, tracking_carrier, tracking_url, shipped_at,
      created_at
    FROM orders
    ORDER BY created_at ASC
  `;

  // Mark the most recently placed order as "newest" for the NEW badge
  const newestId = rows.length > 0 ? rows[rows.length - 1].id : null;

  const orders: OrderRow[] = rows.map((r: any) => ({
    ...r,
    items: typeof r.items === 'string' ? JSON.parse(r.items) : (r.items ?? []),
    isNewest: r.id === newestId,
  }));

  return (
    <div>
      <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '2rem', fontWeight: 500, marginBottom: 8 }}>
        All Orders
      </h1>
      <p style={{ color: 'rgba(245,240,230,0.5)', fontSize: '0.85rem', marginBottom: 32 }}>
        {orders.length} total order{orders.length !== 1 ? 's' : ''}
      </p>

      <OrdersClient initialOrders={orders} />
    </div>
  );
}
