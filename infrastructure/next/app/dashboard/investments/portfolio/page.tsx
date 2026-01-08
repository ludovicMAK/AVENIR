import { Suspense } from "react";
import PortfolioClient from "./PortfolioClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortfolioPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <PortfolioClient />
    </Suspense>
  );
}
