"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { Conversation, Message } from "@/lib/models";

export function useConversations() {
  const { credentials, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated || !credentials) return;

    setIsLoading(true);
    setError(null);

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const response = await fetch("/api/voipms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...credentials,
          method: "getSMS",
          from: thirtyDaysAgo.toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0],
          timezone: "-5",
          all_messages: "1"
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        interface VoipMsSms {
          id: string;
          date: string;
          type: string;
          did: string;
          contact: string;
          message: string;
        }
        const messages: Message[] = data.sms.map((s: VoipMsSms) => ({
          id: s.id,
          date: s.date,
          type: s.type === "1" ? "incoming" : "outgoing",
          did: s.did,
          contact: s.contact,
          message: s.message || "",
        }));

        // Group by contact
        const groups = new Map<string, Conversation>();
        messages.forEach(msg => {
          const existing = groups.get(msg.contact);
          if (!existing || new Date(msg.date) > new Date(existing.lastMessage.date)) {
            groups.set(msg.contact, {
              contact: msg.contact,
              lastMessage: msg,
              unreadCount: 0,
            });
          }
        });

        setConversations(Array.from(groups.values()).sort((a, b) =>
          new Date(b.lastMessage.date).getTime() - new Date(a.lastMessage.date).getTime()
        ));
      } else if (data.status !== "no_sms") {
        setError(data.status);
      }
    } catch (err) {
      setError("Failed to fetch conversations");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [credentials, isAuthenticated]);

  useEffect(() => {
    const init = () => {
      fetchConversations();
    };
    init();
  }, [fetchConversations]);

  return { conversations, isLoading, error, refetch: fetchConversations };
}
