import { createClient } from "@/lib/supabase/server";
import ProductForm from "../../ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  if (!product) notFound();

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 }}>Edit Product</h1>
        <p style={{ color: "#666", marginTop: "4px", fontSize: "14px" }}>{product.name}</p>
      </div>
      <ProductForm categories={categories ?? []} product={product} />
    </div>
  );
}
