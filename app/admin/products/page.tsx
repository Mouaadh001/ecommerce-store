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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Catalog</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Products</h1>
          <p className="mt-2 text-sm text-zinc-400">{products?.length ?? 0} products total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-400"
        >
          <PlusCircle size={16} />
          Add Product
        </Link>
      </div>

      <AdminProductsClient products={products ?? []} />
    </div>
  );
}
