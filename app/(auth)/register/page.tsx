import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Create Account" };

export default function RegisterPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-foreground text-background p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-background/10 rounded-lg flex items-center justify-center">
            <span className="text-background font-bold text-sm">L</span>
          </div>
          <span className="font-bold text-lg">Luminary</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold leading-snug text-background">
            Join thousands of happy shoppers
          </h2>
          <p className="mt-4 text-background/60 leading-relaxed">
            Create an account to track orders, save your wishlist, and get personalised recommendations.
          </p>
        </div>
        <p className="text-background/30 text-xs">© {new Date().getFullYear()} Luminary Store</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground mt-1">It&apos;s free and always will be</p>
          </div>
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4 hover:no-underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
