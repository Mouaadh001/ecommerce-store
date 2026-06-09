"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star } from "lucide-react";
import type { Product } from "@/types";

export default function AdminProductsClient({ products }: { products: (Product & { category: { name: string } | null })[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    router.refresh();
    setDeleting(null);
  };

  return (
    <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            {["Product", "Category", "Price", "Stock", "Featured", "Actions"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "14px 16px", color: "#555", fontWeight: 600, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.05em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <td style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {p.images?.[0] && (
                    <img src={p.images[0]} alt={p.name} style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", background: "#1a1a24" }} />
                  )}
                  <div>
                    <p style={{ margin: 0, color: "#e1e1e8", fontWeight: 500 }}>{p.name}</p>
                    <p style={{ margin: "2px 0 0", color: "#555", fontSize: "11px", fontFamily: "monospace" }}>{p.slug}</p>
                  </div>
                </div>
              </td>
              <td style={{ padding: "14px 16px", color: "#888" }}>{p.category?.name ?? "—"}</td>
              <td style={{ padding: "14px 16px" }}>
                <span style={{ color: "#10b981", fontWeight: 600 }}>${Number(p.price).toFixed(2)}</span>
                {p.compare_at_price && (
                  <span style={{ color: "#555", fontSize: "11px", textDecoration: "line-through", marginLeft: "6px" }}>${Number(p.compare_at_price).toFixed(2)}</span>
                )}
              </td>
              <td style={{ padding: "14px 16px" }}>
                <span style={{ color: p.stock > 10 ? "#34d399" : p.stock > 0 ? "#fbbf24" : "#f87171", fontWeight: 600 }}>
                  {p.stock}
                </span>
              </td>
              <td style={{ padding: "14px 16px" }}>
                {p.featured && <Star size={15} fill="#fbbf24" color="#fbbf24" />}
              </td>
              <td style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "6px", background: "rgba(139,92,246,0.1)", color: "#a78bfa", textDecoration: "none", fontSize: "12px", fontWeight: 500 }}
                  >
                    <Pencil size={12} /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    disabled={deleting === p.id}
                    style={{ display: "flex", alignItems: "center", gap: "4px", padding: "6px 12px", borderRadius: "6px", background: "rgba(239,68,68,0.1)", color: "#f87171", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 500, opacity: deleting === p.id ? 0.5 : 1 }}
                  >
                    <Trash2 size={12} /> {deleting === p.id ? "..." : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "#555" }}>
                No products yet. <Link href="/admin/products/new" style={{ color: "#8b5cf6" }}>Add your first product →</Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
