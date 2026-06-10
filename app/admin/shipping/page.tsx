import { createClient } from "@/lib/supabase/server";
import { mergeShippingPrices, type ShippingPrice, type StopDeskPrice } from "@/lib/shipping";
import AdminShippingClient from "./AdminShippingClient";

export default async function AdminShippingPage() {
  const supabase = await createClient();
  const [{ data: shippingRows }, { data: stopDeskRows }] = await Promise.all([
    supabase.from("shipping_prices").select("*").order("wilaya_code", { ascending: true }),
    supabase.from("stop_desk_prices").select("*").order("wilaya_code", { ascending: true }),
  ]);

  const prices = mergeShippingPrices(shippingRows as Partial<ShippingPrice>[] | null);

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#fff", margin: 0 }}>
          أسعار الشحن
        </h1>
        <p style={{ color: "#666", marginTop: "4px", fontSize: "14px" }}>
          حدد أسعار التوصيل للمنزل ولكل مكتب شحن متاح.
        </p>
      </div>
      <AdminShippingClient
        prices={prices}
        stopDeskPrices={(stopDeskRows ?? []) as StopDeskPrice[]}
      />
    </div>
  );
}
