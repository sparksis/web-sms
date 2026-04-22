"use client";

import React from "react";
import { Message } from "@/lib/models";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isIncoming = message.type === "incoming";

  return (
    <div className={`flex w-full mb-2 ${isIncoming ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
          isIncoming
            ? "bg-zinc-200 text-zinc-800 rounded-bl-none"
            : "bg-primary text-white rounded-br-none"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.message}</p>
        <div
          className={`text-[10px] mt-1 ${
            isIncoming ? "text-zinc-500" : "text-zinc-300"
          }`}
        >
          {new Date(message.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
