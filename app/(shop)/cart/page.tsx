"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven&apos;t added anything yet.</p>
        <Button asChild size="lg">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const shipping = getTotalPrice() >= 50 ? 0 : 5.99;
  const total = getTotalPrice() + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-sm transition-shadow">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                {product.images?.[0] ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <Link href={`/products/${product.slug}`} className="text-sm font-semibold hover:underline underline-offset-4 truncate">
                    {product.name}
                  </Link>
                  <button onClick={() => removeItem(product.id)} aria-label="Remove" className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {product.category && (
                  <p className="text-xs text-muted-foreground mt-0.5">{product.category.name}</p>
                )}

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors" aria-label="Decrease">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors" aria-label="Increase">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-semibold">{formatPrice(product.price * quantity)}</span>
                </div>
              </div>
            </div>
          ))}

          <button onClick={clearCart} className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors">
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-5">
            <h2 className="text-lg font-semibold">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({items.reduce((t, i) => t + i.quantity, 0)} items)</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-600 dark:text-green-400" : ""}>
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground bg-muted rounded-lg p-2">
                  Add {formatPrice(50 - getTotalPrice())} more for free shipping
                </p>
              )}
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button size="lg" className="w-full" asChild>
              <Link href="/checkout">
                Checkout <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
