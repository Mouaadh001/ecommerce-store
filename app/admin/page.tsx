import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Package, ShoppingBag, DollarSign, ArrowRight, PlusCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

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
    { label: "Revenue (last 5)", value: formatPrice(revenue, "DZD"), icon: DollarSign, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Store control</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-400">Monitor orders, inventory, and recent revenue.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-400"
        >
          <PlusCircle size={16} />
          Add Product
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/10"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-zinc-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
              </div>
              <div style={{ background: bg, color }} className="rounded-lg p-3">
              <Icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/products/new" className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm font-semibold text-white transition hover:border-emerald-400/40 hover:bg-emerald-400/10">
          <span>+ Add New Product</span>
          <ArrowRight size={18} className="transition group-hover:translate-x-1" />
        </Link>
        <Link href="/admin/orders" className="group flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] p-5 text-sm font-semibold text-white transition hover:border-cyan-300/40 hover:bg-cyan-300/10">
          <span>View All Orders</span>
          <ArrowRight size={18} className="transition group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.045]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-base font-semibold text-white">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">View all</Link>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-black/10">
              {["Customer", "Email", "Total", "Status", "Date"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders?.map((order, i) => (
              <tr key={i} className="border-b border-white/[0.06] last:border-0">
                <td className="px-5 py-4 font-medium text-zinc-100">{order.customer_name ?? "Guest"}</td>
                <td className="px-5 py-4 text-zinc-500">{order.customer_email ?? "—"}</td>
                <td className="px-5 py-4 font-semibold text-emerald-400">{formatPrice(Number(order.total), "DZD")}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full px-2.5 py-1 text-xs font-semibold capitalize" style={{ background: order.status === "pending" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)", color: order.status === "pending" ? "#fbbf24" : "#34d399" }}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-zinc-500">{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-zinc-500">No orders yet</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
