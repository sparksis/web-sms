export interface DID {
  number: string;
  sms_enabled: boolean;
}

export interface Message {
  id: string;
  date: string; // ISO string
  type: "incoming" | "outgoing";
  did: string;
  contact: string;
  message: string;
}

export interface Conversation {
  contact: string;
  lastMessage: Message;
  unreadCount: number;
}
