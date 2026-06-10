import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import { mergeShippingPrices, type ShippingPrice } from "@/lib/shipping";
import { ProductDetailClient } from "./ProductDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Product Not Found" };
  return {
    title: data.name,
    description: data.description,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const [{ data }, { data: shippingRows }] = await Promise.all([
    supabase.from("products").select("*, category:categories(*)").eq("slug", slug).single(),
    supabase.from("shipping_prices").select("*"),
  ]);

  if (!data) notFound();

  // Fetch related products
  const { data: related } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("category_id", data.category_id)
    .neq("id", data.id)
    .limit(4);

  return (
    <ProductDetailClient
      product={data as Product}
      relatedProducts={(related as Product[]) ?? []}
      shippingPrices={mergeShippingPrices(shippingRows as Partial<ShippingPrice>[] | null)}
    />
  );
}
