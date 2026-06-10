"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Lock, MapPin, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";
import { WILAYAS } from "@/lib/algeria";
import { getProductColorVariants } from "@/lib/product-options";
import {
  DELIVERY_LABELS_AR,
  getShippingPrice,
  getStopDeskPrice,
  type DeliveryType,
  type ShippingPrice,
  type StopDeskPrice,
} from "@/lib/shipping";
import {
  getStopDeskCommunes as getOfficeCommunes,
  wilayaHasStopDesk as wilayaHasOffice,
} from "@/lib/stop-desks";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type FormState = {
  fullName: string;
  phone: string;
  wilayaCode: string;
  communeId: string;
  deliveryType: DeliveryType;
  stopDeskKey: string;
};

const initialForm: FormState = {
  fullName: "",
  phone: "",
  wilayaCode: "",
  communeId: "",
  deliveryType: "home",
  stopDeskKey: "",
};

type Props = {
  product: Product;
  shippingPrices: ShippingPrice[];
  stopDeskPrices: StopDeskPrice[];
  quantity: number;
  selectedColor: string;
  selectedSize: string;
};

export function ProductInlineOrderForm({
  product,
  shippingPrices,
  stopDeskPrices,
  quantity,
  selectedColor,
  selectedSize,
}: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const colors = getProductColorVariants(product);
  const selectedColorVariant = colors.find((color) => color.label === selectedColor);

  const selectedWilaya = useMemo(
    () => WILAYAS.find((wilaya) => wilaya.code === form.wilayaCode),
    [form.wilayaCode]
  );
  const selectedCommune = selectedWilaya?.communes.find((c) => c.id === form.communeId);

  // Office pickup uses the existing stop-desk price table/data.
  const isOffice = form.deliveryType === "office";
  const officeCommunes = useMemo(
    () => (form.wilayaCode ? getOfficeCommunes(form.wilayaCode) : []),
    [form.wilayaCode]
  );
  const wilayaNoOffice = isOffice && form.wilayaCode && !wilayaHasOffice(form.wilayaCode);
  const selectedOffice = officeCommunes.find((c) => c.key === form.stopDeskKey);

  // Shipping price calculation
  const productTotal = product.price * quantity;
  let shipping = 0;
  if (form.wilayaCode) {
    if (isOffice && form.stopDeskKey) {
      shipping = getStopDeskPrice(stopDeskPrices, form.wilayaCode, form.stopDeskKey);
    } else if (!isOffice) {
      shipping = getShippingPrice(shippingPrices, form.wilayaCode, form.deliveryType);
    }
  }
  const total = productTotal + shipping;

  const set = (key: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "wilayaCode" ? { communeId: "", stopDeskKey: "" } : {}),
      ...(key === "deliveryType" ? { stopDeskKey: "" } : {}),
    }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.fullName.trim() || !form.phone.trim() || !form.wilayaCode) {
      toast.error("يرجى ملء كل المعلومات المطلوبة");
      return;
    }
    if (!isOffice && !form.communeId) {
      toast.error("يرجى اختيار البلدية");
      return;
    }
    if (isOffice && !form.stopDeskKey) {
      toast.error("يرجى اختيار المكتب");
      return;
    }
    if (wilayaNoOffice) {
      toast.error("لا توجد مكاتب في ولايتك");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            email: null,
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
          },
          shippingAddress: {
            country: "Algeria",
            wilayaCode: form.wilayaCode,
            wilayaNameAr: selectedWilaya?.nameAr,
            wilayaNameFr: selectedWilaya?.nameFr,
            communeId: isOffice ? null : form.communeId,
            communeNameAr: isOffice
              ? selectedOffice?.nameAr
              : selectedCommune?.nameAr,
            communeNameFr: isOffice
              ? selectedOffice?.nameFr
              : selectedCommune?.nameFr,
            stopDeskKey: isOffice ? form.stopDeskKey : null,
            address: "",
            notes: "",
            deliveryType: form.deliveryType,
            deliveryLabelAr: DELIVERY_LABELS_AR[form.deliveryType],
            shippingPrice: shipping,
          },
          items: [
            {
              product_id: product.id,
              quantity,
              selected_options: {
                color: selectedColor || null,
                colorValue: selectedColorVariant?.value || null,
                colorImage: selectedColorVariant?.image_url || null,
                size: selectedSize || null,
              },
            },
          ],
        }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "تعذر إرسال الطلب");
      setOrderId(json.orderId);
      const adminEmail = json.emailStatus?.admin;
      if (adminEmail && !adminEmail.sent) {
        toast.error(
          `تم حفظ الطلب لكن لم يتم إرسال الإيميل: ${
            adminEmail.error ?? adminEmail.skippedReason ?? "سبب غير معروف"
          }`
        );
      } else {
        toast.success("تم إرسال الطلب بنجاح");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <section className="rounded-lg border border-border bg-card p-5 text-center" dir="rtl">
        <CheckCircle2 className="mx-auto mb-3 h-11 w-11 text-green-600" />
        <h2 className="text-xl font-bold">تم استلام طلبك</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          رقم الطلب: <span className="font-mono text-foreground">#{orderId.slice(0, 8).toUpperCase()}</span>
        </p>
        <Button asChild variant="outline" className="mt-5">
          <Link href="/products">العودة إلى المنتجات</Link>
        </Button>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-5" dir="rtl">
      <div>
        <h2 className="text-xl font-bold">معلومات الطلب</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full name */}
        <Field label="الاسم الكامل *" id="inline-fullName">
          <Input
            id="inline-fullName"
            required
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="مثال: محمد أمين"
          />
        </Field>

        {/* Phone */}
        <Field label="رقم الهاتف *" id="inline-phone">
          <Input
            id="inline-phone"
            type="tel"
            required
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="0550 00 00 00"
          />
        </Field>

        {/* Delivery type */}
        <Field label="نوع التوصيل *" id="inline-deliveryType">
          <select
            id="inline-deliveryType"
            required
            value={form.deliveryType}
            onChange={(e) => set("deliveryType", e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground"
          >
            <option value="home">{DELIVERY_LABELS_AR.home}</option>
            <option value="office">{DELIVERY_LABELS_AR.office}</option>
          </select>
        </Field>

        {/* Wilaya */}
        <Field label="الولاية *" id="inline-wilaya">
          <select
            id="inline-wilaya"
            required
            value={form.wilayaCode}
            onChange={(e) => set("wilayaCode", e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground"
          >
            <option value="">اختر الولاية</option>
            {WILAYAS.map((wilaya) => (
              <option key={wilaya.code} value={wilaya.code}>
                {wilaya.code.padStart(2, "0")} - {wilaya.nameAr}
              </option>
            ))}
          </select>
        </Field>

        {/* Commune (home only) */}
        {!isOffice && (
          <div className="sm:col-span-2">
            <Field label="البلدية / المدينة *" id="inline-commune">
              <select
                id="inline-commune"
                required
                value={form.communeId}
                onChange={(e) => set("communeId", e.target.value)}
                disabled={!selectedWilaya}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground disabled:opacity-50"
              >
                <option value="">اختر البلدية</option>
                {selectedWilaya?.communes.map((commune) => (
                  <option key={commune.id} value={commune.id}>
                    {commune.nameAr || commune.nameFr}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        {/* Office selection */}
        {isOffice && (
          <div className="sm:col-span-2">
            {/* No wilaya chosen yet */}
            {!form.wilayaCode && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>اختر الولاية أولاً لعرض المكاتب المتاحة</span>
              </div>
            )}

            {/* Wilaya has no offices */}
            {wilayaNoOffice && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-sm text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  عذراً، لا تتوفر مكاتب في ولايتك حالياً.
                  يرجى اختيار التوصيل للمنزل، أو اختيار ولاية أخرى.
                </span>
              </div>
            )}

            {/* Wilaya has offices */}
            {form.wilayaCode && !wilayaNoOffice && (
              <Field label="المكتب *" id="inline-stopDesk">
                <select
                  id="inline-stopDesk"
                  required
                  value={form.stopDeskKey}
                  onChange={(e) => set("stopDeskKey", e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground"
                >
                  <option value="">اختر المكتب</option>
                  {officeCommunes.map((c) => {
                    const price = getStopDeskPrice(stopDeskPrices, form.wilayaCode, c.key);
                    return (
                      <option key={c.key} value={c.key}>
                        {c.nameAr} — {formatPrice(price, "DZD")}
                      </option>
                    );
                  })}
                </select>
              </Field>
            )}
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-2 text-sm">
        {selectedColor && <SummaryRow label="اللون" value={selectedColor} />}
        {selectedSize && <SummaryRow label="المقاس" value={selectedSize} />}
        <SummaryRow label="سعر المنتجات" value={formatPrice(productTotal, "DZD")} />
        <SummaryRow
          label={`التوصيل ${form.wilayaCode ? `(${DELIVERY_LABELS_AR[form.deliveryType]})` : ""}`}
          value={
            isOffice
              ? form.stopDeskKey
                ? formatPrice(shipping, "DZD")
                : "اختر المكتب"
              : form.wilayaCode
              ? formatPrice(shipping, "DZD")
              : "اختر الولاية"
          }
        />
      </div>

      <Separator />

      <SummaryRow label="المجموع" value={formatPrice(total, "DZD")} strong />

      <Button
        type="submit"
        size="lg"
        className="w-full bg-emerald-500 text-base font-bold text-emerald-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 focus-visible:ring-emerald-400"
        loading={loading}
        disabled={product.stock === 0}
      >
        <Lock className="h-4 w-4" />
        {loading ? "جاري إرسال الطلب..." : "اطلب الآن"}
      </Button>
    </form>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "font-bold text-lg" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className="text-left whitespace-nowrap text-foreground">{value}</span>
    </div>
  );
}
