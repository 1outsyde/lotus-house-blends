import { neon } from '@neondatabase/serverless';
import OrdersClient, { type OrderRow } from './OrdersClient';

const sql = neon(process.env.DATABASE_URL!);

export default async function AdminOrders() {
  // Oldest unfulfilled first (fulfillment priority); newest at top for notification awareness
  const rows = await sql`
    SELECT
      id, order_number,
      customer_id,
      items,
      total_amount,
      status,
      shipping_address,
      tracking_number, carrier,
      created_at
    FROM orders
    WHERE business_id = ${process.env.OUTSYDE_BUSINESS_ID}
    ORDER BY
      CASE WHEN status != 'shipped' THEN 0 ELSE 1 END,
      created_at DESC
  `;

  // Mark the most recently placed order as "newest" for the NEW badge
  const newestId = rows.length > 0 ? rows[0].id : null;

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
