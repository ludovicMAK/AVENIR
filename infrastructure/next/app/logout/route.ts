import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

async function handleLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  redirect("/");
}

export async function GET() {
  return handleLogout();
}

export async function POST() {
  return handleLogout();
}
