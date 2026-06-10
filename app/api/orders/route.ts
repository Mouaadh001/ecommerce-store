import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getResend } from "@/lib/resend";
import { formatPrice, formatDate } from "@/lib/utils";
import { getProductColorVariants } from "@/lib/product-options";
import {
  DELIVERY_LABELS_AR,
  getShippingPrice,
  mergeShippingPrices,
  type DeliveryType,
  type ShippingPrice,
} from "@/lib/shipping";

const DEFAULT_ORDER_NOTIFICATION_EMAIL = "mouad.2000.bk@gmail.com";
const ORDER_NOTIFICATION_EMAIL =
  process.env.ORDER_NOTIFICATION_EMAIL || DEFAULT_ORDER_NOTIFICATION_EMAIL;

type SelectedOptions = {
  color?: string | null;
  colorValue?: string | null;
  colorImage?: string | null;
  size?: string | null;
};

type EmailSendStatus = {
  recipient: string | null;
  sent: boolean;
  id?: string;
  error?: string;
  skippedReason?: string;
};

function formatSelectedOptions(options?: SelectedOptions | null) {
  const parts = [
    options?.color ? `Color: ${options.color}` : null,
    options?.size ? `Size: ${options.size}` : null,
  ].filter(Boolean);

  return parts.join(" | ");
}

