import { Suspense } from "react";
import CreditsClient from "../../../components/molecules/CreditsClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreditsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <CreditsClient />
    </Suspense>
  );
}
