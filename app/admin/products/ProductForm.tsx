"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Product, Category } from "@/types";

type Props = {
  categories: Pick<Category, "id" | "name">[];
  product?: Product;
};

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const isEdit = !!product;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    compare_at_price: product?.compare_at_price?.toString() ?? "",
    images: product?.images?.join(", ") ?? "",
    category_id: product?.category_id ?? "",
    stock: product?.stock?.toString() ?? "0",
    featured: product?.featured ?? false,
  });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim() || autoSlug(form.name),
      description: form.description.trim(),
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      category_id: form.category_id || null,
      stock: parseInt(form.stock),
      featured: form.featured,
    };

    const supabase = createClient();
    const { error: err } = isEdit
      ? await supabase.from("products").update(payload).eq("id", product!.id)
      : await supabase.from("products").insert(payload);

    if (err) { setError(err.message); setLoading(false); return; }
    router.push("/admin/products");
    router.refresh();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", background: "#0a0a0f",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px",
    color: "#e1e1e8", fontSize: "14px", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "13px", fontWeight: 600,
    color: "#888", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em",
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "760px" }}>
      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", padding: "12px 16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Name + Slug */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Product Name *</label>
            <input required style={inputStyle} value={form.name} onChange={(e) => { set("name", e.target.value); if (!isEdit) set("slug", autoSlug(e.target.value)); }} placeholder="e.g. Wireless Headphones" />
          </div>
          <div>
            <label style={labelStyle}>Slug *</label>
            <input required style={inputStyle} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="e.g. wireless-headphones" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea rows={4} style={{ ...inputStyle, resize: "vertical" }} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Product description..." />
        </div>

        {/* Price + Compare price */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Price ($) *</label>
            <input required type="number" min="0" step="0.01" style={inputStyle} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label style={labelStyle}>Compare-At Price ($)</label>
            <input type="number" min="0" step="0.01" style={inputStyle} value={form.compare_at_price} onChange={(e) => set("compare_at_price", e.target.value)} placeholder="Optional original price" />
          </div>
        </div>

        {/* Category + Stock */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.category_id} onChange={(e) => set("category_id", e.target.value)}>
              <option value="">— No category —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Stock</label>
            <input type="number" min="0" style={inputStyle} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          </div>
        </div>

        {/* Images */}
        <div>
          <label style={labelStyle}>Image URLs (comma-separated)</label>
          <input style={inputStyle} value={form.images} onChange={(e) => set("images", e.target.value)} placeholder="https://..., https://..." />
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#555" }}>Paste Unsplash or any public image URLs, separated by commas</p>
        </div>

        {/* Featured */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#8b5cf6" }} />
          <label htmlFor="featured" style={{ ...labelStyle, margin: 0, cursor: "pointer" }}>Mark as Featured product</label>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "12px 28px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "opacity 0.15s" }}
        >
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          style={{ padding: "12px 20px", background: "transparent", color: "#666", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
