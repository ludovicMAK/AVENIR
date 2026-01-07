import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import AccountDetailClient from "./AccountDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect("/login?redirect=/dashboard/accounts/" + id);
  }

  return <AccountDetailClient accountId={id} userId={user.id} />;
}
