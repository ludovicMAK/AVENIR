import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import AccountDetail from "../../../../components/organisms/AccountDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user) {
    redirect("/login?redirect=/dashboard/accounts/" + id);
  }

  return <AccountDetail accountId={id} userId={user.id} />;
}
