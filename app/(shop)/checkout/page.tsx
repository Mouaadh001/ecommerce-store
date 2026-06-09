"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Lock, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const checkoutSchema = z.object({
  email: z.string().email("Invalid email address"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  street: z.string().min(5, "Street address required"),
  city: z.string().min(2, "City required"),
  state: z.string().min(2, "State required"),
  zip: z.string().min(4, "ZIP code required"),
  country: z.string().min(2, "Country required"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: "United States" },
  });

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Nothing to checkout</h1>
        <p className="text-muted-foreground mb-8">Your cart is empty.</p>
        <Button asChild><Link href="/products">Shop Now</Link></Button>
      </div>
    );
  }

  const shipping = getTotalPrice() >= 50 ? 0 : 5.99;
  const total = getTotalPrice() + shipping;

  const onSubmit = async (data: CheckoutFormData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            email: data.email,
            fullName: data.fullName,
            phone: data.phone,
          },
          shippingAddress: {
            street: data.street,
            city: data.city,
            state: data.state,
            zip: data.zip,
            country: data.country,
          },
          items: items.map((i) => ({
            product_id: i.product.id,
            quantity: i.quantity,
            price_at_purchase: i.product.price,
          })),
          total,
        }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? "Order failed");

      clearCart();
      toast.success("Order placed! Check your email for confirmation.");
      router.push(`/orders?success=true`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="email">Email address *</Label>
                  <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full name *</Label>
                  <Input id="fullName" placeholder="John Doe" {...register("fullName")} />
                  {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" {...register("phone")} />
                </div>
              </div>
            </section>

            {/* Shipping */}
            <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="street">Street address *</Label>
                  <Input id="street" placeholder="123 Main Street, Apt 4B" {...register("street")} />
                  {errors.street && <p className="text-xs text-red-500">{errors.street.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" placeholder="New York" {...register("city")} />
                  {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" placeholder="NY" {...register("state")} />
                  {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="zip">ZIP code *</Label>
                  <Input id="zip" placeholder="10001" {...register("zip")} />
                  {errors.zip && <p className="text-xs text-red-500">{errors.zip.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" placeholder="United States" {...register("country")} />
                  {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
                </div>
              </div>
            </section>

            {/* Payment note */}
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Payment</h2>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-dashed border-border">
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  This is a demo. No real payment will be processed. Connect Stripe to enable payments.
                </p>
              </div>
            </section>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-lg font-semibold">Order Summary</h2>

              <ul className="space-y-3">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex gap-3 items-start">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="48px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-foreground text-background text-[10px] font-bold rounded-full flex items-center justify-center">
                        {quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(product.price)} each</p>
                    </div>
                    <span className="text-sm font-medium">{formatPrice(product.price * quantity)}</span>
                  </li>
                ))}
              </ul>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 dark:text-green-400" : ""}>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              <Button type="submit" size="lg" className="w-full" loading={loading}>
                <Lock className="w-4 h-4" />
                {loading ? "Placing Order..." : "Place Order"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By placing your order, you agree to our{" "}
                <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">Terms</Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
