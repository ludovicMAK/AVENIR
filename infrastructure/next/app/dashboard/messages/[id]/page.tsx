import { Suspense } from "react";
import Chat from "../../../../components/organisms/Chat";
import { Skeleton } from "@/components/atoms/Skeleton";

export default async function ChatPage({
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
      <Chat conversationId={id} />
    </Suspense>
  );
}
