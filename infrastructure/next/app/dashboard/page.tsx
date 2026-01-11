import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import DashboardClient from "../../components/molecules/DashboardClient";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  return <DashboardClient userId={user.id} />;
}
