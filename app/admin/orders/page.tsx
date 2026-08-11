import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async function AdminOrders() {
  const orders = await sql`
    SELECT id, order_num, name, email, phone, street, city, state, zip, 
           subtotal, status, items, created_at
    FROM orders
    ORDER BY created_at DESC
  `;

  return (
    <div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 500, marginBottom: 8 }}>
        All Orders
      </h1>
      <p style={{ color: "rgba(245,240,230,0.5)", fontSize: "0.85rem", marginBottom: 40 }}>
        {orders.length} total orders
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {orders.map((order: any) => {
          const items = typeof order.items === "string"
            ? JSON.parse(order.items)
            : order.items;

          return (
            <div key={order.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: 24 }}>
              
              {/* Order Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: "0.65rem", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(245,240,230,0.4)", marginBottom: 4 }}>
                    Order ID
                  </p>
                  <p style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "rgba(245,240,230,0.6)" }}>
                    {order.order_num}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: "1.4rem", color: "#f5f0e6" }}>
                    ${parseFloat(order.subtotal).toFixed(2)}
                  </span>
                  <span style={{ fontSize: "0.65rem", letterSpacing: ".1em", textTransform: "uppercase", padding: "4px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#f5f0e6" }}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <p style={{ fontSize: "0.65rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(245,240,230,0.4)", marginBottom: 8 }}>
                    Customer
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#f5f0e6", marginBottom: 2 }}>{order.name}</p>
                  <p style={{ fontSize: "0.8rem", color: "rgba(245,240,230,0.5)" }}>{order.email}</p>
                  <p style={{ fontSize: "0.8rem", color: "rgba(245,240,230,0.5)" }}>{order.phone}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.65rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(245,240,230,0.4)", marginBottom: 8 }}>
                    Ship To
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "#f5f0e6", lineHeight: 1.6 }}>
                    {order.street}<br />
                    {order.city}, {order.state} {order.zip}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p style={{ fontSize: "0.65rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(245,240,230,0.4)", marginBottom: 12 }}>
                  Items
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items?.map((item: any, i: number) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <span style={{ color: "#f5f0e6" }}>{item.name}</span>
                      <span style={{ color: "rgba(245,240,230,0.5)" }}>
                        x{item.qty} — ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date */}
              <p style={{ fontSize: "0.75rem", color: "rgba(245,240,230,0.3)", marginTop: 16 }}>
                {new Date(order.created_at).toLocaleString()}
              </p>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0", color: "rgba(245,240,230,0.3)", fontSize: "0.9rem" }}>
            No orders yet.
          </div>
        )}
      </div>
    </div>
  );
}
