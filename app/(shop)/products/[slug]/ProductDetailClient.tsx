"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { Product } from "@/types";
import { getProductColorVariants, getReadableTextColor } from "@/lib/product-options";
import { type ShippingPrice, type StopDeskPrice } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/products/ProductCard";
import { cn } from "@/lib/utils";
import { ProductInlineOrderForm } from "./ProductInlineOrderForm";

interface Props {
  product: Product;
  relatedProducts: Product[];
  shippingPrices: ShippingPrice[];
  stopDeskPrices: StopDeskPrice[];
}

export function ProductDetailClient({ product, relatedProducts, shippingPrices, stopDeskPrices }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const colors = getProductColorVariants(product);
  const sizes = product.sizes ?? [];
  const [selectedColor, setSelectedColor] = useState(colors[0]?.label ?? "");
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");
  const images = product.images?.length ? product.images : ["/placeholder.jpg"];
  const selectedColorVariant = colors.find((color) => color.label === selectedColor);
  const selectedImageUrl = selectedColorVariant?.image_url || images[selectedImage];
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-8 flex-wrap">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
            <Image
              src={selectedImageUrl}
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
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all",
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{product.name}</h1>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl sm:text-4xl font-bold">{formatPrice(product.price, "DZD")}</span>
            {product.compare_at_price && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.compare_at_price, "DZD")}
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

          {(colors.length > 0 || sizes.length > 0) && (
            <div className="space-y-5">
              {colors.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.label}
                        type="button"
                        onClick={() => setSelectedColor(color.label)}
                        className={cn(
                          "inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 text-sm transition-colors",
                          selectedColor === color.label
                            ? "border-white shadow-sm ring-2 ring-white/70"
                            : "border-border bg-background hover:bg-muted"
                        )}
                        style={
                          selectedColor === color.label
                            ? {
                                backgroundColor: color.value,
                                color: getReadableTextColor(color.value),
                              }
                            : undefined
                        }
                      >
                        <span
                          className="h-4 w-4 rounded-full border border-black/15"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "min-h-10 min-w-12 rounded-xl border px-4 text-sm font-medium transition-colors",
                          selectedSize === size
                            ? "border-white bg-white text-black shadow-sm ring-2 ring-white/70"
                            : "border-border bg-background hover:bg-muted"
                        )}
                        style={
                          selectedSize === size
                            ? { backgroundColor: "#ffffff", color: "#000000", borderColor: "#ffffff" }
                            : undefined
                        }
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
            </div>
          </div>

          <ProductInlineOrderForm
            product={product}
            shippingPrices={shippingPrices}
            stopDeskPrices={stopDeskPrices}
            quantity={quantity}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
          />

        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 sm:mt-20">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
