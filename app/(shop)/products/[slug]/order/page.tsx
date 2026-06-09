import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types";
import { mergeShippingPrices, type ShippingPrice } from "@/lib/shipping";
import ProductOrderClient from "./ProductOrderClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name")
    .eq("slug", slug)
    .single();

  return { title: data ? `Order ${data.name}` : "Order Product" };
}

export default async function ProductOrderPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: shippingRows }] = await Promise.all([
    supabase.from("products").select("*, category:categories(*)").eq("slug", slug).single(),
    supabase.from("shipping_prices").select("*"),
  ]);

  if (!product) notFound();

  return (
    <ProductOrderClient
      product={product as Product}
      shippingPrices={mergeShippingPrices(shippingRows as Partial<ShippingPrice>[] | null)}
    />
  );
}
