"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/templates/MainLayout";
import MessageList from "@/components/organisms/MessageList";
import ChatInput from "@/components/molecules/ChatInput";
import Icon from "@/components/atoms/Icon";
import { useSms } from "@/hooks/useSms";
import { useAuth } from "@/hooks/useAuth";

interface PageProps {
  params: Promise<{ number: string }>;
}

export default function ConversationPage({ params }: PageProps) {
  const router = useRouter();
  const { number } = use(params);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { messages, isLoading, isSending, sendMessage } = useSms(number);

  if (isAuthLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/");
    return null;
  }

  const handleSend = async (text: string) => {
    // In a real app, we'd need to know which DID to use.
    // For now, we'll use a placeholder or the first available DID.
    // The Android app allows selecting the DID.
    // We'll use the DID from the last message if available.
    const did = messages.length > 0 ? messages[messages.length - 1].did : "";
    await sendMessage(did, text);
  };

  const actions = (
    <>
      <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
        <Icon name="call" size={24} />
      </button>
      <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
        <Icon name="more" size={24} />
      </button>
    </>
  );

  return (
    <MainLayout
      title={number}
      showBackButton
      onBack={() => router.push("/")}
      actions={actions}
    >
      <div className="flex flex-col h-full overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
        <ChatInput onSend={handleSend} isLoading={isSending} />
      </div>
    </MainLayout>
  );
}
