import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/server";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Wallet,
  Home,
  CreditCard,
  LogOut,
  Globe,
  User,
  ArrowLeftRight,
  TrendingUp,
  ShoppingBag,
  PieChart,
  Shield,
  Briefcase,
  MessageSquare,
  DollarSign,
  PiggyBank,
} from "lucide-react";
import { UserProvider } from "@/lib/auth/UserContext";

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
        <aside className="w-64 border-r border-primary/20 bg-gradient-to-b from-primary/10 via-secondary/5 to-background flex flex-col shadow-lg">
          <div className="p-6 border-b border-primary/20">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AVENIR
              </span>
            </div>
          </div>

          <div className="p-4 border-b border-primary/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center ring-2 ring-primary/20">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.firstname} {user.lastname}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Bienvenue
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link href="/dashboard">
                <Home className="mr-3 h-4 w-4" />
                Tableau de bord
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link href="/dashboard/accounts">
                <CreditCard className="mr-3 h-4 w-4" />
                Mes comptes
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link href="/dashboard/transfers">
                <ArrowLeftRight className="mr-3 h-4 w-4" />
                Virements
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link href="/dashboard/savings">
                <PiggyBank className="mr-3 h-4 w-4" />
                Épargne
              </Link>
            </Button>

            <Separator className="my-4 bg-primary/20" />

            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link href="/dashboard/investments/market">
                <TrendingUp className="mr-3 h-4 w-4" />
                Marché
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link href="/dashboard/investments/orders">
                <ShoppingBag className="mr-3 h-4 w-4" />
                Mes ordres
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link href="/dashboard/investments/portfolio">
                <PieChart className="mr-3 h-4 w-4" />
                Mon portefeuille
              </Link>
            </Button>

            <Separator className="my-4 bg-primary/20" />

            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link href="/dashboard/credits">
                <DollarSign className="mr-3 h-4 w-4" />
                Mes crédits
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link href="/dashboard/messages">
                <MessageSquare className="mr-3 h-4 w-4" />
                Messagerie
              </Link>
            </Button>

            <Separator className="my-4 bg-primary/20" />

            {user.role === "bankManager" && (
              <>
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Administration
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start hover:bg-primary/10 hover:text-primary"
                  asChild
                >
                  <Link href="/dashboard/admin/shares">
                    <Briefcase className="mr-3 h-4 w-4" />
                    Gestion des actions
                  </Link>
                </Button>
                <Separator className="my-4 bg-primary/20" />
              </>
            )}

            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-secondary/10 hover:text-secondary"
              asChild
            >
              <Link href="/">
                <Globe className="mr-3 h-4 w-4" />
                Retour au site
              </Link>
            </Button>
          </nav>

          <div className="p-4 border-t border-primary/20">
            <form action="/logout" method="POST">
              <Button
                variant="outline"
                className="w-full border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                type="submit"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </form>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-8 px-6">{children}</div>
        </main>
      </div>
    </UserProvider>
  );
}
