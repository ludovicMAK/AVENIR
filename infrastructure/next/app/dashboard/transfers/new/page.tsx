import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import NewTransfer from "../../../../components/organisms/NewTransfer";

export default async function NewTransferPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/transfers/new");
  }

  return <NewTransfer userId={user.id} />;
}
