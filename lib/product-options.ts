import type { Product, ProductColorVariant } from "@/types";

export function getProductColorVariants(product: Pick<Product, "colors" | "color_variants">) {
  const variants = Array.isArray(product.color_variants)
    ? product.color_variants.filter((variant): variant is ProductColorVariant =>
        Boolean(variant?.label?.trim())
      )
    : [];

  if (variants.length > 0) {
    return variants;
  }

  return (product.colors ?? []).map((color) => ({
    label: color,
    value: "#111111",
    image_url: null,
  }));
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
