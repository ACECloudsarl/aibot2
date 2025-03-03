import OpenAI from "openai";

class TitleGenerator {
  constructor() {
    this.together = new OpenAI({ 
      apiKey: process.env.NEXT_PUBLIC_TOGETHER_API_KEY || "71413b12929a874f931ed3a08ff1a9b38329b2c323539ce6ed0aacc1742c456c", 
      baseURL: "https://api.together.xyz/v1", 
      dangerouslyAllowBrowser: true
    });
    
    this.model = "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free";
  }

  /**
   * Generate a descriptive title based on conversation messages
   * @param {Array} messages - Array of conversation messages
   * @returns {Promise<string>} - Generated title
   */
  async generateTitle(messages) {
    try {
      // Filter to text-only messages
      const textMessages = messages.filter(msg => 
        !msg.isImage && 
        !msg.isPdf && 
        !msg.isDocument && 
        !msg.isSpreadsheet && 
        !msg.isGenericFile
      );
      
      // Use only the first few messages to get the conversation topic
      const contextMessages = textMessages.slice(0, Math.min(textMessages.length, 6));
      
      // Format messages for prompt
      const conversationText = contextMessages.map(msg => 
        `${msg.role === 'user' ? 'Human' : 'AI'}: ${msg.content}`
      ).join('\n\n');
      
      const prompt = `Please generate a concise, descriptive title (maximum 30 characters) for this conversation. 
The title should capture the main topic or purpose of the conversation.
Make it specific enough to distinguish it from other conversations.
Don't use quotes or unnecessary punctuation.

Conversation:
${conversationText}

Title:`;
      
      const response = await this.together.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50,
        temperature: 0.7,
        stream: false
      });
      
      let title = response.choices[0].message.content.trim();
      
      // Clean up the title
      title = title
        .replace(/^["']|["']$/g, '') // Remove surrounding quotes
        .replace(/^Title:?\s*/i, '') // Remove "Title:" prefix
        .trim();
      
      // Ensure maximum length
      if (title.length > 30) {
        title = title.substring(0, 27) + '...';
      }
      
      return title;
    } catch (error) {
      console.error("Title generation error:", error);
      // Fallback to a generic title
      return "Chat " + new Date().toLocaleDateString();
    }
  }
}

export default TitleGenerator;