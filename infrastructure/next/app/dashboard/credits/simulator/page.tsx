import { Suspense } from "react";
import SimulatorClient from "./SimulatorClient";
import { Skeleton } from "@/components/ui/skeleton";

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
      <SimulatorClient />
    </Suspense>
  );
}
