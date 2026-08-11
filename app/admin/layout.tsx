import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !(session.user as any)?.isAdmin) {
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#f5f0e6" }}>
      <nav style={{
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", letterSpacing: ".1em" }}>
          LOTUS HOUSE — ADMIN
        </span>
        <div style={{ display: "flex", gap: 24, fontSize: "0.75rem", letterSpacing: ".12em", textTransform: "uppercase" }}>
          <a href="/admin/dashboard" style={{ color: "#f5f0e6", textDecoration: "none" }}>Dashboard</a>
          <a href="/admin/orders" style={{ color: "#f5f0e6", textDecoration: "none" }}>Orders</a>
          <a href="/api/auth/signout" style={{ color: "rgba(245,240,230,0.5)", textDecoration: "none" }}>Sign Out</a>
        </div>
      </nav>
      <main style={{ padding: "40px 32px" }}>
        {children}
      </main>
    </div>
  );
}
