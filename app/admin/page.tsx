import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Package, ShoppingBag, DollarSign, Users, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: productCount }, { count: orderCount }, { data: orders }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("total, status, customer_name, customer_email, created_at").order("created_at", { ascending: false }).limit(5),
    ]);

  const revenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;

  const stats = [
    { label: "Total Products", value: productCount ?? 0, icon: Package, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    { label: "Total Orders", value: orderCount ?? 0, icon: ShoppingBag, color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
    { label: "Revenue (last 5)", value: `$${revenue.toFixed(2)}`, icon: DollarSign, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 }}>Dashboard</h1>
        <p style={{ color: "#666", marginTop: "4px", fontSize: "14px" }}>Welcome back to your store admin</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ background: bg, borderRadius: "10px", padding: "12px", color }}>
              <Icon size={22} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>{label}</p>
              <p style={{ margin: "4px 0 0", fontSize: "22px", fontWeight: 700, color: "#fff" }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
        <Link href="/admin/products/new" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "12px", padding: "20px 24px", textDecoration: "none", color: "#a78bfa", fontWeight: 600, fontSize: "15px", transition: "all 0.15s" }}>
          <span>+ Add New Product</span>
          <ArrowRight size={18} />
        </Link>
        <Link href="/admin/orders" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)", borderRadius: "12px", padding: "20px 24px", textDecoration: "none", color: "#67e8f9", fontWeight: 600, fontSize: "15px", transition: "all 0.15s" }}>
          <span>View All Orders</span>
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* Recent Orders */}
      <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#fff" }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{ fontSize: "13px", color: "#8b5cf6", textDecoration: "none" }}>View all →</Link>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Customer", "Email", "Total", "Status", "Date"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 0", color: "#555", fontWeight: 600, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders?.map((order, i) => (
              <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <td style={{ padding: "12px 0", color: "#e1e1e8" }}>{order.customer_name ?? "Guest"}</td>
                <td style={{ padding: "12px 0", color: "#666" }}>{order.customer_email ?? "—"}</td>
                <td style={{ padding: "12px 0", color: "#10b981", fontWeight: 600 }}>${Number(order.total).toFixed(2)}</td>
                <td style={{ padding: "12px 0" }}>
                  <span style={{ background: order.status === "pending" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)", color: order.status === "pending" ? "#fbbf24" : "#34d399", padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, textTransform: "capitalize" }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: "12px 0", color: "#555" }}>{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={5} style={{ padding: "24px 0", textAlign: "center", color: "#555" }}>No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
