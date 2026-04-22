"use client";

import React from "react";
import Avatar from "../atoms/Avatar";
import { Conversation } from "@/lib/models";
import Link from "next/link";

interface ConversationListItemProps {
  conversation: Conversation;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({ conversation }) => {
  const { contact, lastMessage, unreadCount } = conversation;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <Link
      href={`/conversation/${contact}`}
      className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 transition-colors"
    >
      <Avatar name={contact} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {contact}
          </h3>
          <span className="text-xs text-zinc-500">
            {formatDate(lastMessage.date)}
          </span>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
          {lastMessage.type === "outgoing" && "You: "}{lastMessage.message}
        </p>
      </div>
      {unreadCount > 0 && (
        <div className="bg-primary w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
          {unreadCount}
        </div>
      )}
    </Link>
  );
};

export default ConversationListItem;
