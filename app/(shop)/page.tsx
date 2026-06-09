import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Zap, Shield, RefreshCcw, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Product, Category } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Luminary Store — Premium Shopping Experience",
  description: "Discover a curated collection of premium products. Minimal, elegant, and beautifully designed.",
};

async function getFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(8);
  return (data as Product[]) ?? [];
}

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").limit(6);
  return (data as Category[]) ?? [];
}

const features = [
  { icon: Zap, title: "Fast Delivery", desc: "Get your order in 2–5 business days" },
  { icon: Shield, title: "Secure Payments", desc: "100% encrypted & secure checkout" },
  { icon: RefreshCcw, title: "Easy Returns", desc: "Free returns within 30 days" },
  { icon: Star, title: "Premium Quality", desc: "Hand-picked products, curated for you" },
];

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
          <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted text-xs font-medium text-muted-foreground mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              New arrivals every week
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Premium
              <br />
              <span className="gradient-text">shopping,</span>
              <br />
              re-imagined.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Discover a curated collection of exceptional products, crafted with care and delivered with precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <Button size="lg" asChild>
                <Link href="/products">
                  Shop Now <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products?featured=true">View Featured</Link>
              </Button>
            </div>

            <div className="flex items-center gap-4 mt-10 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {["🧑", "👩", "🧔", "👱"].map((emoji, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-base">
                    {emoji}
                  </div>
                ))}
              </div>
              <p><strong className="text-foreground">12,000+</strong> happy customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Explore</p>
              <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
            </div>
            <Link href="/products" className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block">
              All products →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted hover-scale"
              >
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white font-semibold text-lg">{cat.name}</p>
                  {cat.description && (
                    <p className="text-white/70 text-sm mt-0.5 line-clamp-1">{cat.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Curated</p>
            <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
          </div>
          <Link href="/products?featured=true" className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block">
            View all →
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-border">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative rounded-3xl overflow-hidden bg-foreground text-background p-10 sm:p-16 text-center">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to elevate your style?</h2>
            <p className="text-background/70 max-w-md mx-auto mb-8">
              Join thousands of customers who trust Luminary for premium products.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
