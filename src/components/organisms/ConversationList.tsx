"use client";

import React from "react";
import ConversationListItem from "../molecules/ConversationListItem";
import { Conversation } from "@/lib/models";

interface ConversationListProps {
  conversations: Conversation[];
  isLoading?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-500 p-8 text-center">
        <p>No conversations found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conv) => (
        <ConversationListItem key={conv.contact} conversation={conv} />
      ))}
    </div>
  );
};

export default ConversationList;
