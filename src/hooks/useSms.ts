"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { Message } from "@/lib/models";

export function useSms(contactNumber?: string) {
  const { sessionInfo, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!isAuthenticated || !sessionInfo || !contactNumber) return;

    setIsLoading(true);
    setError(null);

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 90);

      const response = await fetch("/api/voipms/getSMS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Decryption-Key": sessionInfo.decryptionKey,
        },
        body: JSON.stringify({
          method: "getSMS",
          contact: contactNumber,
          from: thirtyDaysAgo.toISOString().split('T')[0],
          to: new Date().toISOString().split('T')[0],
          timezone: "-5",
          all_messages: "1"
        }),
      });

      const data = await response.json() as { status: string; sms?: unknown[] };

      if (data.status === "success" && data.sms) {
        interface VoipMsSms {
          id: string;
          date: string;
          type: string;
          did: string;
          contact: string;
          message: string;
        }
        const fetchedMessages: Message[] = (data.sms as VoipMsSms[]).map((s: VoipMsSms) => ({
          id: s.id,
          date: s.date,
          type: s.type === "1" ? "incoming" : "outgoing",
          did: s.did,
          contact: s.contact,
          message: s.message || "",
        }));
        setMessages(fetchedMessages.sort((a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
      } else if (data.status === "no_sms") {
        setMessages([]);
      } else {
        setError(data.status);
      }
    } catch (err) {
      setError("Failed to fetch messages");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionInfo, isAuthenticated, contactNumber]);

  const sendMessage = useCallback(async (did: string, message: string) => {
    if (!isAuthenticated || !sessionInfo || !contactNumber) return { success: false };

    setIsSending(true);
    try {
      const response = await fetch("/api/voipms/sendSMS", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Decryption-Key": sessionInfo.decryptionKey,
        },
        body: JSON.stringify({
          method: "sendSMS",
          did,
          dst: contactNumber,
          message,
        }),
      });

      const data = await response.json() as { status: string };

      if (data.status === "success") {
        await fetchMessages();
        return { success: true };
      } else {
        return { success: false, error: data.status };
      }
    } catch (err) {
      console.error(err);
      return { success: false, error: "Network error" };
    } finally {
      setIsSending(false);
    }
  }, [sessionInfo, isAuthenticated, contactNumber, fetchMessages]);

  useEffect(() => {
    const init = () => {
      fetchMessages();
    };
    init();
  }, [fetchMessages]);

  return { messages, isLoading, isSending, error, sendMessage, refetch: fetchMessages };
}
