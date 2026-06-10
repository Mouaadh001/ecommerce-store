import { createClient } from "@/lib/supabase/server";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(quantity, price_at_purchase, product:products(name))")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Fulfillment</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Orders</h1>
        <p className="mt-2 text-sm text-zinc-400">{orders?.length ?? 0} orders total</p>
      </div>
      <AdminOrdersClient orders={orders ?? []} />
    </div>
  );
}
