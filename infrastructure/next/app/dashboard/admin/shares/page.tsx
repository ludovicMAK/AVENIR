import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import SharesManagementClient from "./SharesManagementClient";

export default async function SharesManagementPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "bankManager") {
    redirect("/dashboard");
  }

  return <SharesManagementClient />;
}
