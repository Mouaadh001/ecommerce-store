import { redirect } from "next/navigation";

// Registration is disabled — only the admin account exists
export default function RegisterPage() {
  redirect("/login");
}
