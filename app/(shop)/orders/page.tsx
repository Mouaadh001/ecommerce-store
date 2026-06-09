import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Order } from "@/types";
import { OrdersClient } from "./OrdersClient";

export const metadata: Metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, product:products(id, name, slug, images, price))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <OrdersClient orders={(orders as Order[]) ?? []} />;
}
