"use client";

import { useRouter } from "next/navigation";
import { ChatBox } from "@/components/molecules/ChatBox";

interface ChatClientProps {
  conversationId: string;
}

export default function Chat({ conversationId }: ChatClientProps) {
  const router = useRouter();
  return (
    <ChatBox
      variant="page"
      conversationId={conversationId}
      onBack={() => router.back()}
      onConversationClosed={() => router.push("/dashboard/messages")}
    />
  );
}
