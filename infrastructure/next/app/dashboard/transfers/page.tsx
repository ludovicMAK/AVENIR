import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import Transfers from "../../../components/organisms/Transfers";

export default async function TransfersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/transfers");
  }

  return <Transfers userId={user.id} />;
}
