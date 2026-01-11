import { Suspense } from "react";
import Orders from "../../../../components/organisms/Orders";
import { Skeleton } from "@/components/atoms/Skeleton";

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <Orders />
    </Suspense>
  );
}
