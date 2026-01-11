import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import Accounts from "../../../components/organisms/Accounts";

export default async function AccountsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/accounts");
  }

  return <Accounts userId={user.id} />;
}
