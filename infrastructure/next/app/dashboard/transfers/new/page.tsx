import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import NewTransferClient from "../../../../components/molecules/NewTransferClient";

export default async function NewTransferPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/transfers/new");
  }

  return <NewTransferClient userId={user.id} />;
}
