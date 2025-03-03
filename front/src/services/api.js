// src/services/api.js
import OpenAI from "openai";
import client from '../client/feathers';


import { 
  authAPI, 
  chatAPI, 
  messageAPI, 
  generationAPI, 
  userAPI, 
  uploadAPI 
} from '../client/api';

// API Service class
export default class ApiService {
  constructor() {

    this.client = client;
    this.auth = authAPI;
    this.chat = chatAPI;
    this.message = messageAPI;
    this.generation = generationAPI;
    this.user = userAPI;
    this.upload = uploadAPI;


    this.together = new OpenAI({ 
      apiKey: process.env.NEXT_PUBLIC_TOGETHER_API_KEY || "71413b12929a874f931ed3a08ff1a9b38329b2c323539ce6ed0aacc1742c456c", 
      baseURL: "https://api.together.xyz/v1", 
      dangerouslyAllowBrowser: true
    });
    
    this.AI_MODELS = [
      { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B", vision: false },
      { id: "meta-llama/Llama-3-8b-chat-hf", name: "Llama 3 8B", vision: false },
      { id: "meta-llama/Llama-3-70b-chat-hf", name: "Llama 3 70B", vision: false },
      { id: "anthropic/claude-3-opus:beta", name: "Claude 3 Opus", vision: false },
      { id: "anthropic/claude-3-sonnet:beta", name: "Claude 3 Sonnet", vision: false },
      { id: "anthropic/claude-3-haiku:beta", name: "Claude 3 Haiku", vision: false },
      { id: "meta-llama/Llama-3-8b-instruct", name: "Llama 3 8B Instruct", vision: false },
      { id: "Qwen/Qwen1.5-72B-Chat", name: "Qwen 72B", vision: false },
      { id: "google/gemma-7b-it", name: "Gemma 7B", vision: false },
      { id: "deepseek-ai/deepseek-chat", name: "DeepSeek Chat", vision: false },
      { id: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo", name: "Llama 3.2 Vision", vision: true },
    ];
  }

  getModels() {
    return this.AI_MODELS;
  }

  getVisionModel() {
    return this.AI_MODELS.find(model => model.vision) || this.AI_MODELS[0];
  }

  prepareConversationHistory(messages, maxMessages = 10) {
    // Take only the most recent X messages to avoid context window limits
    const recentMessages = messages.slice(-maxMessages);
    
    // Format messages for API
    return recentMessages
      .filter(msg => msg.role === "user" || msg.role === "assistant")
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  }
  
  async generateChatResponse(message, model, messageHistory = []) {
    try {
      // Format previous messages for API
      const formattedMessages = this.prepareConversationHistory(messageHistory);
      formattedMessages.push({ role: "user", content: message });
      
      const response = await this.together.chat.completions.create({
        messages: formattedMessages,
        model: model,
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1,
        stop: ["<｜end▁of▁sentence｜>"],
        stream: true
      });
      
      return response;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  async generateImage(prompt) {
    try {
      const response = await fetch("https://api.together.xyz/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOGETHER_API_KEY || "71413b12929a874f931ed3a08ff1a9b38329b2c323539ce6ed0aacc1742c456c"}`
        },
        body: JSON.stringify({
          model: "black-forest-labs/FLUX.1-schnell-Free",
          prompt: prompt,
          width: 1024,
          height: 768,
          steps: 1,
          n: 1,
          response_format: "b64_json"
        })
      });
      
      if (!response.ok) {
        throw new Error(`Image generation failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data.data[0].b64_json;
    } catch (error) {
      console.error("Image generation error:", error);
      throw error;
    }
  }

  async analyzeFile(fileUrl, fileType, prompt, model, messageHistory = []) {
    try {
      console.log(`Analyzing file with model: ${model}`);
      console.log(`File type: ${fileType}`);
      console.log(`Using file URL: ${fileUrl.substring(0, 60)}...`);
      
      // Detect if we're on a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Check if the model supports vision
      const selectedModel = this.AI_MODELS.find(m => m.id === model);
      if (!selectedModel || !selectedModel.vision) {
        throw new Error("Selected model does not support vision");
      }
  
      // Format previous messages for API - filtering out any file messages
      const formattedMessages = this.prepareConversationHistory(
        messageHistory.filter(msg => !msg.isImage && !msg.isPdf && !msg.isSpreadsheet && !msg.isDocument && !msg.isGenericFile)
      );
      
      // Construct the proper content array with image URL
      const content = [
        // Put the text first for better results
        { type: "text", text: prompt || "What's in this file?" },
        // Then the image - always using URL format now
        { 
          type: "image_url", 
          image_url: { 
            url: fileUrl,
            detail: "high" 
          } 
        }
      ];
    
      // Add the new message with file
      formattedMessages.push({
        role: "user",
        content: content
      });
      
      // Log the request structure (truncating the URL for readability)
      const logMessage = {
        model,
        prompt,
        contentType: Array.isArray(content) ? "array with image_url" : typeof content,
        messageCount: formattedMessages.length,
        isMobile
      };
      console.log("Vision request info:", logMessage);
      
      // For mobile, use non-streaming approach
      if (isMobile) {
        console.log("Using mobile-optimized API call");
        
        // Create simplified messages array - just use the current message
        // to reduce payload size for mobile
        const mobileMessages = [{
          role: "user",
          content: content
        }];
        
        // Make API call with non-streaming response for mobile
        const response = await fetch("https://api.together.xyz/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_TOGETHER_API_KEY || "71413b12929a874f931ed3a08ff1a9b38329b2c323539ce6ed0aacc1742c456c"}`
          },
          body: JSON.stringify({
            model: model,
            messages: mobileMessages,
            max_tokens: 800,
            temperature: 0.7,
            stream: false
          })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const jsonResponse = await response.json();
        
        if (!jsonResponse || !jsonResponse.choices || !jsonResponse.choices[0]) {
          throw new Error("Invalid response from API");
        }
        
        // Create a fake stream that immediately returns the complete content
        const fakeStream = (async function* () {
          yield {
            choices: [
              { 
                delta: { 
                  content: jsonResponse.choices[0].message.content 
                } 
              }
            ]
          };
        })();
        
        return fakeStream;
      } 
      else {
        // For desktop: use normal streaming API with full context
        return this.together.chat.completions.create({
          model: model,
          messages: formattedMessages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: true
        });
      }
    } catch (error) {
      console.error("File analysis error:", error);
      throw error;
    }
  }

  // Helper function to check if user is requesting an image
  checkIfImageGenerationRequest(text) {
    // English patterns
    const englishPatterns = [
      /generate (an |a |)image/i,
      /create (an |a |)image/i,
      /make (an |a |)image/i,
      /draw (an |a |)image/i,
      /show (me |)(an |a |)image/i,
      /visualize/i,
      /picture of/i,
      /image of/i,
      /illustration of/i,
      /can you (generate|create|make|draw)/i
    ];
    
    // Check additional language patterns if needed
    
    return englishPatterns.some(pattern => pattern.test(text));
  }
  
  // Extract image prompt from user request
  extractImagePrompt(text) {
    // English extraction
    if (/^(please |can you |could you |)(generate|create|make|draw|show me|visualize) (an |a |)image/i.test(text)) {
      let prompt = text
        .replace(/^(please |can you |could you |)(generate|create|make|draw|show me|visualize) (an |a |)image (of|showing|with|that depicts|that shows|about|based on|featuring) /i, '')
        .replace(/^(please |can you |could you |)(generate|create|make|draw|show me|visualize) (an |a |)image /i, '')
        .replace(/^(please |can you |could you |)(generate|create|make|draw|show me) /i, '')
        .replace(/^(an |a |)image (of|showing|with|that depicts|that shows|about|based on|featuring) /i, '');
      
      return prompt;
    }
    
    // Generic extraction
    const triggerWords = ['image', 'picture', 'visualization', 'illustration'];
    
    for (const word of triggerWords) {
      const index = text.toLowerCase().indexOf(word);
      if (index !== -1) {
        // Extract everything after the trigger word
        const afterTrigger = text.substring(index + word.length).trim();
        if (afterTrigger.startsWith('of') || afterTrigger.startsWith('showing')) {
          // Remove the preposition
          return afterTrigger.substring(afterTrigger.indexOf(' ')).trim();
        }
        if (afterTrigger) {
          return afterTrigger;
        }
      }
    }
    
    // If all extraction methods fail, return the original text
    return text;
  }
}