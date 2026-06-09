import Link from "next/link";
import { Package, MessageCircle, Camera, Code2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Shop: [
    { href: "/products", label: "All Products" },
    { href: "/products?featured=true", label: "Featured" },
    { href: "/products?sort=new", label: "New Arrivals" },
    { href: "/products?sort=sale", label: "Sale" },
  ],
  Account: [
    { href: "/profile", label: "My Profile" },
    { href: "/orders", label: "My Orders" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/cart", label: "Cart" },
  ],
  Company: [
    { href: "/contact", label: "Contact Us" },
    { href: "/about", label: "About" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-background" />
              </div>
              <span className="text-lg font-bold tracking-tight">Luminary</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A premium shopping experience curated for those who appreciate quality and design.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: MessageCircle, href: "#", label: "Twitter" },
                { icon: Camera, href: "#", label: "Instagram" },
                { icon: Code2, href: "#", label: "GitHub" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Luminary Store. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Secure payments</span>
            <span>·</span>
            <span>Free returns</span>
            <span>·</span>
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
