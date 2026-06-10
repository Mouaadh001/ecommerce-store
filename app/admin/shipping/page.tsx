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
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Delivery pricing</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
          أسعار الشحن
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
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
