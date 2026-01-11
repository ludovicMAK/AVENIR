import { Suspense } from "react";
import Portfolio from "../../../../components/organisms/Portfolio";
import { Skeleton } from "@/components/atoms/Skeleton";

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
      <Portfolio />
    </Suspense>
  );
}
