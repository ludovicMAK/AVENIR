import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import Market from "../../../../components/organisms/Market";

export default async function MarketPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <Market />;
}
