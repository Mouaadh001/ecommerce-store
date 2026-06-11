"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User, LogOut, ShoppingBag, Heart } from "lucide-react";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Props {
  user: SupabaseUser;
  profile: Profile | null;
}

export function ProfileClient({ user, profile }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? user.user_metadata?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName, phone, updated_at: new Date().toISOString() });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated!");
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    toast("Signed out successfully");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col items-start justify-between gap-4 mb-8 sm:flex-row">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Account</h1>
          <p className="text-muted-foreground mt-1 break-all">{user.email}</p>
        </div>
        <Button variant="outline" onClick={handleSignOut} className="gap-2 text-red-500 hover:text-red-600 border-red-200 dark:border-red-900">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { href: "/orders", icon: ShoppingBag, label: "My Orders" },
          { href: "/wishlist", icon: Heart, label: "Wishlist" },
          { href: "/products", icon: User, label: "Browse Products" },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex min-w-0 items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:shadow-sm transition-all hover:-translate-y-0.5"
          >
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>

      <Separator className="mb-8" />

      {/* Profile form */}
      <form onSubmit={handleUpdate} className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-lg font-semibold">Personal Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email (cannot change)</Label>
            <Input id="profile-email" value={user.email ?? ""} disabled className="opacity-60" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-phone">Phone</Label>
            <Input
              id="profile-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="mt-8 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-6">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back.</p>
        <Button variant="destructive" size="sm" disabled>
          Delete Account
        </Button>
      </div>
    </div>
  );
}
