import { WILAYAS } from "@/lib/algeria";

export type DeliveryType = "home" | "office";

export type ShippingPrice = {
  wilaya_code: string;
  wilaya_name_ar: string;
  wilaya_name_fr: string;
  home_price: number;
  office_price: number;
};

export const DELIVERY_LABELS_AR: Record<DeliveryType, string> = {
  home: "باب المنزل",
  office: "المكتب",
};

export function getDefaultShippingPrices(): ShippingPrice[] {
  return WILAYAS.map((wilaya) => ({
    wilaya_code: wilaya.code,
    wilaya_name_ar: wilaya.nameAr,
    wilaya_name_fr: wilaya.nameFr,
    home_price: 0,
    office_price: 0,
  }));
}

export function mergeShippingPrices(rows?: Partial<ShippingPrice>[] | null) {
  const byCode = new Map((rows ?? []).map((row) => [row.wilaya_code, row]));

  return getDefaultShippingPrices().map((fallback) => {
    const row = byCode.get(fallback.wilaya_code);

    return {
      ...fallback,
      home_price: Number(row?.home_price ?? fallback.home_price),
      office_price: Number(row?.office_price ?? fallback.office_price),
    };
  });
}

export function getShippingPrice(
  rows: ShippingPrice[],
  wilayaCode: string,
  deliveryType: DeliveryType
) {
  const row = rows.find((item) => item.wilaya_code === wilayaCode);
  if (!row) return 0;
  return deliveryType === "home" ? row.home_price : row.office_price;
}
