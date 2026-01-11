"use client";

import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { Separator } from "@/components/atoms/Separator";
import {
  Wallet,
  Home,
  CreditCard,
  User,
  ArrowLeftRight,
  TrendingUp,
  ShoppingBag,
  PieChart,
  MessageSquare,
  DollarSign,
  PiggyBank,
  Globe,
  Briefcase,
  LogOut,
} from "lucide-react";
import { LanguageSwitcher } from "../molecules/LanguageSwitcher";
import { useTranslations } from "@/lib/i18n/simple-i18n";

interface DashboardSidebarProps {
  user: {
    firstname: string;
    lastname: string;
    role: string;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const tCommon = useTranslations('common');
  const tNav = useTranslations('navigation');
  const tAuth = useTranslations('auth');

  return (
    <aside className="w-64 border-r border-primary/20 bg-gradient-to-b from-primary/10 via-secondary/5 to-background flex flex-col shadow-lg">
      <div className="p-6 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {tCommon('appName')}
          </span>
        </div>
      </div>

      <div className="p-4 border-b border-primary/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center ring-2 ring-primary/20">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user.firstname} {user.lastname}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {tCommon('welcome')}
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <LanguageSwitcher />
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
            {tNav('dashboard')}
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-primary/10 hover:text-primary"
          asChild
        >
          <Link href="/dashboard/accounts">
            <CreditCard className="mr-3 h-4 w-4" />
            {tNav('accounts')}
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-primary/10 hover:text-primary"
          asChild
        >
          <Link href="/dashboard/transfers">
            <ArrowLeftRight className="mr-3 h-4 w-4" />
            {tNav('transfers')}
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-primary/10 hover:text-primary"
          asChild
        >
          <Link href="/dashboard/savings">
            <PiggyBank className="mr-3 h-4 w-4" />
            {tNav('savings')}
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
            {tNav('market')}
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-primary/10 hover:text-primary"
          asChild
        >
          <Link href="/dashboard/investments/orders">
            <ShoppingBag className="mr-3 h-4 w-4" />
            {tNav('orders')}
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-primary/10 hover:text-primary"
          asChild
        >
          <Link href="/dashboard/investments/portfolio">
            <PieChart className="mr-3 h-4 w-4" />
            {tNav('portfolio')}
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
            {tNav('credits')}
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-primary/10 hover:text-primary"
          asChild
        >
          <Link href="/dashboard/messages">
            <MessageSquare className="mr-3 h-4 w-4" />
            {tNav('messages')}
          </Link>
        </Button>

        <Separator className="my-4 bg-primary/20" />

        {user.role === "bankManager" && (
          <>
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {tNav('administration')}
              </h3>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-primary/10 hover:text-primary"
              asChild
            >
              <Link href="/dashboard/admin/shares">
                <Briefcase className="mr-3 h-4 w-4" />
                {tNav('manageShares')}
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
            {tNav('backToSite')}
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
            {tAuth('logout')}
          </Button>
        </form>
      </div>
    </aside>
  );
}
