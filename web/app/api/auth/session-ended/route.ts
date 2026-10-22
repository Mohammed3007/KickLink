import { signOut } from "@/auth";

// Landing spot for a session cookie the database no longer honours (password
// reset elsewhere, account removed). The proxy only sees the cookie, so it
// would bounce the user between /login and /home; clear it first.
export async function GET() {
  await signOut({ redirectTo: "/login" });
}
