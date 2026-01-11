import { Suspense } from "react";
import ShareDetail from "../../../../../components/organisms/ShareDetail";
import { Skeleton } from "@/components/atoms/Skeleton";

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
      <ShareDetail shareId={shareId} />
    </Suspense>
  );
}
