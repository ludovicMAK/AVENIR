import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import Savings from "../../../components/organisms/Savings";

export default async function SavingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/savings");
  }

  return <Savings userId={user.id} userRole={user.role} />;
}
