import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import CreateAccount from "../../../../components/organisms/CreateAccount";

export default async function NewAccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/accounts/new");
  }

  return <CreateAccount userId={user.id} />;
}
