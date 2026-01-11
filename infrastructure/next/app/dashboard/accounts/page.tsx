import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import AccountsClient from "../../../components/molecules/AccountsClient";

export default async function AccountsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/accounts");
  }

  return <AccountsClient userId={user.id} />;
}
