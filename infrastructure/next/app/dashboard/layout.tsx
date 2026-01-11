import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import { UserProvider } from "@/lib/auth/UserContext";
import { DashboardSidebar } from "@/components/organisms/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <UserProvider>
      <div className="min-h-screen bg-background flex">
        <DashboardSidebar user={user} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-8 px-6">{children}</div>
        </main>
      </div>
    </UserProvider>
  );
}
