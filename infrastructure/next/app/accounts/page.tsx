import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import AccountsClient from "./AccountsClient";

export default async function AccountsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/accounts");
  }

  return <AccountsClient userId={user.id} />;
}
