"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Lock, Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";
import { WILAYAS } from "@/lib/algeria";
import {
  DELIVERY_LABELS_AR,
  getShippingPrice,
  type DeliveryType,
  type ShippingPrice,
} from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  wilayaCode: string;
  communeId: string;
  address: string;
  notes: string;
  deliveryType: DeliveryType;
};

const initialForm: FormState = {
  fullName: "",
  phone: "",
  email: "",
  wilayaCode: "",
  communeId: "",
  address: "",
  notes: "",
  deliveryType: "home",
};

export default function ProductOrderClient({
  product,
  shippingPrices,
}: {
  product: Product;
  shippingPrices: ShippingPrice[];
}) {
  const searchParams = useSearchParams();
  const initialQuantity = Math.max(1, Number(searchParams.get("quantity")) || 1);
  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];
  const queryColor = searchParams.get("color") ?? "";
  const querySize = searchParams.get("size") ?? "";
  const [quantity, setQuantity] = useState(initialQuantity);
  const [selectedColor, setSelectedColor] = useState(
    colors.includes(queryColor) ? queryColor : colors[0] ?? ""
  );
  const [selectedSize, setSelectedSize] = useState(
    sizes.includes(querySize) ? querySize : sizes[0] ?? ""
  );
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const selectedWilaya = useMemo(
    () => WILAYAS.find((wilaya) => wilaya.code === form.wilayaCode),
    [form.wilayaCode]
  );
  const selectedCommune = selectedWilaya?.communes.find(
    (commune) => commune.id === form.communeId
  );
  const productTotal = product.price * quantity;
  const shipping = form.wilayaCode
    ? getShippingPrice(shippingPrices, form.wilayaCode, form.deliveryType)
    : 0;
  const total = productTotal + shipping;
  const image = product.images?.[0];

  const set = (key: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "wilayaCode" ? { communeId: "" } : {}),
    }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.fullName.trim() || !form.phone.trim() || !form.wilayaCode || !form.communeId || !form.address.trim()) {
      toast.error("يرجى ملء كل المعلومات المطلوبة");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            email: form.email.trim() || null,
            fullName: form.fullName.trim(),
            phone: form.phone.trim(),
          },
          shippingAddress: {
            country: "Algeria",
            wilayaCode: form.wilayaCode,
            wilayaNameAr: selectedWilaya?.nameAr,
            wilayaNameFr: selectedWilaya?.nameFr,
            communeId: form.communeId,
            communeNameAr: selectedCommune?.nameAr,
            communeNameFr: selectedCommune?.nameFr,
            address: form.address.trim(),
            notes: form.notes.trim(),
            deliveryType: form.deliveryType,
          },
          items: [
            {
              product_id: product.id,
              quantity,
              selected_options: {
                color: selectedColor || null,
                size: selectedSize || null,
              },
            },
          ],
        }),
      });

      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "تعذر إرسال الطلب");
      setOrderId(json.orderId);
      toast.success("تم إرسال الطلب بنجاح");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  if (orderId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center" dir="rtl">
        <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">تم استلام طلبك</h1>
        <p className="text-muted-foreground mb-6">
          رقم الطلب: <span className="font-mono text-foreground">#{orderId.slice(0, 8).toUpperCase()}</span>
        </p>
        <Button asChild>
          <Link href="/products">العودة إلى المنتجات</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10" dir="rtl">
      <Link href={`/products/${product.slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4 rotate-180" />
        الرجوع إلى المنتج
      </Link>

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-8">
        <div className="space-y-5">
          <section className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4">
            <h1 className="text-xl sm:text-2xl font-bold">معلومات الطلب</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="الاسم الكامل *" id="fullName">
                <Input id="fullName" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="مثال: محمد أمين" />
              </Field>
              <Field label="رقم الهاتف *" id="phone">
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0550 00 00 00" />
              </Field>
              <Field label="البريد الإلكتروني" id="email">
                <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="اختياري" />
              </Field>
              <Field label="نوع التوصيل *" id="deliveryType">
                <select
                  id="deliveryType"
                  value={form.deliveryType}
                  onChange={(e) => set("deliveryType", e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground"
                >
                  <option value="home">{DELIVERY_LABELS_AR.home}</option>
                  <option value="office">{DELIVERY_LABELS_AR.office}</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold">عنوان التوصيل</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="الولاية *" id="wilaya">
                <select
                  id="wilaya"
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
              <Field label="البلدية / المدينة *" id="commune">
                <select
                  id="commune"
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
              <div className="sm:col-span-2">
                <Field label="العنوان الكامل *" id="address">
                  <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="الحي، الشارع، رقم المنزل..." />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="ملاحظات" id="notes">
                  <textarea
                    id="notes"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="معلومات إضافية للتوصيل"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground"
                  />
                </Field>
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4">
          <div className="flex gap-3">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {image ? (
                <Image src={image} alt={product.name} fill className="object-cover" sizes="80px" />
              ) : (
                <ShoppingBag className="w-8 h-8 text-muted-foreground m-6" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold leading-snug">{product.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{formatPrice(product.price, "DZD")}</p>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">الكمية</Label>
            <div className="flex items-center border border-border rounded-lg overflow-hidden w-fit">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
              <button type="button" onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {(colors.length > 0 || sizes.length > 0) && (
            <div className="space-y-4">
              {colors.length > 0 && (
                <div>
                  <Label className="mb-2 block">اللون</Label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`min-h-9 rounded-lg border px-3 text-sm transition-colors ${
                          selectedColor === color
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background hover:bg-muted"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div>
                  <Label className="mb-2 block">المقاس</Label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`min-h-9 min-w-10 rounded-lg border px-3 text-sm font-medium transition-colors ${
                          selectedSize === size
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background hover:bg-muted"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator />

          <div className="space-y-2 text-sm">
            {selectedColor && <SummaryRow label="اللون" value={selectedColor} />}
            {selectedSize && <SummaryRow label="المقاس" value={selectedSize} />}
            <SummaryRow label="سعر المنتجات" value={formatPrice(productTotal, "DZD")} />
            <SummaryRow
              label={`التوصيل ${form.wilayaCode ? `(${DELIVERY_LABELS_AR[form.deliveryType]})` : ""}`}
              value={form.wilayaCode ? formatPrice(shipping, "DZD") : "اختر الولاية"}
            />
          </div>

          <Separator />

          <SummaryRow label="المجموع" value={formatPrice(total, "DZD")} strong />

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            <Lock className="w-4 h-4" />
            {loading ? "جاري إرسال الطلب..." : "تأكيد الطلب"}
          </Button>
        </aside>
      </form>
    </div>
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
