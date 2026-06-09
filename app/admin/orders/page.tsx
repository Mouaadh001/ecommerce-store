import { createClient } from "@/lib/supabase/server";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(quantity, price_at_purchase, product:products(name))")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 }}>Orders</h1>
        <p style={{ color: "#666", marginTop: "4px", fontSize: "14px" }}>{orders?.length ?? 0} orders total</p>
      </div>
      <AdminOrdersClient orders={orders ?? []} />
    </div>
  );
}
