import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import SavingsClient from "./SavingsClient";

export default async function SavingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/savings");
  }

  return <SavingsClient userId={user.id} userRole={user.role} />;
}
