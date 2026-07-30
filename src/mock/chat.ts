import type { ChatMessage } from "@/types";

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "Manager",
    text: "System Online. Connected to terminal cheko inter-lane mesh protocol.",
    timestamp: "10:15 AM",
    role: "manager",
  },
  {
    id: "msg-2",
    sender: "Terminal 1",
    text: "Active lane customer count is growing. Requesting additional baggage support.",
    timestamp: "10:16 AM",
    role: "cashier",
  },
];
