export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  role: "cashier" | "manager" | "system";
}
