"use client";

import React, { useState } from "react";
import Icon from "../atoms/Icon";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onSend(value);
      setValue("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800"
    >
      <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-4 py-2">
        <textarea
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Send message..."
          className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none py-1 dark:text-zinc-100"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!value.trim() || isLoading}
        className="bg-primary text-white p-3 rounded-full disabled:opacity-50 transition-opacity"
      >
        <Icon name="send" size={20} />
      </button>
    </form>
  );
};

export default ChatInput;
