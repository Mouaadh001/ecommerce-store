import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getResend } from "@/lib/resend";
import { formatPrice, formatDate } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, shippingAddress, items, total } = body;

    const supabase = await createClient();

    // Get authenticated user (optional — guests allowed)
    const { data: { user } } = await supabase.auth.getUser();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        status: "pending",
        total,
        shipping_address: shippingAddress,
        customer_email: customer.email,
        customer_name: customer.fullName,
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // Create order items
    const orderItems = items.map((item: { product_id: string; quantity: number; price_at_purchase: number }) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw new Error(itemsError.message);

    // Fetch product details for email
    const productIds = items.map((i: { product_id: string }) => i.product_id);
    const { data: products } = await supabase
      .from("products")
      .select("id, name, price")
      .in("id", productIds);

    const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);

    // Build email HTML
    const itemsHtml = items
      .map((item: { product_id: string; quantity: number; price_at_purchase: number }) => {
        const product = productMap.get(item.product_id);
        return `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
              <strong>${product?.name ?? "Product"}</strong>
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: center;">
              ${item.quantity}
            </td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
              ${formatPrice(item.price_at_purchase * item.quantity)}
            </td>
          </tr>
        `;
      })
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f9f9f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e5e5;">
          
          <!-- Header -->
          <div style="background: #0a0a0a; padding: 32px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
              ✅ Order Confirmed
            </h1>
            <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">
              Thank you for your purchase, ${customer.fullName}!
            </p>
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            <div style="background: #f9f9f9; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">Order ID</p>
              <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0a0a0a; font-family: monospace;">#${order.id.slice(0, 8).toUpperCase()}</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
              <div>
                <p style="margin: 0 0 4px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">Order Date</p>
                <p style="margin: 0; font-size: 14px; color: #0a0a0a;">${formatDate(order.created_at)}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em;">Email</p>
                <p style="margin: 0; font-size: 14px; color: #0a0a0a;">${customer.email}</p>
              </div>
            </div>

            <h2 style="font-size: 16px; margin: 0 0 16px; color: #0a0a0a;">Items Ordered</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr>
                  <th style="text-align: left; padding: 8px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e5e5;">Product</th>
                  <th style="text-align: center; padding: 8px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e5e5;">Qty</th>
                  <th style="text-align: right; padding: 8px 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e5e5e5;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 16px 0 0; font-weight: 700; font-size: 16px;">Total</td>
                  <td style="padding: 16px 0 0; text-align: right; font-weight: 700; font-size: 16px;">${formatPrice(total)}</td>
                </tr>
              </tfoot>
            </table>

            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
              <h2 style="font-size: 16px; margin: 0 0 12px; color: #0a0a0a;">Shipping To</h2>
              <p style="margin: 0; font-size: 14px; color: #555; line-height: 1.6;">
                ${customer.fullName}<br>
                ${shippingAddress.street}<br>
                ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}<br>
                ${shippingAddress.country}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f9f9f9; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e5e5;">
            <p style="margin: 0; font-size: 13px; color: #888;">
              Questions? Reply to this email or visit our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/contact" style="color: #0a0a0a;">support page</a>.
            </p>
            <p style="margin: 12px 0 0; font-size: 12px; color: #bbb;">© ${new Date().getFullYear()} Luminary Store</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send confirmation email
    if (process.env.RESEND_API_KEY) {
      await getResend().emails.send({
        from: "Luminary Store <noreply@luminarystore.com>",
        to: customer.email,
        subject: `Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
        html: emailHtml,
      });
    }

    return NextResponse.json({ orderId: order.id }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[orders/POST]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, product:products(*))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
