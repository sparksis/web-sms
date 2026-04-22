"use client";

import { useState } from "react";
import MainLayout from "@/components/templates/MainLayout";
import LoginForm from "@/components/organisms/LoginForm";
import ConversationList from "@/components/organisms/ConversationList";
import SearchField from "@/components/molecules/SearchField";
import Icon from "@/components/atoms/Icon";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";

export default function HomePage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { conversations, isLoading: isConvLoading, refetch } = useConversations();
  const [searchQuery, setSearchQuery] = useState("");

  if (isAuthLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-full items-center justify-center bg-zinc-50 dark:bg-black p-4">
        <LoginForm />
      </div>
    );
  }

  const filteredConversations = conversations.filter((c) =>
    c.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const actions = (
    <>
      <button
        onClick={() => refetch()}
        className="p-2 rounded-full hover:bg-white/10 transition-colors"
        title="Refresh"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
      </button>
      <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
        <Icon name="more" size={24} />
      </button>
    </>
  );

  return (
    <MainLayout title="VoIP.ms SMS" actions={actions}>
      <div className="flex flex-col h-full overflow-hidden">
        <SearchField value={searchQuery} onChange={setSearchQuery} />
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={filteredConversations}
            isLoading={isConvLoading}
          />
        </div>

        <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-variant transition-colors z-20">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
    </MainLayout>
  );
}
