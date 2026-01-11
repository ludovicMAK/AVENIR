import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import MarketClient from "../../../../components/molecules/MarketClient";

export default async function MarketPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <MarketClient />;
}
