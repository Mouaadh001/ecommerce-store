import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 }}>Products</h1>
          <p style={{ color: "#666", marginTop: "4px", fontSize: "14px" }}>{products?.length ?? 0} products total</p>
        </div>
        <Link
          href="/admin/products/new"
          style={{ display: "flex", alignItems: "center", gap: "8px", background: "#8b5cf6", color: "#fff", textDecoration: "none", padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, transition: "opacity 0.15s" }}
        >
          <PlusCircle size={16} />
          Add Product
        </Link>
      </div>

      <AdminProductsClient products={products ?? []} />
    </div>
  );
}
