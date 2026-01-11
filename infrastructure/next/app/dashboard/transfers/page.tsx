import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import TransfersClient from "../../../components/molecules/TransfersClient";

export default async function TransfersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/transfers");
  }

  return <TransfersClient userId={user.id} />;
}
