import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import SharesManagement from "../../../../components/organisms/SharesManagement";

export default async function SharesManagementPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "bankManager") {
    redirect("/dashboard");
  }

  return <SharesManagement />;
}
