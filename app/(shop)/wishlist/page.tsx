"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
        <p className="text-muted-foreground mb-8">Save items you love by clicking the heart icon on any product.</p>
        <Button asChild size="lg"><Link href="/products">Browse Products</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Wishlist</h1>
          <p className="text-muted-foreground mt-1">{items.length} saved {items.length === 1 ? "item" : "items"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {items.map(({ product }) => (
          <div key={product.id} className="group rounded-2xl border border-border bg-card overflow-hidden hover-scale">
            <div className="relative aspect-square bg-muted overflow-hidden">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <button
                onClick={() => { removeItem(product.id); toast("Removed from wishlist"); }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <Link href={`/products/${product.slug}`} className="block">
                {product.category && (
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{product.category.name}</p>
                )}
                <p className="text-sm font-semibold line-clamp-2 hover:underline underline-offset-4">{product.name}</p>
                <p className="text-sm font-bold mt-1">{formatPrice(product.price)}</p>
              </Link>

              <Button
                size="sm"
                className="w-full"
                onClick={() => { addToCart(product); toast.success("Added to cart", { description: product.name }); }}
                disabled={product.stock === 0}
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
