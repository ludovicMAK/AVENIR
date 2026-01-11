import { Suspense } from "react";
import Messages from "../../../components/organisms/Messages";
import { Skeleton } from "@/components/atoms/Skeleton";

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
      <Messages />
    </Suspense>
  );
}
