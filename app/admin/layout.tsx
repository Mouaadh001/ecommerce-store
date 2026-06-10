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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/products/new", label: "Add Product", icon: PlusCircle },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
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
          <span className="admin-logo-icon"><Package size={18} /></span>
          <span>Luminary Admin</span>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`admin-nav-item${isActive ? " active" : ""}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button className="admin-logout" onClick={handleLogout}>
          <LogOut size={16} />
          Sign Out
        </button>
      </aside>

      <main className="admin-main">
        {children}
      </main>

      <style jsx>{`
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
          width: 252px;
          min-height: 100vh;
          background: rgba(14,15,20,0.92);
          border-right: 1px solid rgba(255,255,255,0.08);
          box-shadow: 10px 0 40px rgba(0,0,0,0.22);
          display: flex;
          flex-direction: column;
          padding: 24px 16px;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .admin-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 17px;
          font-weight: 700;
          color: #fff;
          padding: 0 8px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 20px;
        }
        .admin-logo-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #10b981;
          color: #04130d;
          box-shadow: 0 12px 28px rgba(16,185,129,0.24);
        }
        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 12px;
          border-radius: 8px;
          color: #9ca3af;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.15s, color 0.15s, transform 0.15s;
        }
        .admin-nav-item:hover {
          background: rgba(255,255,255,0.06);
          color: #f8fafc;
          transform: translateX(2px);
        }
        .admin-nav-item.active {
          background: rgba(16,185,129,0.14);
          color: #6ee7b7;
          box-shadow: inset 3px 0 0 #10b981;
        }
        .admin-main {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
          max-width: 1440px;
        }
        .admin-logout {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          color: #888;
          font-size: 14px;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          width: 100%;
          transition: all 0.15s;
        }
        .admin-logout:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
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
