import { Suspense } from "react";
import ChatClient from "../../../../components/molecules/ChatClient";
import { Skeleton } from "@/components/ui/skeleton";

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
      <ChatClient conversationId={id} />
    </Suspense>
  );
}
