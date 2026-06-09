"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingBag, Star, Minus, Plus, Check, Truck, Shield } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/products/ProductCard";
import { cn } from "@/lib/utils";

interface Props {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);
  const images = product.images?.length ? product.images : ["/placeholder.jpg"];
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    toast.success(`${quantity}× ${product.name} added to cart`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = () => {
    toggleItem(product);
    toast(isWishlisted ? "Removed from wishlist" : "Saved to wishlist");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground truncate max-w-[150px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {discount && (
              <div className="absolute top-4 left-4">
                <Badge variant="destructive">-{discount}%</Badge>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all",
                    selectedImage === i ? "border-foreground" : "border-border hover:border-muted-foreground"
                  )}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {product.category && (
            <Link href={`/products?category=${product.category.slug}`}>
              <Badge variant="secondary">{product.category.name}</Badge>
            </Link>
          )}

          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("w-4 h-4", i < 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.9 (128 reviews)</span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
            {discount && (
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Save {discount}%
              </span>
            )}
          </div>

          <Separator />

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium mb-2 block">Quantity</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label="Decrease"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                  aria-label="Increase"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {addedToCart ? (
                <><Check className="w-4 h-4" /> Added!</>
              ) : (
                <><ShoppingBag className="w-4 h-4" /> Add to Cart</>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={cn("w-4 h-4", isWishlisted && "fill-red-500 text-red-500")} />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: Truck, text: "Free shipping over $50" },
              { icon: Shield, text: "2-year warranty" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-xl p-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight mb-8">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
