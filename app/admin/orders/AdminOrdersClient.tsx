"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/types";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "rgba(245,158,11,0.15)",  color: "#fbbf24" },
  processing: { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa" },
  shipped:    { bg: "rgba(139,92,246,0.15)",  color: "#a78bfa" },
  delivered:  { bg: "rgba(16,185,129,0.15)",  color: "#34d399" },
  cancelled:  { bg: "rgba(239,68,68,0.15)",   color: "#f87171" },
};

const ALL_STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

type OrderItem = { quantity: number; price_at_purchase: number; product: { name: string } | null };
type Order = {
  id: string; status: string; total: number; customer_name: string | null;
  customer_email: string | null; shipping_address: Record<string, string>;
  created_at: string; order_items: OrderItem[];
};

export default function AdminOrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (id: string, status: OrderStatus) => {
    setUpdating(id);
    const supabase = createClient();
    await supabase.from("orders").update({ status }).eq("id", id);
    router.refresh();
    setUpdating(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {orders.length === 0 && (
        <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "48px", textAlign: "center", color: "#555" }}>
          No orders yet.
        </div>
      )}

      {orders.map((order) => {
        const s = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending;
        const isOpen = expanded === order.id;

        return (
          <div key={order.id} style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
            {/* Header row */}
            <div
              onClick={() => setExpanded(isOpen ? null : order.id)}
              style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1fr 1.5fr auto", alignItems: "center", gap: "16px", padding: "16px 20px", cursor: "pointer" }}
            >
              <div>
                <p style={{ margin: 0, color: "#e1e1e8", fontWeight: 600, fontSize: "14px" }}>{order.customer_name ?? "Guest"}</p>
                <p style={{ margin: "2px 0 0", color: "#555", fontSize: "12px" }}>{order.customer_email ?? "—"}</p>
              </div>
              <div>
                <p style={{ margin: 0, color: "#888", fontSize: "12px", fontFamily: "monospace" }}>#{order.id.slice(0, 8).toUpperCase()}</p>
                <p style={{ margin: "2px 0 0", color: "#555", fontSize: "12px" }}>{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div style={{ color: "#10b981", fontWeight: 700, fontSize: "15px" }}>
                ${Number(order.total).toFixed(2)}
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <select
                  value={order.status}
                  disabled={updating === order.id}
                  onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                  style={{
                    background: s.bg, color: s.color, border: `1px solid ${s.color}33`,
                    borderRadius: "20px", padding: "4px 10px", fontSize: "12px", fontWeight: 600,
                    cursor: "pointer", outline: "none", appearance: "none", textTransform: "capitalize",
                    opacity: updating === order.id ? 0.5 : 1,
                  }}
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st} style={{ background: "#111118", color: "#e1e1e8" }}>{st}</option>
                  ))}
                </select>
              </div>
              <div style={{ color: "#555", fontSize: "18px", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</div>
            </div>

            {/* Expanded details */}
            {isOpen && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Items */}
                <div>
                  <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Items</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {order.order_items?.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                        <span style={{ color: "#e1e1e8" }}>{item.product?.name ?? "Unknown"} × {item.quantity}</span>
                        <span style={{ color: "#10b981" }}>${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Shipping */}
                <div>
                  <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Shipping Address</p>
                  <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.7" }}>
                    {order.shipping_address?.street && <p style={{ margin: 0 }}>{order.shipping_address.street}</p>}
                    {order.shipping_address?.city && <p style={{ margin: 0 }}>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}</p>}
                    {order.shipping_address?.country && <p style={{ margin: 0 }}>{order.shipping_address.country}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