function formatEmailError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown email error";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, shippingAddress, items } = body;

    const authClient = await createClient();
    const supabase = await createServiceClient();

    // Get authenticated user (optional — guests allowed)
    const { data: { user } } = await authClient.auth.getUser();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No order items provided" }, { status: 400 });
    }

    const productIds = items.map((item: { product_id: string }) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, colors, color_variants, sizes")
      .in("id", productIds);

    if (productsError) throw productsError;

    const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);
    const orderItems = items.map((item: {
      product_id: string;
      quantity: number;
      selected_options?: SelectedOptions | null;
    }) => {
      const product = productMap.get(item.product_id);
      if (!product) throw new Error("Product not found");

      const productColors = getProductColorVariants({
        colors: (product.colors as string[] | null) ?? [],
        color_variants: product.color_variants ?? [],
      });
      const productSizes = (product.sizes as string[] | null) ?? [];
      const color = item.selected_options?.color?.trim() || null;
      const size = item.selected_options?.size?.trim() || null;
      const selectedColorVariant = productColors.find((variant) => variant.label === color);

      if (color && productColors.length > 0 && !selectedColorVariant) {
        throw new Error("Selected color is not available for this product");
      }

      if (size && productSizes.length > 0 && !productSizes.includes(size)) {
        throw new Error("Selected size is not available for this product");
      }

      return {
        product_id: item.product_id,
        quantity: Math.max(1, Number(item.quantity) || 1),
        price_at_purchase: Number(product.price),
        selected_options: {
          color,
          colorValue: selectedColorVariant?.value ?? item.selected_options?.colorValue ?? null,
          colorImage: selectedColorVariant?.image_url ?? item.selected_options?.colorImage ?? null,
          size,
        },
      };
    });

    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price_at_purchase * item.quantity,
      0
    );
    const deliveryType: DeliveryType =
      shippingAddress?.deliveryType === "office" ? "office" : "home";

    const { data: shippingRows } = await supabase
      .from("shipping_prices")
      .select("*");
    const shippingPrices = mergeShippingPrices(
      shippingRows as Partial<ShippingPrice>[] | null
    );
    const shippingPrice = shippingAddress?.wilayaCode
      ? getShippingPrice(shippingPrices, shippingAddress.wilayaCode, deliveryType)
      : 0;
    const total = subtotal + shippingPrice;
    const enrichedShippingAddress = {
      ...shippingAddress,
      customerPhone: customer.phone ?? null,
      deliveryType,
      deliveryLabelAr: DELIVERY_LABELS_AR[deliveryType],
      productSubtotal: subtotal,
      shippingPrice,
      total,
    };

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        status: "pending",
        total,
        shipping_address: enrichedShippingAddress,
        customer_email: customer.email ?? null,
        customer_name: customer.fullName,
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // Create order items
    const orderItemsWithOrder = orderItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_purchase,
      selected_options: item.selected_options,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsWithOrder);

    if (itemsError) throw new Error(itemsError.message);

    // Build email HTML
    const itemsHtml = orderItems
      .map((item) => {
        const product = productMap.get(item.product_id);
        const optionText = formatSelectedOptions(item.selected_options);
        return `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
              <strong>${product?.name ?? "Product"}</strong>
              ${optionText ? `<br><span style="font-size: 12px; color: #777;">${optionText}</span>` : ""}
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
                ${enrichedShippingAddress.address ?? enrichedShippingAddress.street ?? ""}<br>
                ${enrichedShippingAddress.communeNameAr ?? enrichedShippingAddress.city ?? ""}, ${enrichedShippingAddress.wilayaNameAr ?? enrichedShippingAddress.state ?? ""}<br>
                ${enrichedShippingAddress.deliveryLabelAr ?? ""} - ${formatPrice(enrichedShippingAddress.shippingPrice ?? 0, "DZD")}
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

    // Send confirmation email to customer
    const emailStatus: {
      enabled: boolean;
      customer: EmailSendStatus;
      admin: EmailSendStatus;
    } = {
      enabled: Boolean(process.env.RESEND_API_KEY),
      customer: {
        recipient: customer.email ?? null,
        sent: false,
      },
      admin: {
        recipient: ORDER_NOTIFICATION_EMAIL,
        sent: false,
      },
    };

    if (process.env.RESEND_API_KEY) {
      if (customer.email) {
        const { data, error } = await getResend().emails.send({
          from: "Luminary Store <onboarding@resend.dev>",
          to: customer.email,
          subject: `Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
          html: emailHtml,
        });
        if (error) {
          emailStatus.customer.error = formatEmailError(error);
          console.error("[Resend Customer Email Error]:", error);
        } else {
          emailStatus.customer.sent = true;
          emailStatus.customer.id = data?.id;
          console.info("[Resend Customer Email Sent]:", {
            orderId: order.id,
            recipient: customer.email,
            emailId: data?.id,
          });
        }
      } else {
        emailStatus.customer.skippedReason = "Customer email was not provided";
      }

      // Build admin notification email with ALL order details
      const adminItemsHtml = orderItems
        .map((item) => {
          const product = productMap.get(item.product_id);
          const optionText = formatSelectedOptions(item.selected_options);
          return `
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; font-size: 14px;">
                ${product?.name ?? "Unknown Product"}
                ${optionText ? `<br><span style="font-size: 12px; color: #6b7280;">${optionText}</span>` : ""}
              </td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; font-size: 14px; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; font-size: 14px; text-align: right;">${formatPrice(item.price_at_purchase)}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid #e5e5e5; font-size: 14px; text-align: right; font-weight: 600;">${formatPrice(item.price_at_purchase * item.quantity)}</td>
            </tr>
          `;
        })
        .join("");

      const adminEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order Received</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <div style="max-width: 640px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e5e5; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 32px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 8px;">🛍️</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">New Order Received!</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Order #${order.id.slice(0, 8).toUpperCase()} — ${formatDate(order.created_at)}</p>
            </div>

            <!-- Body -->
            <div style="padding: 32px;">

              <!-- Customer Info -->
              <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #16a34a;">
                <h2 style="margin: 0 0 16px; font-size: 15px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 0.05em;">👤 Customer Details</h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 5px 0; color: #6b7280; width: 120px;">Full Name</td>
                    <td style="padding: 5px 0; color: #111; font-weight: 600;">${customer.fullName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #6b7280;">Email</td>
                    <td style="padding: 5px 0; color: #111;"><a href="mailto:${customer.email}" style="color: #16a34a; text-decoration: none;">${customer.email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #6b7280;">Phone</td>
                    <td style="padding: 5px 0; color: #111; font-weight: 600;">${customer.phone ? `<a href="tel:${customer.phone}" style="color: #16a34a; text-decoration: none;">${customer.phone}</a>` : '<span style="color:#9ca3af;">Not provided</span>'}</td>
                  </tr>
                </table>
              </div>

              <!-- Items Ordered -->
              <h2 style="margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 0.05em;">🛒 Items Ordered</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px; border: 1px solid #e5e5e5; border-radius: 10px; overflow: hidden;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Product</th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Qty</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Unit Price</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${adminItemsHtml}
                </tbody>
                <tfoot>
                  <tr style="background: #f9fafb;">
                    <td colspan="3" style="padding: 14px 12px; font-weight: 700; font-size: 15px; color: #111;">Total</td>
                    <td style="padding: 14px 12px; text-align: right; font-weight: 700; font-size: 15px; color: #16a34a;">${formatPrice(total)}</td>
                  </tr>
                </tfoot>
              </table>

              <!-- Shipping Address -->
              <div style="background: #f9fafb; border-radius: 12px; padding: 20px; border-left: 4px solid #6366f1;">
                <h2 style="margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #111; text-transform: uppercase; letter-spacing: 0.05em;">📦 Shipping Address</h2>
                <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.8;">
                  <strong>${customer.fullName}</strong><br>
                  ${enrichedShippingAddress.address ?? enrichedShippingAddress.street ?? ""}<br>
                  ${enrichedShippingAddress.communeNameAr ?? enrichedShippingAddress.city ?? ""}, ${enrichedShippingAddress.wilayaNameAr ?? enrichedShippingAddress.state ?? ""}<br>
                  ${enrichedShippingAddress.deliveryLabelAr ?? ""} - ${formatPrice(enrichedShippingAddress.shippingPrice ?? 0, "DZD")}
                </p>
              </div>

            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; padding: 20px 32px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">Luminary Store Admin Notification • ${formatDate(order.created_at)}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send admin notification
      if (ORDER_NOTIFICATION_EMAIL) {
        const { data, error } = await getResend().emails.send({
          from: "Luminary Store <onboarding@resend.dev>",
          to: ORDER_NOTIFICATION_EMAIL,
          subject: `🛍️ New Order #${order.id.slice(0, 8).toUpperCase()} — ${customer.fullName} (${formatPrice(total)})`,
          html: adminEmailHtml,
        });
        if (error) {
          emailStatus.admin.error = formatEmailError(error);
          console.error("[Resend Admin Email Error]:", error);
        } else {
          emailStatus.admin.sent = true;
          emailStatus.admin.id = data?.id;
          console.info("[Resend Admin Email Sent]:", {
            orderId: order.id,
            recipient: ORDER_NOTIFICATION_EMAIL,
            emailId: data?.id,
          });
        }
      } else {
        emailStatus.admin.skippedReason = "ORDER_NOTIFICATION_EMAIL is not configured";
      }
    } else {
      emailStatus.customer.skippedReason = "RESEND_API_KEY is not configured";
      emailStatus.admin.skippedReason = "RESEND_API_KEY is not configured";
    }

    return NextResponse.json({ orderId: order.id, emailStatus }, { status: 201 });
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
