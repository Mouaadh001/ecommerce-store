import type { Product, ProductColorVariant } from "@/types";

type ProductColorSource = {
  colors?: Product["colors"] | string;
  color_variants?: Product["color_variants"];
};

const NAMED_COLORS: Record<string, string> = {
  black: "#111111",
  noir: "#111111",
  white: "#ffffff",
  blanc: "#ffffff",
  red: "#ef4444",
  rouge: "#ef4444",
  blue: "#2563eb",
  bleu: "#2563eb",
  green: "#16a34a",
  vert: "#16a34a",
  yellow: "#facc15",
  jaune: "#facc15",
  orange: "#f97316",
  pink: "#ec4899",
  rose: "#ec4899",
  purple: "#9333ea",
  violet: "#9333ea",
  brown: "#92400e",
  marron: "#92400e",
  gray: "#6b7280",
  grey: "#6b7280",
  gris: "#6b7280",
  beige: "#d6b98c",
};

export function getProductColorVariants(product: ProductColorSource) {
  const rawVariants = normalizeRawVariants(product.color_variants);
  const variants = rawVariants
    .map((variant, index) => normalizeVariant(variant, index))
    .filter((variant): variant is ProductColorVariant => Boolean(variant));

  if (variants.length > 0) {
    return dedupeVariants(variants);
  }

  return dedupeVariants(normalizeColorList(product.colors).map((color) => ({
    label: color,
    value: normalizeColorValue(color),
    image_url: null,
  })));
}

function normalizeRawVariants(value: ProductColorSource["color_variants"]): unknown[] {
  const parsed = typeof value === "string" ? safeParseJson(value) : value;

  if (Array.isArray(parsed)) return parsed;

  if (parsed && typeof parsed === "object") {
    const objectValue = parsed as Record<string, unknown>;
    if (Array.isArray(objectValue.variants)) return objectValue.variants;
    if (Array.isArray(objectValue.colors)) return objectValue.colors;
  }

  return [];
}

function safeParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeVariant(value: unknown, index: number): ProductColorVariant | null {
  if (typeof value === "string") {
    const label = value.trim();
    if (!label) return null;

    return {
      label,
      value: normalizeColorValue(label),
      image_url: null,
    };
  }

  if (!value || typeof value !== "object") return null;

  const variant = value as Partial<ProductColorVariant> & {
    name?: unknown;
    color?: unknown;
    hex?: unknown;
    color_value?: unknown;
    image?: unknown;
    imageUrl?: unknown;
  };
  const label = firstString(variant.label, variant.name, variant.color) ?? `Color ${index + 1}`;

  return {
    label,
    value: normalizeColorValue(
      firstString(variant.value, variant.hex, variant.color_value, variant.color) ?? label
    ),
    image_url: firstString(variant.image_url, variant.imageUrl, variant.image) ?? null,
  };
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return null;
}

function normalizeColorList(value: ProductColorSource["colors"]): string[] {
  if (Array.isArray(value)) {
    return value.filter((color): color is string => typeof color === "string" && Boolean(color.trim()));
  }

  if (typeof value !== "string") return [];

  return value
    .replace(/^\{|\}$/g, "")
    .split(",")
    .map((color) => color.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

function normalizeColorValue(value: string) {
  const normalized = value.trim().toLowerCase();

  if (/^#[0-9a-f]{3}$/i.test(normalized)) {
    return `#${normalized
      .slice(1)
      .split("")
      .map((part) => part + part)
      .join("")}`;
  }

  if (/^#[0-9a-f]{6}$/i.test(normalized)) return normalized;

  return NAMED_COLORS[normalized] ?? "#ffffff";
}

function dedupeVariants(variants: ProductColorVariant[]) {
  const seen = new Set<string>();

  return variants.filter((variant) => {
    const key = variant.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getReadableTextColor(hex: string) {
  const value = normalizeColorValue(hex).replace("#", "");
  if (value.length !== 6) return "#ffffff";

  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 150 ? "#111111" : "#ffffff";
}
