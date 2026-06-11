"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Trash2 } from "lucide-react";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "rgba(245,158,11,0.15)",  color: "#fbbf24" },
  processing: { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa" },
  shipped:    { bg: "rgba(139,92,246,0.15)",  color: "#a78bfa" },
  delivered:  { bg: "rgba(16,185,129,0.15)",  color: "#34d399" },
  cancelled:  { bg: "rgba(239,68,68,0.15)",   color: "#f87171" },
};

const ALL_STATUSES: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

type SelectedOptions = {
  color?: string | null;
  colorValue?: string | null;
  colorImage?: string | null;
  size?: string | null;
};
type OrderItem = {
  quantity: number;
  price_at_purchase: number;
  selected_options: SelectedOptions | null;
  product: { name: string } | null;
};
type Order = {
  id: string; status: string; total: number; customer_name: string | null;
  customer_email: string | null; shipping_address: Record<string, string | number | null>;
  created_at: string; order_items: OrderItem[];
};

export default function AdminOrdersClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const updateStatus = async (id: string, status: OrderStatus) => {
    setUpdating(id);
    const supabase = createClient();
    await supabase.from("orders").update({ status }).eq("id", id);
    router.refresh();
    setUpdating(null);
  };

  const deleteOrder = async (id: string) => {
    if (!confirm(`Delete order #${id.slice(0, 8).toUpperCase()}? This cannot be undone.`)) return;

    setDeleting(id);
    const response = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      alert(data?.error ?? "Failed to delete order");
      setDeleting(null);
      return;
    }

    if (expanded === id) setExpanded(null);
    router.refresh();
    setDeleting(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {orders.length === 0 && (
        <div style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "48px", textAlign: "center", color: "#71717a" }}>
          No orders yet.
        </div>
      )}

      {orders.map((order) => {
        const s = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending;
        const isOpen = expanded === order.id;

        return (
          <div key={order.id} style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.12)" }}>
            {/* Header row */}
            <div
              className="admin-order-header"
              onClick={() => setExpanded(isOpen ? null : order.id)}
              style={{ display: "grid", gridTemplateColumns: "minmax(180px,2fr) minmax(150px,1.6fr) minmax(120px,1fr) minmax(130px,1.2fr) auto auto", alignItems: "center", gap: "16px", padding: "17px 20px", cursor: "pointer" }}
            >
              <div className="admin-order-customer">
                <p style={{ margin: 0, color: "#f4f4f5", fontWeight: 650, fontSize: "14px" }}>{order.customer_name ?? "Guest"}</p>
                <p style={{ margin: "4px 0 0", color: "#71717a", fontSize: "12px", overflowWrap: "anywhere" }}>{order.customer_email ?? "—"}</p>
              </div>
              <div className="admin-order-meta">
                <p style={{ margin: 0, color: "#a1a1aa", fontSize: "12px", fontFamily: "monospace" }}>#{order.id.slice(0, 8).toUpperCase()}</p>
                <p style={{ margin: "4px 0 0", color: "#71717a", fontSize: "12px" }}>{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div className="admin-order-total" style={{ color: "#34d399", fontWeight: 750, fontSize: "15px" }}>
                {formatPrice(Number(order.total), "DZD")}
              </div>
              <div className="admin-order-status" onClick={(e) => e.stopPropagation()}>
                <select
                  value={order.status}
                  disabled={updating === order.id}
                  onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                  style={{
                    background: s.bg, color: s.color, border: `1px solid ${s.color}33`,
                    borderRadius: "999px", padding: "6px 12px", fontSize: "12px", fontWeight: 700,
                    cursor: "pointer", outline: "none", appearance: "none", textTransform: "capitalize",
                    opacity: updating === order.id ? 0.5 : 1,
                  }}
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st} style={{ background: "#111118", color: "#e1e1e8" }}>{st}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void deleteOrder(order.id);
                }}
                disabled={deleting === order.id}
                aria-label={`Delete order ${order.id.slice(0, 8).toUpperCase()}`}
                title="Delete order"
                style={{
                  width: "36px",
                  height: "36px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "10px",
                  border: "1px solid rgba(248,113,113,0.28)",
                  background: "rgba(239,68,68,0.1)",
                  color: "#f87171",
                  cursor: deleting === order.id ? "wait" : "pointer",
                  opacity: deleting === order.id ? 0.55 : 1,
                  transition: "transform 0.18s ease, border-color 0.18s ease, background 0.18s ease",
                }}
              >
                <Trash2 size={16} />
              </button>
              <div style={{ color: "#71717a", fontSize: "18px", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</div>
            </div>

            {/* Expanded details */}
            {isOpen && (
              <div className="admin-order-details" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "24px", background: "rgba(0,0,0,0.18)" }}>
                {/* Items */}
                <div>
                  <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Items</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {order.order_items?.map((item, i) => {
                      const options = formatSelectedOptions(item.selected_options);

                      return (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "13px", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <span style={{ color: "#e4e4e7", minWidth: 0, overflowWrap: "anywhere" }}>
                            {item.product?.name ?? "Unknown"} × {item.quantity}
                            {options && (
                              <span style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px", color: "#777", fontSize: "12px" }}>
                                {item.selected_options?.colorValue && (
                                  <span
                                    style={{
                                      width: "10px",
                                      height: "10px",
                                      borderRadius: "999px",
                                      background: item.selected_options.colorValue,
                                      border: "1px solid rgba(255,255,255,0.22)",
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                                {options}
                              </span>
                            )}
                          </span>
                          <span style={{ color: "#34d399", whiteSpace: "nowrap", fontWeight: 650 }}>{formatPrice(item.price_at_purchase * item.quantity, "DZD")}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Shipping */}
                <div>
                  <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#71717a", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Shipping Address</p>
                  <div style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: "1.8" }}>
                    {order.shipping_address?.customerPhone && <p style={{ margin: 0 }}>Phone: {order.shipping_address.customerPhone}</p>}
                    {(order.shipping_address?.address || order.shipping_address?.street) && <p style={{ margin: 0 }}>{order.shipping_address.address ?? order.shipping_address.street}</p>}
                    {(order.shipping_address?.communeNameAr || order.shipping_address?.city) && (
                      <p style={{ margin: 0 }}>
                        {order.shipping_address.communeNameAr ?? order.shipping_address.city}, {order.shipping_address.wilayaNameAr ?? order.shipping_address.state}
                      </p>
                    )}
                    {order.shipping_address?.deliveryLabelAr && <p style={{ margin: 0 }}>Delivery: {order.shipping_address.deliveryLabelAr}</p>}
                    {typeof order.shipping_address?.shippingPrice === "number" && (
                      <p style={{ margin: 0 }}>Shipping: {formatPrice(order.shipping_address.shippingPrice, "DZD")}</p>
                    )}
                    {order.shipping_address?.notes && <p style={{ margin: "6px 0 0", color: "#aaa" }}>Notes: {order.shipping_address.notes}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <style jsx global>{`
        @media (max-width: 720px) {
          .admin-order-header {
            grid-template-columns: minmax(0, 1fr) auto !important;
            gap: 12px !important;
            padding: 14px !important;
          }

          .admin-order-customer,
          .admin-order-meta {
            grid-column: 1 / -1;
            min-width: 0;
          }

          .admin-order-total {
            grid-column: 1;
          }

          .admin-order-status {
            grid-column: 1;
          }

          .admin-order-header > button {
            grid-column: 2;
            grid-row: 3;
          }

          .admin-order-header > div:last-child {
            grid-column: 2;
            grid-row: 4;
            justify-self: center;
          }

          .admin-order-details {
            grid-template-columns: 1fr !important;
            padding: 14px !important;
          }
        }
      `}</style>
    </div>
  );
}

function formatSelectedOptions(options?: SelectedOptions | null) {
  const parts = [
    options?.color ? `Color: ${options.color}` : null,
    options?.size ? `Size: ${options.size}` : null,
  ].filter(Boolean);

  return parts.join(" | ");
}
