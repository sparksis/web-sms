import { DID, Message } from "./models";

export interface VoipMsSmsResponse {
  id: string;
  date: string;
  type: string;
  did: string;
  contact: string;
  message: string;
}

export function parseVoipMsSms(sms: VoipMsSmsResponse): Message {
  return {
    id: sms.id,
    date: sms.date, // Note: VoIP.ms returns EDT -5 by default, we might need to handle this
    type: sms.type === "1" ? "incoming" : "outgoing",
    did: sms.did,
    contact: sms.contact,
    message: sms.message || "",
  };
}

export interface VoipMsDidResponse {
  number: string;
  sms_enabled: string;
}

export function parseVoipMsDid(did: VoipMsDidResponse): DID {
  return {
    number: did.number,
    sms_enabled: did.sms_enabled === "1",
  };
}
