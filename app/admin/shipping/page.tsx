import { createClient } from "@/lib/supabase/server";
import { mergeShippingPrices, type ShippingPrice } from "@/lib/shipping";
import AdminShippingClient from "./AdminShippingClient";

export default async function AdminShippingPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shipping_prices")
    .select("*")
    .order("wilaya_code", { ascending: true });

  const prices = mergeShippingPrices(data as Partial<ShippingPrice>[] | null);

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 }}>
          Shipping Prices
        </h1>
        <p style={{ color: "#666", marginTop: "4px", fontSize: "14px" }}>
          Set delivery prices for each Algerian wilaya.
        </p>
      </div>
      <AdminShippingClient prices={prices} />
    </div>
  );
}
