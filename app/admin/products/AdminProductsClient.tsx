"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

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
    <div style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", overflow: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.12)" }}>
      <table style={{ width: "100%", minWidth: "780px", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.18)" }}>
            {["Product", "Category", "Price", "Stock", "Featured", "Actions"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "14px 16px", color: "#71717a", fontWeight: 700, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.08em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <td style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {p.images?.[0] && (
                    <div style={{ width: "42px", height: "42px", borderRadius: "8px", overflow: "hidden", background: "#1a1a24", position: "relative", flexShrink: 0 }}>
                      <Image src={p.images[0]} alt={p.name} fill sizes="42px" style={{ objectFit: "cover" }} />
                    </div>
                  )}
                  <div>
                    <p style={{ margin: 0, color: "#f4f4f5", fontWeight: 650 }}>{p.name}</p>
                    <p style={{ margin: "3px 0 0", color: "#71717a", fontSize: "11px", fontFamily: "monospace" }}>{p.slug}</p>
                  </div>
                </div>
              </td>
              <td style={{ padding: "14px 16px", color: "#a1a1aa" }}>{p.category?.name ?? "—"}</td>
              <td style={{ padding: "14px 16px" }}>
                <span style={{ color: "#34d399", fontWeight: 700 }}>{formatPrice(Number(p.price), "DZD")}</span>
                {p.compare_at_price && (
                  <span style={{ color: "#555", fontSize: "11px", textDecoration: "line-through", marginLeft: "6px" }}>{formatPrice(Number(p.compare_at_price), "DZD")}</span>
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
                    style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 12px", borderRadius: "7px", background: "rgba(16,185,129,0.12)", color: "#6ee7b7", textDecoration: "none", fontSize: "12px", fontWeight: 700 }}
                  >
                    <Pencil size={12} /> Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    disabled={deleting === p.id}
                    style={{ display: "flex", alignItems: "center", gap: "4px", padding: "7px 12px", borderRadius: "7px", background: "rgba(239,68,68,0.12)", color: "#f87171", border: "1px solid rgba(239,68,68,0.12)", cursor: "pointer", fontSize: "12px", fontWeight: 700, opacity: deleting === p.id ? 0.5 : 1 }}
                  >
                    <Trash2 size={12} /> {deleting === p.id ? "..." : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "#71717a" }}>
                No products yet. <Link href="/admin/products/new" style={{ color: "#34d399" }}>Add your first product</Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
