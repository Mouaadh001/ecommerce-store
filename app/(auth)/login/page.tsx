import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-foreground text-background p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-background/10 rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-sm">L</span>
          </div>
          <span className="font-bold text-lg">Luminary</span>
        </Link>
        <div>
          <blockquote className="text-2xl font-medium leading-relaxed text-background/90">
            &ldquo;Shopping should feel effortless. We built Luminary to make every purchase a joy.&rdquo;
          </blockquote>
          <p className="mt-4 text-background/50 text-sm">— The Luminary Team</p>
        </div>
        <p className="text-background/30 text-xs">© {new Date().getFullYear()} Luminary Store</p>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
