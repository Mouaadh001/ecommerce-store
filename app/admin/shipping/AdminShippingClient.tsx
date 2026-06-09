"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { ShippingPrice } from "@/lib/shipping";

export default function AdminShippingClient({ prices }: { prices: ShippingPrice[] }) {
  const [rows, setRows] = useState(prices);
  const [saving, setSaving] = useState(false);
  const changedCount = useMemo(() => {
    return rows.filter((row, index) => {
      const original = prices[index];
      return (
        Number(row.home_price) !== Number(original.home_price) ||
        Number(row.office_price) !== Number(original.office_price)
      );
    }).length;
  }, [prices, rows]);

  const updatePrice = (
    wilayaCode: string,
    field: "home_price" | "office_price",
    value: string
  ) => {
    setRows((current) =>
      current.map((row) =>
        row.wilaya_code === wilayaCode
          ? { ...row, [field]: value === "" ? 0 : Number(value) }
          : row
      )
    );
  };

  const save = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("shipping_prices").upsert(rows, {
      onConflict: "wilaya_code",
    });

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Shipping prices saved");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <p style={{ margin: 0, color: "#777", fontSize: "13px" }}>
          {rows.length} wilayas · {changedCount} unsaved changes
        </p>
        <button
          onClick={save}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            background: "#10b981",
            color: "#04130d",
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.65 : 1,
          }}
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Prices"}
        </button>
      </div>

      <div
        style={{
          background: "#111118",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          overflow: "auto",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Code", "Wilaya", "Arabic", "Home / باب المنزل", "Office / المكتب"].map((heading) => (
                <th
                  key={heading}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    color: "#666",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.wilaya_code} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <td style={{ padding: "12px 16px", color: "#888", fontFamily: "monospace" }}>
                  {row.wilaya_code.padStart(2, "0")}
                </td>
                <td style={{ padding: "12px 16px", color: "#e1e1e8", fontWeight: 600 }}>
                  {row.wilaya_name_fr}
                </td>
                <td style={{ padding: "12px 16px", color: "#e1e1e8", direction: "rtl" }}>
                  {row.wilaya_name_ar}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <PriceInput
                    value={row.home_price}
                    onChange={(value) => updatePrice(row.wilaya_code, "home_price", value)}
                  />
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <PriceInput
                    value={row.office_price}
                    onChange={(value) => updatePrice(row.wilaya_code, "office_price", value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PriceInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="number"
      min="0"
      step="1"
      value={Number(value)}
      onChange={(event) => onChange(event.target.value)}
      style={{
        width: "120px",
        padding: "9px 10px",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "#0a0a0f",
        color: "#e1e1e8",
        outline: "none",
      }}
    />
  );
}
