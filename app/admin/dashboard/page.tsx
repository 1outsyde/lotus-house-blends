import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  const orders = await sql`
    SELECT COUNT(*) as total_orders,
           COALESCE(SUM(subtotal), 0) as total_revenue
    FROM orders
  `;

  const recentOrders = await sql`
    SELECT id, order_num, name, email, subtotal, status, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT 5
  `;

  const totalOrders = orders[0]?.total_orders ?? 0;
  const totalRevenue = parseFloat(orders[0]?.total_revenue ?? "0");

  return (
    <div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 500, marginBottom: 8 }}>
        Dashboard
      </h1>
      <p style={{ color: "rgba(245,240,230,0.5)", fontSize: "0.85rem", marginBottom: 40 }}>
        Welcome back, {session?.user?.name ?? "Admin"}
      </p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginBottom: 48, maxWidth: 600 }}>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "24px 28px" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(245,240,230,0.4)", marginBottom: 10 }}>
            Total Orders
          </p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "2.5rem", color: "#f5f0e6" }}>
            {totalOrders}
          </p>
        </div>
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "24px 28px" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(245,240,230,0.4)", marginBottom: 10 }}>
            Total Revenue
          </p>
          <p style={{ fontFamily: "Georgia, serif", fontSize: "2.5rem", color: "#f5f0e6" }}>
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.3rem", fontWeight: 400, marginBottom: 20 }}>
        Recent Orders
      </h2>
      <div style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              {["Order", "Customer", "Email", "Amount", "Status", "Date"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.65rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(245,240,230,0.4)", fontWeight: 400 }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order: any) => (
              <tr key={order.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "14px 16px", fontSize: "0.8rem", color: "rgba(245,240,230,0.6)", fontFamily: "monospace" }}>
                  {order.order_num?.slice(0, 12)}...
                </td>
                <td style={{ padding: "14px 16px", fontSize: "0.85rem", color: "#f5f0e6" }}>{order.name}</td>
                <td style={{ padding: "14px 16px", fontSize: "0.8rem", color: "rgba(245,240,230,0.6)" }}>{order.email}</td>
                <td style={{ padding: "14px 16px", fontSize: "0.85rem", color: "#f5f0e6" }}>${parseFloat(order.subtotal).toFixed(2)}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span style={{ fontSize: "0.65rem", letterSpacing: ".1em", textTransform: "uppercase", padding: "4px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#f5f0e6" }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: "14px 16px", fontSize: "0.8rem", color: "rgba(245,240,230,0.6)" }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
