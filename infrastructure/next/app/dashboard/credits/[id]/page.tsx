import { Suspense } from "react";
import CreditDetail from "../../../../components/organisms/CreditDetail";
import { Skeleton } from "@/components/atoms/Skeleton";

export default async function CreditDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <CreditDetail creditId={id} />
    </Suspense>
  );
}
