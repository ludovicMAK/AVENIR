import { Suspense } from "react";
import MessagesClient from "../../../components/molecules/MessagesClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <MessagesClient />
    </Suspense>
  );
}
