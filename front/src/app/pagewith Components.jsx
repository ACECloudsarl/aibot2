"use client";
import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";
import Header from "@/components/Header";
import ChatArea from "@/components/ChatArea";
import InputArea from "@/components/InputArea";
import OpenAI from "openai";
import { toast } from "sonner";
import { useTheme } from "next-themes";

// Your available AI models
export const AI_MODELS = [
    { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B" },
    { id: "meta-llama/Llama-3-8b-chat-hf", name: "Llama 3 8B" },
    { id: "meta-llama/Llama-3-70b-chat-hf", name: "Llama 3 70B" },
    { id: "anthropic/claude-3-opus:beta", name: "Claude 3 Opus" },
    { id: "anthropic/claude-3-sonnet:beta", name: "Claude 3 Sonnet" },
    { id: "anthropic/claude-3-haiku:beta", name: "Claude 3 Haiku" },
    { id: "meta-llama/Llama-3-8b-instruct", name: "Llama 3 8B Instruct" },
    { id: "Qwen/Qwen1.5-72B-Chat", name: "Qwen 72B" },
    { id: "google/gemma-7b-it", name: "Gemma 7B" },
    { id: "deepseek-ai/deepseek-chat", name: "DeepSeek Chat" },
];

export default function Home() {
  // Shared state
  const [chatList, setChatList] = useState([
    { id: "chat-1", title: "Understanding quantum computing", date: "Today" },
    { id: "chat-2", title: "React hooks explained", date: "Yesterday" },
    // ...
  ]);
  const [currentChat, setCurrentChat] = useState("chat-1");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // For image dialog
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const { theme, setTheme } = useTheme();

  // Together AI client
  const together = new OpenAI({ 
    apiKey: "71413b12929a874f931ed3a08ff1a9b38329b2c323539ce6ed0aacc1742c456c", 
    baseURL: "https://api.together.xyz/v1", 
    dangerouslyAllowBrowser: true
  });
  
  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


    // Helper function to check if user is requesting an image
    const checkIfImageGenerationRequest = (text) => {
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
        
        // French patterns
        const frenchPatterns = [
          /génère (une |)image/i,
          /générer (une |)image/i,
          /créer (une |)image/i,
          /créé (une |)image/i,
          /dessine(r|) (une |)image/i,
          /montre(-moi|) (une |)image/i,
          /faire (une |)image/i,
          /visualise(r|)/i,
          /image de/i,
          /illustrat(ion|ions) de/i,
          /peux-tu (génére|créer|dessiner|faire)/i,
          /pouvez-vous (génére|créer|dessiner|faire)/i
        ];
        
        // Arabic patterns
        const arabicPatterns = [
          /إنشاء صورة/i,
          /توليد صورة/i,
          /رسم صورة/i,
          /أظهر (لي |)صورة/i,
          /اصنع (لي |)صورة/i,
          /صورة (ل|من|عن)/i,
          /تصور/i,
          /رسم توضيحي/i,
          /هل يمكنك (إنشاء|توليد|رسم)/i
        ];
        
        // Romanian patterns
        const romanianPatterns = [
          /generează (o |un |)imagine/i,
          /creează (o |un |)imagine/i,
          /desenează (o |un |)imagine/i,
          /arată(-mi|) (o |un |)imagine/i,
          /face (o |un |)imagine/i,
          /vizualizează/i,
          /poză (cu|de|despre)/i,
          /imagine (cu|de|despre)/i,
          /ilustrație (cu|de|despre)/i,
          /poți (să |)(generezi|creezi|desenezi)/i
        ];
        
        // Spanish patterns
        const spanishPatterns = [
          /genera(r|) (una |un |)imagen/i,
          /crea(r|) (una |un |)imagen/i,
          /dibuja(r|) (una |un |)imagen/i,
          /muestra(me|) (una |un |)imagen/i,
          /hace(r|) (una |un |)imagen/i,
          /visualiza(r|)/i,
          /imagen de/i,
          /ilustración de/i,
          /puedes (generar|crear|dibujar)/i
        ];
        
        // German patterns
        const germanPatterns = [
          /generiere (ein |eine |)Bild/i,
          /erstelle (ein |eine |)Bild/i,
          /zeichne (ein |eine |)Bild/i,
          /zeige (mir |)(ein |eine |)Bild/i,
          /mache (ein |eine |)Bild/i,
          /visualisiere/i,
          /Bild von/i,
          /Illustration von/i,
          /kannst du (generieren|erstellen|zeichnen)/i
        ];
        
        // Check if any pattern matches
        const allPatterns = [
          ...englishPatterns, 
          ...frenchPatterns, 
          ...arabicPatterns, 
          ...romanianPatterns,
          ...spanishPatterns,
          ...germanPatterns
        ];
        
        return allPatterns.some(pattern => pattern.test(text));
      };

      const extractImagePrompt = (text) => {
        // First check if this is an English request
        if (/^(please |can you |could you |)(generate|create|make|draw|show me|visualize) (an |a |)image/i.test(text)) {
          // English extraction
          let prompt = text
            .replace(/^(please |can you |could you |)(generate|create|make|draw|show me|visualize) (an |a |)image (of|showing|with|that depicts|that shows|about|based on|featuring) /i, '')
            .replace(/^(please |can you |could you |)(generate|create|make|draw|show me|visualize) (an |a |)image /i, '')
            .replace(/^(please |can you |could you |)(generate|create|make|draw|show me) /i, '')
            .replace(/^(an |a |)image (of|showing|with|that depicts|that shows|about|based on|featuring) /i, '');
          
          return prompt;
        }
        
        // French extraction
        if (/^(s'il vous plait |pouvez-vous |peux-tu |)(génére|générer|créer|dessiner|montrer|faire|visualiser) (une |)image/i.test(text)) {
          let prompt = text
            .replace(/^(s'il vous plait |pouvez-vous |peux-tu |)(génére|générer|créer|dessiner|montrer|faire|visualiser) (une |)image (de|montrant|avec|qui montre|sur|basée sur|présentant) /i, '')
            .replace(/^(s'il vous plait |pouvez-vous |peux-tu |)(génére|générer|créer|dessiner|montrer|faire|visualiser) (une |)image /i, '')
            .replace(/^(s'il vous plait |pouvez-vous |peux-tu |)(génére|générer|créer|dessiner|montrer) /i, '')
            .replace(/^(une |)image (de|montrant|avec|qui montre|sur|basée sur|présentant) /i, '');
          
          return prompt;
        }
        
        // Arabic extraction
        if (/^(من فضلك |هل يمكنك |)(إنشاء|توليد|رسم|أظهر|اصنع) (صورة)/i.test(text)) {
          let prompt = text
            .replace(/^(من فضلك |هل يمكنك |)(إنشاء|توليد|رسم|أظهر|اصنع) صورة (ل|من|عن|توضح|مع|تظهر|حول|على أساس|تعرض) /i, '')
            .replace(/^(من فضلك |هل يمكنك |)(إنشاء|توليد|رسم|أظهر|اصنع) صورة /i, '')
            .replace(/^(من فضلك |هل يمكنك |)(إنشاء|توليد|رسم|أظهر) /i, '')
            .replace(/^صورة (ل|من|عن|توضح|مع|تظهر|حول|على أساس|تعرض) /i, '');
          
          return prompt;
        }
        
        // Romanian extraction
        if (/^(te rog |poți |)(generează|creează|desenează|arată|face|vizualizează) (o |un |)imagine/i.test(text)) {
          let prompt = text
            .replace(/^(te rog |poți |)(generează|creează|desenează|arată|face|vizualizează) (o |un |)imagine (cu|de|despre|care arată|care prezintă|bazată pe|prezentând) /i, '')
            .replace(/^(te rog |poți |)(generează|creează|desenează|arată|face|vizualizează) (o |un |)imagine /i, '')
            .replace(/^(te rog |poți |)(generează|creează|desenează|arată) /i, '')
            .replace(/^(o |un |)imagine (cu|de|despre|care arată|care prezintă|bazată pe|prezentând) /i, '');
          
          return prompt;
        }
        
        // Generic extraction - if specific language patterns fail, try to find a phrase after known trigger words
        const triggerWords = ['image', 'imagine', 'صورة', 'imagen', 'Bild'];
        
        for (const word of triggerWords) {
          const index = text.toLowerCase().indexOf(word);
          if (index !== -1) {
            // Extract everything after the trigger word
            const afterTrigger = text.substring(index + word.length).trim();
            if (afterTrigger.startsWith('of') || afterTrigger.startsWith('de') || 
                afterTrigger.startsWith('cu') || afterTrigger.startsWith('من') ||
                afterTrigger.startsWith('ل') || afterTrigger.startsWith('von')) {
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
      };

  // Handlers (e.g. send message, file upload, record audio, image generation, etc.)
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
  
    // Add user message
    const userMessage = {
      id: Date.now(),
      content: inputValue,
      role: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Create a temporary message for streaming
      const tempId = Date.now() + 1;
      setMessages((prev) => [
        ...prev, 
        { id: tempId, content: "", role: "assistant", isStreaming: true }
      ]);
      
      // First, check if this is an image generation request using basic pattern matching
      const isImageRequest = checkIfImageGenerationRequest(inputValue);
  
      if (isImageRequest) {
        // Remove the temporary message
        setMessages((prev) => prev.filter(msg => msg.id !== tempId));
        
        // Extract the image prompt
        const imagePrompt = extractImagePrompt(inputValue);
        
        // Add AI message acknowledging the image request
        const acknowledgeMessage = {
          id: Date.now() + 1,
          content: `I'll generate an image based on: "${imagePrompt}"`,
          role: "assistant",
        };
        setMessages((prev) => [...prev, acknowledgeMessage]);
        
        // Generate the image using FLUX.1
        await generateImage(imagePrompt);
      } else {
        // Use Together AI API for normal text response
        const response = await together.chat.completions.create({
          messages: [{ role: "user", content: inputValue }],
          model: selectedModel,
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.7,
          top_k: 50,
          repetition_penalty: 1,
          stop: ["<｜end▁of▁sentence｜>"],
          stream: true
        });
        
        let fullContent = "";
        
        for await (const token of response) {
          const newContent = token.choices[0]?.delta?.content || "";
          fullContent += newContent;
          
          // Update the streaming message
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === tempId 
                ? { ...msg, content: fullContent } 
                : msg
            )
          );
        }
        
        // Check if the AI is suggesting image generation
        if (fullContent.includes("FLUX") && 
            (fullContent.includes("image") || fullContent.includes("picture") || 
             fullContent.includes("generate") || fullContent.includes("visualization"))) {
          
          // Extract prompt from AI response
          const imagePrompt = extractImagePromptFromAIResponse(fullContent);
          
          if (imagePrompt) {
            // Add a follow-up message
            const followUpMessage = {
              id: Date.now() + 2,
              content: `I'll generate that image for you using FLUX.1...`,
              role: "assistant",
            };
            setMessages((prev) => [...prev, followUpMessage]);
            
            // Generate the image
            await generateImage(imagePrompt);
          }
        }
        
        // Update the final message and remove streaming flag
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === tempId 
              ? { ...msg, content: fullContent, isStreaming: false } 
              : msg
          )
        );
      }
      
      // Update chat title for new chats
      if (chatList.length === 0 || currentChat === "new") {
        const newChatId = `chat-${Date.now()}`;
        const title = inputValue.length > 30 
          ? inputValue.substring(0, 30) + "..." 
          : inputValue;
          
        setChatList((prev) => [
          { id: newChatId, title, date: "Today" },
          ...prev
        ]);
        setCurrentChat(newChatId);
      }
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Failed to get response from AI");
      
      // Remove streaming message on error
      setMessages((prev) => prev.filter(msg => !msg.isStreaming));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = () => {
    toast.info("File upload functionality would be implemented here");
  };

  const handleRecordAudio = () => {
    setIsRecording(!isRecording);
    toast.info(isRecording ? "Recording stopped" : "Recording started");
  };

  const generateImage = async (prompt) => {
    if (!prompt.trim()) {
      toast.error("Please enter an image prompt");
      return;
    }
    setIsGeneratingImage(true);
    try { 
       // Using the Together AI API for image generation
      const response = await fetch("https://api.together.xyz/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 71413b12929a874f931ed3a08ff1a9b38329b2c323539ce6ed0aacc1742c456c`
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
      const imageData = data.data[0].b64_json;
      const imageUrl = `data:image/png;base64,${imageData}`;
      
      const imageMessage = {
        id: Date.now(),
        content: imageUrl,
        role: "assistant",
        isImage: true
      };
      
      setMessages((prev) => [...prev, imageMessage]);
      toast.success("Image generated successfully");
    } catch (error) {
      toast.error("Failed to generate image");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard");
  };

  const handleSaveCode = (code) => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code-snippet.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Code saved to file");
  };

  const createNewChat = () => {
    setMessages([]);
    setCurrentChat("new");
    setIsMobileMenuOpen(false);
  };

  const selectChat = (chatId) => {
    setCurrentChat(chatId);
    setMessages([]); // Load chat messages if needed
    setIsMobileMenuOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        chatList={chatList}
        currentChat={currentChat}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        theme={theme}
        setTheme={setTheme}
      />
      <MobileSidebar
        chatList={chatList}
        currentChat={currentChat}
        onNewChat={createNewChat}
        onSelectChat={selectChat}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        theme={theme}
        setTheme={setTheme}
      />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header 
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
          theme={theme}
          setTheme={setTheme}
          AI_MODELS={AI_MODELS}
        />
        <ChatArea 
          messages={messages}
          messagesEndRef={messagesEndRef}
          isLoading={isLoading}
          handleCopyCode={handleCopyCode}
          handleSaveCode={handleSaveCode}
        />
        <InputArea 
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onFileUpload={handleFileUpload}
          onRecordAudio={handleRecordAudio}
          isRecording={isRecording}
          imageDialogOpen={imageDialogOpen}
          setImageDialogOpen={setImageDialogOpen}
          imagePrompt={imagePrompt}
          setImagePrompt={setImagePrompt}
          generateImage={generateImage}
          isGeneratingImage={isGeneratingImage}
          handleKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
