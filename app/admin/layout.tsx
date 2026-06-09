"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  PlusCircle,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/products/new", label: "Add Product", icon: PlusCircle },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
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
          <span className="admin-logo-icon">⚡</span>
          <span>Admin Panel</span>
        </div>

        <nav className="admin-nav">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href) && !(exact === undefined && href === "/admin" && pathname === "/admin");
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`admin-nav-item${isActive && (exact ? pathname === href : true) ? " active" : ""}`}
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
          background: #0a0a0f;
          color: #e1e1e8;
          font-family: 'Inter', sans-serif;
        }
        .admin-sidebar {
          width: 240px;
          min-height: 100vh;
          background: #111118;
          border-right: 1px solid rgba(255,255,255,0.06);
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
          padding: 0 8px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 20px;
        }
        .admin-logo-icon {
          font-size: 22px;
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
          padding: 10px 12px;
          border-radius: 8px;
          color: #888;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.15s;
        }
        .admin-nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: #e1e1e8;
        }
        .admin-nav-item.active {
          background: rgba(139, 92, 246, 0.15);
          color: #a78bfa;
        }
        .admin-main {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
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
      `}</style>
    </div>
  );
}
