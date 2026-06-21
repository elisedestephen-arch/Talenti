import type { CSConversation, ChatMessage, CSResponse } from './cs.types.js';
import { CSChatbotService } from './chatbot.service';

export class CustomerService {
  private chatbot: CSChatbotService;

  constructor() {
    this.chatbot = new CSChatbotService();
  }

  async handleUserMessage(customerId: string, content: string): Promise<CSResponse> {
    // In a real app, we'd fetch the conversation history from the DB
    const mockHistory: ChatMessage[] = [
      { role: 'user', content, timestamp: new Date().toISOString() }
    ];

    const response = await this.chatbot.generateResponse(mockHistory);
    
    // In a real app, save the updated conversation back to the DB
    return response;
  }
}
