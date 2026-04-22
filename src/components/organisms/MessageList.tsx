"use client";

import React, { useEffect, useRef } from "react";
import MessageBubble from "../molecules/MessageBubble";
import { Message } from "@/lib/models";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 flex-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex w-full ${i % 2 === 0 ? "justify-end" : "justify-start"} animate-pulse`}>
            <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
