import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import StatementClient from "./StatementClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StatementPage({ params }: PageProps) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect("/login?redirect=/dashboard/accounts/" + id + "/statement");
  }

  return <StatementClient accountId={id} />;
}
