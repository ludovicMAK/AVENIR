import { Suspense } from "react";
import Simulator from "../../../../components/organisms/Simulator";
import { Skeleton } from "@/components/atoms/Skeleton";

export default function SimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <Simulator />
    </Suspense>
  );
}
