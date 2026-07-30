/**
 * Intercom chat API — /api/v1/chat/*
 */
import type { ChatMessage } from "@/types";

export async function listMessages(_channel?: string): Promise<ChatMessage[]> {
  throw new Error("Not implemented");
}

export async function sendMessage(_text: string, _role: ChatMessage["role"]): Promise<ChatMessage> {
  throw new Error("Not implemented");
}
