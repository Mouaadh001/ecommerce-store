"use client";

import { useMemo, useState } from "react";
import { Save, ChevronDown, ChevronRight, MapPin } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { ShippingPrice, StopDeskPrice } from "@/lib/shipping";
import { STOP_DESK_DATA } from "@/lib/stop-desks";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  prices: ShippingPrice[];
  stopDeskPrices: StopDeskPrice[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminShippingClient({ prices, stopDeskPrices }: Props) {
  const [rows, setRows] = useState(prices);
  const [sdRows, setSdRows] = useState<StopDeskPrice[]>(() => {
    // Merge fetched stop-desk prices with the full static stop-desk list (default 0)
    const map = new Map(stopDeskPrices.map((r) => [`${r.wilaya_code}::${r.commune_key}`, r]));
    const merged: StopDeskPrice[] = [];
    for (const wilaya of STOP_DESK_DATA) {
      for (const commune of wilaya.communes) {
        const key = `${wilaya.wilayaCode}::${commune.key}`;
        merged.push(
          map.get(key) ?? {
            wilaya_code: wilaya.wilayaCode,
            commune_key: commune.key,
            commune_name_ar: commune.nameAr,
            commune_name_fr: commune.nameFr,
            price: 0,
          }
        );
      }
    }
    return merged;
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"home_office" | "stop_desk">("home_office");
  const [expandedWilaya, setExpandedWilaya] = useState<string | null>(null);

  // Count unsaved changes for home delivery
  const changedHO = useMemo(() => {
    return rows.filter((row, index) => {
      const original = prices[index];
      return Number(row.home_price) !== Number(original?.home_price ?? 0);
    }).length;
  }, [prices, rows]);

  // Count unsaved changes for office pickup
  const changedSD = useMemo(() => {
    const origMap = new Map(stopDeskPrices.map((r) => [`${r.wilaya_code}::${r.commune_key}`, r.price]));
    return sdRows.filter((r) => {
      const orig = origMap.get(`${r.wilaya_code}::${r.commune_key}`) ?? 0;
      return Number(r.price) !== Number(orig);
    }).length;
  }, [stopDeskPrices, sdRows]);

  const updateHome = (wilayaCode: string, value: string) => {
    setRows((cur) =>
      cur.map((row) =>
        row.wilaya_code === wilayaCode
          ? { ...row, home_price: value === "" ? 0 : Number(value) }
          : row
      )
    );
  };

  const updateSD = (wilayaCode: string, communeKey: string, value: string) => {
    setSdRows((cur) =>
      cur.map((r) =>
        r.wilaya_code === wilayaCode && r.commune_key === communeKey
          ? { ...r, price: value === "" ? 0 : Number(value) }
          : r
      )
    );
  };

  const saveHO = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("shipping_prices")
      .upsert(rows, { onConflict: "wilaya_code" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تم حفظ أسعار التوصيل");
  };

  const saveSD = async () => {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("stop_desk_prices")
      .upsert(sdRows, { onConflict: "wilaya_code,commune_key" });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("تم حفظ أسعار المكاتب");
  };

  const totalChanged = changedHO + changedSD;
  const activeChanged = activeTab === "home_office" ? changedHO : changedSD;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "0" }}>
        {(["home_office", "stop_desk"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px 8px 0 0",
              border: "1px solid",
              borderColor: activeTab === tab ? "rgba(255,255,255,0.12)" : "transparent",
              borderBottom: activeTab === tab ? "1px solid #0a0a0f" : "transparent",
              background: activeTab === tab ? "#111118" : "transparent",
              color: activeTab === tab ? "#e1e1e8" : "#666",
              fontWeight: activeTab === tab ? 600 : 400,
              cursor: "pointer",
              fontSize: "13px",
              marginBottom: "-1px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {tab === "home_office" ? "🏠 المنزل" : "🏢 المكاتب"}
            {tab === "home_office" && changedHO > 0 && (
              <span style={{ background: "#f59e0b", color: "#000", borderRadius: "999px", fontSize: "10px", padding: "1px 6px", fontWeight: 700 }}>
                {changedHO}
              </span>
            )}
            {tab === "stop_desk" && changedSD > 0 && (
              <span style={{ background: "#f59e0b", color: "#000", borderRadius: "999px", fontSize: "10px", padding: "1px 6px", fontWeight: 700 }}>
                {changedSD}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <p style={{ margin: 0, color: "#777", fontSize: "13px" }}>
          {activeTab === "home_office"
            ? `${rows.length} وَلَوية · ${changedHO} تغيير غير محفوظ`
            : `${STOP_DESK_DATA.reduce((s, w) => s + w.communes.length, 0)} مكتب · ${changedSD} تغيير غير محفوظ`}
        </p>
        <button
          onClick={activeTab === "home_office" ? saveHO : saveSD}
          disabled={saving || activeChanged === 0}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "10px 18px", borderRadius: "8px", border: "none",
            background: totalChanged > 0 ? "#10b981" : "#1e1e2a",
            color: totalChanged > 0 ? "#04130d" : "#555",
            fontWeight: 700, cursor: saving || activeChanged === 0 ? "not-allowed" : "pointer",
            opacity: saving ? 0.65 : 1, transition: "all 0.2s",
          }}
        >
          <Save size={15} />
          {saving ? "جاري الحفظ..." : "حفظ الأسعار"}
        </button>
      </div>

      {/* ── Tab: Home ── */}
      {activeTab === "home_office" && (
        <div style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "620px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {["الرمز", "الولاية", "بالعربية", "🏠 المنزل (دج)"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "14px 16px", color: "#666", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
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
                  <td style={{ padding: "12px 16px", color: "#e1e1e8", fontWeight: 600 }}>{row.wilaya_name_fr}</td>
                  <td style={{ padding: "12px 16px", color: "#e1e1e8", direction: "rtl" }}>{row.wilaya_name_ar}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <PriceInput value={row.home_price} onChange={(v) => updateHome(row.wilaya_code, v)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: Offices ── */}
      {activeTab === "stop_desk" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {STOP_DESK_DATA.map((wilaya) => {
            const isOpen = expandedWilaya === wilaya.wilayaCode;
            const wilayaRow = rows.find((r) => r.wilaya_code === wilaya.wilayaCode);

            return (
              <div
                key={wilaya.wilayaCode}
                style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", overflow: "hidden" }}
              >
                {/* Wilaya header — clickable to expand */}
                <button
                  type="button"
                  onClick={() => setExpandedWilaya(isOpen ? null : wilaya.wilayaCode)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 18px", background: "none", border: "none",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{ color: "#555", fontSize: "12px", fontFamily: "monospace", width: "24px" }}>
                    {wilaya.wilayaCode.padStart(2, "0")}
                  </span>
                  <MapPin size={14} color="#10b981" style={{ flexShrink: 0 }} />
                  <span style={{ color: "#e1e1e8", fontWeight: 600, flex: 1, textAlign: "left" }}>
                    {wilayaRow?.wilaya_name_fr ?? wilaya.wilayaCode}
                  </span>
                  <span style={{ color: "#888", direction: "rtl", fontSize: "13px", marginLeft: "auto" }}>
                    {wilayaRow?.wilaya_name_ar ?? ""}
                  </span>
                  <span style={{ color: "#555", fontSize: "11px", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: "999px", whiteSpace: "nowrap" }}>
                    {wilaya.communes.length} مكتب
                  </span>
                  {isOpen
                    ? <ChevronDown size={15} color="#666" />
                    : <ChevronRight size={15} color="#666" />}
                </button>

                {/* Commune price rows */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    {wilaya.communes.map((commune, ci) => {
                      const sdRow = sdRows.find(
                        (r) => r.wilaya_code === wilaya.wilayaCode && r.commune_key === commune.key
                      );
                      return (
                        <div
                          key={commune.key}
                          style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr 160px",
                            alignItems: "center", gap: "16px",
                            padding: "11px 18px 11px 48px",
                            borderBottom: ci < wilaya.communes.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                            background: "rgba(255,255,255,0.015)",
                          }}
                        >
                          <span style={{ color: "#aaa", fontSize: "13px" }}>{commune.nameFr}</span>
                          <span style={{ color: "#888", fontSize: "13px", direction: "rtl" }}>{commune.nameAr}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <PriceInput
                              value={sdRow?.price ?? 0}
                              onChange={(v) => updateSD(wilaya.wilayaCode, commune.key, v)}
                            />
                            <span style={{ color: "#555", fontSize: "12px", whiteSpace: "nowrap" }}>دج</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Shared input ─────────────────────────────────────────────────────────────

function PriceInput({ value, onChange }: { value: number; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      min="0"
      step="1"
      value={Number(value)}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "110px", padding: "8px 10px", borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.1)", background: "#0a0a0f",
        color: "#e1e1e8", outline: "none", fontSize: "13px",
      }}
      onFocus={(e) => (e.target.style.borderColor = "rgba(16,185,129,0.5)")}
      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
    />
  );
}
