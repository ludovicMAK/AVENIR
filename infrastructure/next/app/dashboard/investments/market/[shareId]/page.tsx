import { Suspense } from "react";
import ShareDetailClient from "../../../../../components/molecules/ShareDetailClient";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ShareDetailPage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <ShareDetailClient shareId={shareId} />
    </Suspense>
  );
}
