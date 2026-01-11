"use client";

import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowRight } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "@/lib/i18n/simple-i18n";

export function LandingHeader() {
  const { user } = useCurrentUser();
  const tAuth = useTranslations("auth");
  const tNav = useTranslations("navigation");

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">AVENIR</span>
        </div>
        <nav className="flex items-center gap-4">
          <LanguageSwitcher />
          {user ? (
            <Button asChild>
              <Link href="/dashboard">
                {tNav("dashboard")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">{tAuth("login")}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">
                  {tAuth("register")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
