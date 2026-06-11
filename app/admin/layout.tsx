"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  PlusCircle,
  LogOut,
  Truck,
  Boxes,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, tone: "#22c55e" },
  { href: "/admin/products", label: "Products", icon: Package, tone: "#38bdf8" },
  { href: "/admin/products/new", label: "Add Product", icon: PlusCircle, tone: "#a78bfa" },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, tone: "#f59e0b" },
  { href: "/admin/shipping", label: "Shipping", icon: Truck, tone: "#14b8a6" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-icon"><Boxes size={19} /></span>
          <div>
            <span className="admin-logo-title">Luminary Admin</span>
            <span className="admin-logo-subtitle">Store operations</span>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ href, label, icon: Icon, exact, tone }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`admin-nav-item${isActive ? " active" : ""}`}
                style={{ "--item-tone": tone } as React.CSSProperties}
              >
                <span className="admin-nav-icon">
                  <Icon size={17} />
                </span>
                <span className="admin-nav-label">{label}</span>
                <span className="admin-nav-active-dot" />
              </Link>
            );
          })}
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          <span className="admin-logout-icon"><LogOut size={16} /></span>
          <span>Sign Out</span>
        </button>
      </aside>

      <main className="admin-main">
        {children}
      </main>

      <style jsx global>{`
        .admin-shell {
          display: flex;
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(16,185,129,0.09), transparent 34%),
            linear-gradient(135deg, #09090d 0%, #0d1014 48%, #08090b 100%);
          color: #e1e1e8;
          font-family: 'Inter', sans-serif;
        }
        .admin-sidebar {
          width: 272px;
          min-height: 100vh;
          background:
            linear-gradient(180deg, rgba(18,20,26,0.96), rgba(10,11,15,0.98));
          border-right: 1px solid rgba(255,255,255,0.08);
          box-shadow: 18px 0 60px rgba(0,0,0,0.32);
          display: flex;
          flex-direction: column;
          padding: 22px 18px;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .admin-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          padding: 0 10px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 22px;
        }
        .admin-logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #34d399, #10b981);
          color: #04130d;
          box-shadow: 0 18px 36px rgba(16,185,129,0.28), inset 0 1px 0 rgba(255,255,255,0.28);
          flex-shrink: 0;
        }
        .admin-logo-title {
          display: block;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0;
          line-height: 1.15;
        }
        .admin-logo-subtitle {
          display: block;
          margin-top: 4px;
          font-size: 11px;
          font-weight: 650;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 46px;
          padding: 7px 10px;
          border-radius: 10px;
          border: 1px solid transparent;
          color: #9ca3af;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          position: relative;
          isolation: isolate;
          overflow: hidden;
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            color 0.18s ease,
            transform 0.18s ease;
        }
        .admin-nav-item::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 16% 50%, color-mix(in srgb, var(--item-tone) 22%, transparent), transparent 38%);
          opacity: 0;
          transition: opacity 0.18s ease;
          z-index: -1;
        }
        .admin-nav-icon {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: color-mix(in srgb, var(--item-tone) 78%, #ffffff);
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
          flex: 0 0 32px;
          transition: transform 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
        }
        .admin-nav-label {
          flex: 1;
          line-height: 1;
          white-space: nowrap;
        }
        .admin-nav-active-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: var(--item-tone);
          opacity: 0;
          box-shadow: 0 0 16px var(--item-tone);
          flex-shrink: 0;
        }
        .admin-nav-item:hover {
          background: rgba(255,255,255,0.055);
          border-color: rgba(255,255,255,0.09);
          color: #f8fafc;
          transform: translateX(3px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.16);
        }
        .admin-nav-item:hover::before {
          opacity: 1;
        }
        .admin-nav-item:hover .admin-nav-icon {
          transform: scale(1.04);
          background: color-mix(in srgb, var(--item-tone) 16%, rgba(255,255,255,0.06));
          box-shadow: 0 10px 24px color-mix(in srgb, var(--item-tone) 18%, transparent);
        }
        .admin-nav-item.active {
          background: color-mix(in srgb, var(--item-tone) 14%, rgba(255,255,255,0.045));
          border-color: color-mix(in srgb, var(--item-tone) 28%, rgba(255,255,255,0.08));
          color: #f8fafc;
          box-shadow: 0 14px 34px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .admin-nav-item.active::before {
          opacity: 1;
        }
        .admin-nav-item.active .admin-nav-icon {
          background: var(--item-tone);
          color: #050609;
          border-color: rgba(255,255,255,0.16);
          box-shadow: 0 12px 26px color-mix(in srgb, var(--item-tone) 24%, transparent);
        }
        .admin-nav-item.active .admin-nav-active-dot {
          opacity: 1;
        }
        .admin-main {
          flex: 1;
          min-width: 0;
          width: 100%;
          padding: 32px;
          overflow-y: auto;
          max-width: 1440px;
        }
        .admin-logout {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 44px;
          padding: 7px 10px;
          border-radius: 10px;
          color: #9ca3af;
          font-size: 14px;
          font-weight: 700;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer;
          width: 100%;
          transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
        }
        .admin-logout-icon {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.045);
          flex-shrink: 0;
        }
        .admin-logout:hover {
          background: rgba(239, 68, 68, 0.11);
          border-color: rgba(239,68,68,0.18);
          color: #f87171;
          transform: translateY(-1px);
        }
        @media (max-width: 860px) {
          .admin-shell {
            flex-direction: column;
          }
          .admin-sidebar {
            width: 100%;
            min-height: auto;
            height: auto;
            position: relative;
            padding: 16px;
          }
          .admin-nav {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 4px;
          }
          .admin-logo {
            padding-bottom: 16px;
            margin-bottom: 16px;
          }
          .admin-nav-item {
            flex-shrink: 0;
          }
          .admin-main {
            padding: 20px 16px 32px;
          }
        }
      `}</style>
    </div>
  );
}
