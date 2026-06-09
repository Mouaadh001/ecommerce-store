"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getProductColorVariants } from "@/lib/product-options";
import type { Product, Category } from "@/types";

type ColorVariantDraft = {
  label: string;
  value: string;
  image_url: string;
  imageFileIndex: number | null;
};

type Props = {
  categories: Pick<Category, "id" | "name">[];
  product?: Product;
};

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter();
  const isEdit = !!product;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [colorVariants, setColorVariants] = useState<ColorVariantDraft[]>(() => {
    const variants = product ? getProductColorVariants(product) : [];

    return variants.map((variant) => ({
      label: variant.label,
      value: variant.value || "#111111",
      image_url: variant.image_url ?? "",
      imageFileIndex: null,
    }));
  });

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    price: product?.price?.toString() ?? "",
    compare_at_price: product?.compare_at_price?.toString() ?? "",
    images: product?.images?.join(", ") ?? "",
    sizes: product?.sizes?.join(", ") ?? "",
    category_id: product?.category_id ?? "",
    stock: product?.stock?.toString() ?? "0",
    featured: product?.featured ?? false,
  });

  const set = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const parseList = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const filePreviews = useMemo(
    () => imageFiles.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [imageFiles]
  );

  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [filePreviews]);

  const addImageFiles = (files: FileList | null) => {
    if (!files?.length) return;

    setError("");
    const accepted = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed.");
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Each image must be 5MB or smaller.");
        return false;
      }

      return true;
    });

    setImageFiles((current) => [...current, ...accepted]);
  };

  const removeImageFile = (index: number) => {
    setImageFiles((current) => current.filter((_, i) => i !== index));
    setColorVariants((current) =>
      current.map((variant) => {
        if (variant.imageFileIndex === null) return variant;
        if (variant.imageFileIndex === index) return { ...variant, imageFileIndex: null };
        if (variant.imageFileIndex > index) {
          return { ...variant, imageFileIndex: variant.imageFileIndex - 1 };
        }
        return variant;
      })
    );
  };

  const updateColorVariant = (
    index: number,
    field: keyof ColorVariantDraft,
    value: string | number | null
  ) => {
    setColorVariants((current) =>
      current.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const addColorVariant = () => {
    setColorVariants((current) => [
      ...current,
      { label: "", value: "#111111", image_url: "", imageFileIndex: null },
    ]);
  };

  const removeColorVariant = (index: number) => {
    setColorVariants((current) => current.filter((_, i) => i !== index));
  };

  const uploadImages = async (slug: string) => {
    if (imageFiles.length === 0) return [];

    const supabase = createClient();
    const uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${slug}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
        });

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const slug = form.slug.trim() || autoSlug(form.name);

    if (!slug) {
      setError("Product name or slug is required.");
      setLoading(false);
      return;
    }

    let uploadedImages: string[] = [];
    try {
      uploadedImages = await uploadImages(slug);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
      setLoading(false);
      return;
    }

    const manualImages = parseList(form.images);
    const allImages = [...manualImages, ...uploadedImages];
    const normalizedColorVariants = colorVariants
      .map((variant, index) => {
        const hasColorData =
          variant.label.trim() ||
          variant.value !== "#111111" ||
          variant.image_url.trim() ||
          variant.imageFileIndex !== null;

        if (!hasColorData) return null;

        return {
          label: variant.label.trim() || `Color ${index + 1}`,
          value: variant.value || "#111111",
          image_url:
            variant.imageFileIndex !== null
              ? uploadedImages[variant.imageFileIndex] ?? null
              : variant.image_url.trim() || null,
        };
      })
      .filter((variant): variant is { label: string; value: string; image_url: string | null } =>
        Boolean(variant)
      );

    const payload = {
      name: form.name.trim(),
      slug,
      description: form.description.trim(),
      price: parseFloat(form.price),
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      images: allImages,
      colors: normalizedColorVariants.map((variant) => variant.label),
      color_variants: normalizedColorVariants,
      sizes: parseList(form.sizes),
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
  const manualImageUrls = parseList(form.images);

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
          <label style={labelStyle}>Images</label>
          <label
            style={{
              ...inputStyle,
              minHeight: "112px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "8px",
              cursor: "pointer",
              borderStyle: "dashed",
              color: "#a1a1aa",
            }}
          >
            <span style={{ color: "#e1e1e8", fontWeight: 700 }}>Choose images from your computer</span>
            <span style={{ fontSize: "12px", color: "#666" }}>JPG, PNG, WebP, or GIF. Max 5MB each.</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => addImageFiles(event.target.files)}
              style={{ display: "none" }}
            />
          </label>
          {filePreviews.length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
              {filePreviews.map((preview, index) => (
                <div key={preview.url} style={{ position: "relative", width: "84px", height: "84px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview.url} alt={preview.file.name} style={{ width: "100%", height: "100%", borderRadius: "10px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.08)" }} />
                  <button
                    type="button"
                    onClick={() => removeImageFile(index)}
                    aria-label={`Remove ${preview.file.name}`}
                    style={{
                      position: "absolute",
                      top: "-7px",
                      right: "-7px",
                      width: "22px",
                      height: "22px",
                      borderRadius: "999px",
                      border: "1px solid rgba(255,255,255,0.16)",
                      background: "#18181f",
                      color: "#fff",
                      cursor: "pointer",
                      lineHeight: 1,
                    }}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Image URLs (optional)</label>
          <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.images} onChange={(e) => set("images", e.target.value)} placeholder="https://..., https://..." />
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#555" }}>You can still paste public image URLs, separated by commas</p>
          {parseList(form.images).length > 0 && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" }}>
              {parseList(form.images).slice(0, 6).map((image, index) => (
                <div key={`${image}-${index}`} style={{ width: "72px", height: "72px", borderRadius: "10px", overflow: "hidden", background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={`Product preview ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Options */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
            <label style={{ ...labelStyle, margin: 0 }}>Colors</label>
            <button
              type="button"
              onClick={addColorVariant}
              style={{ padding: "7px 11px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)", background: "#18181f", color: "#e1e1e8", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}
            >
              Add color
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {colorVariants.length === 0 && (
              <p style={{ margin: 0, color: "#555", fontSize: "13px" }}>Add colors only when the product has selectable color variants.</p>
            )}
            {colorVariants.map((variant, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr 1.2fr auto",
                  gap: "10px",
                  alignItems: "center",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  padding: "10px",
                  background: "#0d0d13",
                }}
              >
                <input
                  type="color"
                  value={variant.value}
                  onChange={(event) => updateColorVariant(index, "value", event.target.value)}
                  aria-label={`Color value ${index + 1}`}
                  style={{ width: "44px", height: "38px", border: "none", padding: 0, background: "transparent", cursor: "pointer" }}
                />
                <input
                  style={inputStyle}
                  value={variant.label}
                  onChange={(event) => updateColorVariant(index, "label", event.target.value)}
                  placeholder="Black"
                />
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value={
                    variant.imageFileIndex !== null
                      ? `file:${variant.imageFileIndex}`
                      : variant.image_url
                        ? `url:${variant.image_url}`
                        : ""
                  }
                  onChange={(event) => {
                    const value = event.target.value;
                    if (!value) {
                      updateColorVariant(index, "image_url", "");
                      updateColorVariant(index, "imageFileIndex", null);
                      return;
                    }
                    if (value.startsWith("file:")) {
                      updateColorVariant(index, "image_url", "");
                      updateColorVariant(index, "imageFileIndex", Number(value.replace("file:", "")));
                      return;
                    }
                    updateColorVariant(index, "image_url", value.replace("url:", ""));
                    updateColorVariant(index, "imageFileIndex", null);
                  }}
                >
                  <option value="">Use main image</option>
                  {manualImageUrls.map((url, imageIndex) => (
                    <option key={`${url}-${imageIndex}`} value={`url:${url}`}>
                      URL image {imageIndex + 1}
                    </option>
                  ))}
                  {filePreviews.map((preview, imageIndex) => (
                    <option key={preview.url} value={`file:${imageIndex}`}>
                      Uploaded image {imageIndex + 1} - {preview.file.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeColorVariant(index)}
                  aria-label={`Remove color ${variant.label || index + 1}`}
                  style={{ width: "34px", height: "34px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.12)", background: "#18181f", color: "#e1e1e8", cursor: "pointer" }}
                >
                  x
                </button>
              </div>
            ))}
          </div>

          {colorVariants.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
              {colorVariants.filter((variant) => variant.label.trim()).map((variant) => (
                <span key={`${variant.label}-${variant.value}`} style={{ display: "inline-flex", alignItems: "center", gap: "7px", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "999px", padding: "6px 10px", fontSize: "12px", color: "#d4d4d8" }}>
                  <span style={{ width: "14px", height: "14px", borderRadius: "999px", background: variant.value, border: "1px solid rgba(255,255,255,0.3)" }} />
                  {variant.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label style={labelStyle}>Sizes</label>
          <input style={inputStyle} value={form.sizes} onChange={(e) => set("sizes", e.target.value)} placeholder="S, M, L, XL" />
          {parseList(form.sizes).length > 0 && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
              {parseList(form.sizes).map((size) => (
                <span key={size} style={{ border: "1px solid rgba(255,255,255,0.12)", borderRadius: "8px", padding: "5px 10px", fontSize: "12px", color: "#d4d4d8" }}>
                  {size}
                </span>
              ))}
            </div>
          )}
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
