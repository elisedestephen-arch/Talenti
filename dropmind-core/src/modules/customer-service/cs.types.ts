export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface CSConversation {
  id: string;
  customerId: string;
  shopifyOrderId?: string;
  status: 'open' | 'resolved' | 'escalated';
  messages: ChatMessage[];
}

export interface CSResponse {
  answer: string;
  isEscalated: boolean;
  suggestedActions?: string[];
}
