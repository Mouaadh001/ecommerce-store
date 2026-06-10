export const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ?? "mikacheabdou@gmail.com";

export function isAdminEmail(email?: string | null) {
  return email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
