import { createClient } from "@/lib/supabase/server";
import ProductForm from "../ProductForm";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("id, name").order("name");

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 }}>Add New Product</h1>
        <p style={{ color: "#666", marginTop: "4px", fontSize: "14px" }}>Fill in the details below to create a product</p>
      </div>
      <ProductForm categories={categories ?? []} />
    </div>
  );
}
