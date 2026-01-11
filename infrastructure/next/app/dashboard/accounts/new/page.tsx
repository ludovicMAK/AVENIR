import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import CreateAccountClient from "../../../../components/molecules/CreateAccountClient";

export default async function NewAccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/accounts/new");
  }

  return <CreateAccountClient userId={user.id} />;
}
