"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Star } from "lucide-react";
import { Product } from "@/types";
import { getProductColorVariants } from "@/lib/product-options";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const colorVariants = getProductColorVariants(product);
  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : null;

  return (
    <Link href={`/products/${product.slug}`} className={cn("group block", className)}>
      <div className="hover-scale rounded-2xl overflow-hidden border border-border bg-card">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images?.[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount && (
              <Badge variant="destructive">-{discount}%</Badge>
            )}
            {product.featured && (
              <Badge className="bg-foreground text-background">Featured</Badge>
            )}
            {product.stock === 0 && (
              <Badge variant="secondary">Out of stock</Badge>
            )}
          </div>

          {/* Order overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
            <div
              className={cn(
                "w-full py-2.5 px-4 bg-foreground text-background text-sm font-medium rounded-xl",
                "flex items-center justify-center gap-2"
              )}
            >
              <ShoppingBag className="w-4 h-4" />
              {product.stock === 0 ? "Out of Stock" : "View Product"}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {product.category && (
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                  {product.category.name}
                </p>
              )}
              <p className="text-sm font-medium truncate">{product.name}</p>
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">4.9</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
            {product.compare_at_price && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          {(colorVariants.length > 0 || product.sizes?.length > 0) && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {colorVariants.slice(0, 4).map((color) => (
                <span key={color.label} className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full border border-black/10" style={{ backgroundColor: color.value }} />
                  {color.label}
                </span>
              ))}
              {colorVariants.length > 4 && (
                <span className="text-[11px] text-muted-foreground">+{colorVariants.length - 4}</span>
              )}
              {product.sizes?.slice(0, 4).map((size) => (
                <span key={size} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
