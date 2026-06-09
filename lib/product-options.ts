import type { Product, ProductColorVariant } from "@/types";

export function getProductColorVariants(product: Pick<Product, "colors" | "color_variants">) {
  const rawVariants =
    typeof product.color_variants === "string"
      ? safeParseVariants(product.color_variants)
      : product.color_variants;
  const variants = Array.isArray(rawVariants)
    ? rawVariants
        .map((variant, index) => normalizeVariant(variant, index))
        .filter((variant): variant is ProductColorVariant => Boolean(variant))
    : [];

  if (variants.length > 0) {
    return variants;
  }

  return (product.colors ?? []).filter(Boolean).map((color) => ({
    label: color,
    value: color.startsWith("#") ? color : "#ffffff",
    image_url: null,
  }));
}

function safeParseVariants(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return [];
  }
}

function normalizeVariant(value: unknown, index: number): ProductColorVariant | null {
  if (!value || typeof value !== "object") return null;

  const variant = value as Partial<ProductColorVariant>;
  const colorValue =
    typeof variant.value === "string" && variant.value.trim()
      ? variant.value
      : "#ffffff";

  return {
    label:
      typeof variant.label === "string" && variant.label.trim()
        ? variant.label.trim()
        : `Color ${index + 1}`,
    value: colorValue,
    image_url:
      typeof variant.image_url === "string" && variant.image_url.trim()
        ? variant.image_url
        : null,
  };
}

export function getReadableTextColor(hex: string) {
  const value = hex.replace("#", "");
  if (value.length !== 6) return "#ffffff";

  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 150 ? "#111111" : "#ffffff";
}
