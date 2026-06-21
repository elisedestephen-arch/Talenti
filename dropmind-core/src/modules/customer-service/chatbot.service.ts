import type { ChatMessage, CSResponse } from './cs.types.js';

export class CSChatbotService {
  async generateResponse(messages: ChatMessage[], context?: any): Promise<CSResponse> {
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    console.log(`[CSChatbotService] Generating response for: ${lastMessage}`);

    if (lastMessage.includes('refund') || lastMessage.includes('cancel')) {
      return {
        answer: "I'm sorry to hear that you want a refund. I am escalating this to a human agent to ensure your request is handled properly.",
        isEscalated: true,
        suggestedActions: ['ESCALATE_TO_HUMAN']
      };
    }

    if (lastMessage.includes('where is my order') || lastMessage.includes('tracking')) {
      return {
        answer: "Your order is currently being processed. You will receive a tracking number via email as soon as it ships.",
        isEscalated: false,
        suggestedActions: ['CHECK_ORDER_STATUS']
      };
    }

    return {
      answer: "Thank you for contacting DropMind AI support. How can I help you today?",
      isEscalated: false
    };
  }
}
