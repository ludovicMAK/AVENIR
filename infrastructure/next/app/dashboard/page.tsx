import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import Dashboard from "../../components/organisms/Dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  return <Dashboard userId={user.id} />;
}
