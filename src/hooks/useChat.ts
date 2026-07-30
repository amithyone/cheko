import { useState, useCallback } from "react";
import type { ChatMessage } from "@/types";
import { INITIAL_CHAT_MESSAGES } from "@/mock";

export function useChat() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  const sendCashierMessage = useCallback((text: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "Cashier (You)",
      text,
      timestamp,
      role: "cashier",
    };
    setChatMessages((prev) => [...prev, newMsg]);

    const lowercaseText = text.toLowerCase();
    setTimeout(() => {
      let replyText = "";
      let replyRole: ChatMessage["role"] = "cashier";
      let replySender = "Terminal 1";

      if (
        lowercaseText.includes("banana") ||
        lowercaseText.includes("produce") ||
        lowercaseText.includes("price")
      ) {
        replyText =
          "Terminal 1: Bananas are currently $1.99 per bunch. Verified with digital price controller.";
      } else if (
        lowercaseText.includes("manager") ||
        lowercaseText.includes("authorization") ||
        lowercaseText.includes("override") ||
        lowercaseText.includes("approve")
      ) {
        replyText = "Manager: Remote override ticket accepted. Dispatching authentication token key.";
        replyRole = "manager";
        replySender = "Manager";
      } else if (
        lowercaseText.includes("fries") ||
        lowercaseText.includes("burger") ||
        lowercaseText.includes("restaurant")
      ) {
        replyText =
          "Terminal 3: Kitchen confirms truffle fries and burgers are currently up. Preparing active service.";
        replySender = "Terminal 3";
      } else if (lowercaseText.includes("shift") || lowercaseText.includes("clock")) {
        replyText = "Terminal 1: Understood! Confirming shift log timing on active network.";
      } else {
        replyText = "Terminal 1: Intercom signal received clearly. Standing by for transaction clearance.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-reply-${Date.now()}`,
          sender: replySender,
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          role: replyRole,
        },
      ]);
    }, 1200);
  }, []);

  const sendManagerMessage = useCallback((text: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: "Manager (You)",
        text,
        timestamp,
        role: "manager",
      },
    ]);

    setTimeout(() => {
      const responses = [
        "Terminal 1 received: Understood supervisor. Remote override verified.",
        "Terminal 4 received: Copy that, counting remaining bills now.",
        "System: Multi-lane security rotation token applied.",
        "Terminal 3 received: Dispatched cash runner status acknowledged.",
      ];
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-rep-${Date.now()}`,
          sender: "Lane Terminal Node",
          text: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          role: "cashier",
        },
      ]);
    }, 1250);
  }, []);

  return { chatMessages, sendCashierMessage, sendManagerMessage };
}
