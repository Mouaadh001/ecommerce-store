"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ChevronDown, ChevronUp, Package, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface Props {
  orders: Order[];
}

const statusConfig: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "success" | "destructive" | "outline"; icon: React.ElementType }> = {
  pending:    { label: "Pending",    variant: "secondary", icon: Clock },
  processing: { label: "Processing", variant: "default",   icon: Package },
  shipped:    { label: "Shipped",    variant: "default",   icon: Truck },
  delivered:  { label: "Delivered",  variant: "success",   icon: CheckCircle },
  cancelled:  { label: "Cancelled",  variant: "destructive", icon: XCircle },
};

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const status = statusConfig[order.status] ?? statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Order Header */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: ID + Date */}
          <div className="flex min-w-0 items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm font-mono">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(order.created_at)}
              </p>
            </div>
          </div>

          {/* Right: Status + Total */}
          <div className="flex flex-wrap items-center gap-3 sm:ml-0">
            <Badge variant={status.variant} className="gap-1.5 text-xs px-2.5 py-1">
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </Badge>
            <span className="font-bold text-base break-words">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Item thumbnails preview */}
        {order.order_items && order.order_items.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              {order.order_items.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="relative w-8 h-8 rounded-lg overflow-hidden border-2 border-background bg-muted flex-shrink-0"
                >
                  {item.product?.images?.[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product?.name ?? ""}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {order.order_items.length > 4 && (
                <div className="w-8 h-8 rounded-lg bg-muted border-2 border-background flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    +{order.order_items.length - 4}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {order.order_items.length} {order.order_items.length === 1 ? "item" : "items"}
            </span>
          </div>
        )}

        {/* Toggle expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          aria-expanded={expanded}
        >
          {expanded ? (
            <><ChevronUp className="w-3.5 h-3.5" /> Hide details</>
          ) : (
            <><ChevronDown className="w-3.5 h-3.5" /> View details</>
          )}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-border">
          {/* Items list */}
          <ul className="divide-y divide-border">
            {order.order_items?.map((item) => (
              <li key={item.id} className="flex gap-3 items-start p-4 sm:p-6">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  {item.product?.images?.[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product?.name ?? ""}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {item.product?.slug ? (
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="text-sm font-medium hover:underline underline-offset-4 line-clamp-2"
                    >
                      {item.product?.name ?? "Product"}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium line-clamp-2">{item.product?.name ?? "Product"}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Qty: {item.quantity} × {formatPrice(item.price_at_purchase)}
                  </p>
                </div>
                <span className="text-sm font-semibold flex-shrink-0 break-words">
                  {formatPrice(item.price_at_purchase * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {/* Shipping address + total */}
          <div className="p-4 sm:p-6 bg-muted/30 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Shipping Address</p>
                <address className="not-italic text-sm leading-relaxed">
                  {order.shipping_address?.street}<br />
                  {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}<br />
                  {order.shipping_address?.country}
                </address>
              </div>
              <div className="sm:text-right space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Payment Summary</p>
                <div className="flex sm:justify-end justify-between text-muted-foreground">
                  <span>Items</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="flex sm:justify-end justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-green-600 dark:text-green-400">Free</span>
                </div>
                <Separator className="my-2" />
                <div className="flex sm:justify-end justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Reorder CTA */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/products">Buy Again</Link>
              </Button>
              {order.status === "shipped" && (
                <Button size="sm" variant="secondary">Track Package</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OrdersClient({ orders }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            {orders.length === 0 ? "No orders yet" : `${orders.length} ${orders.length === 1 ? "order" : "orders"}`}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground mb-8 max-w-sm">
            When you place your first order, it will appear here. Start exploring our products!
          </p>
          <Button asChild size="lg">
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
