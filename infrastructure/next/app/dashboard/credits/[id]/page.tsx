import { Suspense } from "react";
import CreditDetailClient from "../../../../components/molecules/CreditDetailClient";
import { Skeleton } from "@/components/ui/skeleton";

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
      <CreditDetailClient creditId={id} />
    </Suspense>
  );
}
