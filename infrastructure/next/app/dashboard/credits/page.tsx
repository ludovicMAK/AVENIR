import { Suspense } from "react";
import Credits from "../../../components/organisms/Credits";
import { Skeleton } from "@/components/atoms/Skeleton";

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
      <Credits />
    </Suspense>
  );
}
