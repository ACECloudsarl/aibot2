// src/app/page.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, Mic, Paperclip, Copy, Download, Bot, 
  Menu, Plus, Settings, LogOut, Moon, Sun, CreditCard,
  Image as ImageIcon, Loader2, FileIcon, FileTextIcon, TableIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import Markdown from "react-markdown";
import { toast } from "sonner";
import OpenAI from "openai";
import { supabase } from '@/lib/supabase';

// Available AI models
const AI_MODELS = [
  { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B",vision:false },
  { id: "meta-llama/Llama-3-8b-chat-hf", name: "Llama 3 8B",vision:false },
  { id: "meta-llama/Llama-3-70b-chat-hf", name: "Llama 3 70B",vision:false },
  { id: "anthropic/claude-3-opus:beta", name: "Claude 3 Opus",vision:false },
  { id: "anthropic/claude-3-sonnet:beta", name: "Claude 3 Sonnet",vision:false },
  { id: "anthropic/claude-3-haiku:beta", name: "Claude 3 Haiku",vision:false },
  { id: "meta-llama/Llama-3-8b-instruct", name: "Llama 3 8B Instruct",vision:false },
  { id: "Qwen/Qwen1.5-72B-Chat", name: "Qwen 72B",vision:false },
  { id: "google/gemma-7b-it", name: "Gemma 7B",vision:false },
  { id: "deepseek-ai/deepseek-chat", name: "DeepSeek Chat",vision:false },
  { id: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo", name: "Llama 3.2 Vision",vision:true },

];

const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export default function Home() {
  const [chatList, setChatList] = useState([
    { id: "chat-1", title: "Understanding quantum computing", date: "Today" },
    { id: "chat-2", title: "React hooks explained", date: "Yesterday" },
    { id: "chat-3", title: "Marketing campaign ideas", date: "Feb 25" },
    { id: "chat-4", title: "Python data analysis help", date: "Feb 22" },
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
  const messagesEndRef = useRef(null);
  const { theme, setTheme } = useTheme();
  // Add these state variables
const [isDragging, setIsDragging] = useState(false);
const chatAreaRef = useRef(null);

const [transcript, setTranscript] = useState('');
const [recognition, setRecognition] = useState(null);
const [speechLanguage, setSpeechLanguage] = useState('en-US');
const [showMicPermissionDialog, setShowMicPermissionDialog] = useState(false);


  // Update recognition when language changes
  useEffect(() => {
    if (recognition) {
      recognition.lang = speechLanguage;
    }
  }, [speechLanguage, recognition]);
  
  // Add a dropdown somewhere in your settings to select language
  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'zh-CN', name: 'Chinese' },
    { code: 'ja-JP', name: 'Japanese' },
    // Add more languages as needed
  ];


  const trackPermissionState = async () => {
    try {
      // Check if the Permissions API is available
      if (navigator.permissions && navigator.permissions.query) {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        
        // Store the current state
        localStorage.setItem('micPermissionState', permissionStatus.state);
        
        // Listen for changes
        permissionStatus.onchange = () => {
          localStorage.setItem('micPermissionState', permissionStatus.state);
        };
        
        return permissionStatus.state;
      }
      return null;
    } catch (error) {
      console.error("Error checking permission state:", error);
      return null;
    }
  };
  
  // Call this function during component initialization
  useEffect(() => {
    trackPermissionState();
  }, []);


// Add these handlers for drag and drop events
const handleDragEnter = (e) => {
  e.preventDefault();
  setIsDragging(true);
};

const handleDragLeave = (e) => {
  e.preventDefault();
  setIsDragging(false);
};

const handleDragOver = (e) => {
  e.preventDefault();
};

const handleDrop = (e) => {
  e.preventDefault();
  setIsDragging(false);
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    processFile(file);
  }
};


  const together = new OpenAI({ 
    apiKey: "71413b12929a874f931ed3a08ff1a9b38329b2c323539ce6ed0aacc1742c456c", 
    baseURL: "https://api.together.xyz/v1", 
    dangerouslyAllowBrowser: true
  });
  
  // Fix hydration issues with theme
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Initialize speech recognition if supported

    const isSpeechRecognitionSupported = 'webkitSpeechRecognition' in window || 
    'SpeechRecognition' in window;

if (!isSpeechRecognitionSupported) {
console.warn("Speech Recognition API not supported in this browser");
return;
}


    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US'; // Set language - could make this configurable
      
      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        const currentTranscript = finalTranscript || interimTranscript;
        setInputValue(currentTranscript);
        setTranscript(currentTranscript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        toast.error(`Microphone error: ${event.error}`);
        setIsRecording(false);
      };
      
      recognitionInstance.onend = () => {
        // Only stop recording if we explicitly called stop
        if (isRecording) {
          recognitionInstance.start();
        }
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  useEffect(() => {
    // Initialize speech recognition code...
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission error:", error);
      toast.error("Please allow microphone access");
      return false;
    }
  };

  // Call this before starting speech recognition
const startRecordingWithPermission = async () => {
  const hasPermission = await requestMicrophonePermission();
  if (hasPermission) {
    handleRecordAudio();
  }
};
  



  const checkMicrophonePermission = async () => {
    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("MediaDevices API not supported in this browser");
        toast.error("Voice recording is not supported in this browser");
        return false;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the tracks immediately after permission check
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error("Microphone permission error:", error);
      return false;
    }
  };

  // Add this to help with browser-specific issues
const enableMicrophoneInChrome = async () => {
  // Some browsers (especially Chrome) need a user gesture to request permissions
  // This function should be called directly from a click event
  try {
    // For Chrome, we need to make a short getUserMedia call to trigger the permission prompt
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Release the microphone
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error enabling microphone in Chrome:", error);
    return false;
  }
};

  
 

// This function handles starting and stopping recording
 // Add this function to your component
const startSpeechRecognition = () => {
  // Create a new instance directly
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  
  // Configure it
  recognition.lang = speechLanguage;
  recognition.continuous = false;
  recognition.interimResults = false;
  
  // Set up handlers
  recognition.onstart = () => {
    console.log('Started listening');
    setIsRecording(true);
  };
  
  recognition.onresult = (event) => {
    console.log('Result received!', event);
    const transcript = event.results[0][0].transcript;
    console.log('Transcript:', transcript);
    
    // Directly set the value to make sure it works
    document.querySelector('textarea').value = transcript;
    
    // Also update React state
    setInputValue(transcript);
  };
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error', event);
  };
  
  recognition.onend = () => {
    console.log('Speech recognition ended');
    setIsRecording(false);
  };
  
  // Start
  recognition.start();
  console.log('Recognition started');
  
  // Return for cleanup
  return recognition;
};

// Modify your button handler
   // Modify your handleRecordAudio function like this:
   const handleRecordAudio = () => {
    if (isRecording) {
      // Stop any existing recognition
      if (recognition) {
        recognition.stop();
        setRecognition(null);
      }
      setIsRecording(false);
    } else {
      // Test if the API exists
      if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        console.error('Speech recognition not supported in this browser');
        alert('Speech recognition is not supported in your browser');
        return;
      }
      
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const newRecognition = new SpeechRecognition();
        
        // Apply mobile-specific settings if on mobile
        if (isMobileDevice()) {
          newRecognition.continuous = false; // Important for iOS
          newRecognition.interimResults = true;
          newRecognition.maxAlternatives = 1;
        } else {
          // Desktop settings
          newRecognition.continuous = true;
          newRecognition.interimResults = true;
        }
        
        newRecognition.lang = speechLanguage;
        
        newRecognition.onstart = () => {
          console.log('Started listening');
          setIsRecording(true);
        };
        
        newRecognition.onresult = (event) => {
          console.log('Result received!', event);
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              // For mobile, we want to update immediately
              if (isMobileDevice()) {
                finalTranscript = transcript;
              }
            }
          }
          
          if (finalTranscript) {
            setInputValue(finalTranscript);
            setTranscript(finalTranscript);
          }
        };
        
        newRecognition.onerror = (event) => {
          console.error('Speech recognition error', event);
          toast.error(`Microphone error: ${event.error}`);
          setIsRecording(false);
        };
        
        newRecognition.onend = () => {
          console.log('Speech recognition ended');
          
          // For mobile, don't restart automatically
          if (!isMobileDevice() && isRecording) {
            newRecognition.start();
          } else {
            setIsRecording(false);
          }
        };
        
        // Start
        newRecognition.start();
        console.log('Recognition started');
        setRecognition(newRecognition);
      } catch (error) {
        console.error('Failed to start speech recognition', error);
        toast.error('Failed to start speech recognition: ' + error.message);
      }
    }
  };
 // Update the handleSendMessage function to use the together client correctly
const handleSendMessage = async () => {

  if (messages.length > 0 && messages[messages.length - 1].role === "user" && messages[messages.length - 1].isImage && inputValue.trim()) {
    // User is adding text to a recently uploaded image
    setMessages((prev) => prev.map((msg, idx) => 
      idx === prev.length - 1 ? { ...msg, text: inputValue } : msg
    ));
    setInputValue("");
    
    // Call vision model with the updated text prompt
    const imageMessage = messages[messages.length - 1];
    const imageData = imageMessage.content.split(',')[1]; // Extract base64 from data URL
    await callVisionModel(imageData, "user_image.jpg");
    return;
  }


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
  
  // Extract the image prompt from user request in any language
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
  
  // Check if AI response contains image generation instructions
  const containsImageGenerationResponse = (text) => {
    const patterns = [
      /I('ll| will) (generate|create|make|produce) (an |a |)image/i,
      /I can (generate|create|make|produce) (an |a |)image/i,
      /using (FLUX|Flux|flux)/i,
      /choose (between|from) (FLUX|Flux|flux)/i,
      /(FLUX|Flux|flux)( |\.)(Free|Pro|Dev)/i,
      /image generation/i
    ];
    
    return patterns.some(pattern => pattern.test(text));
  };
  
  // Extract image prompt from AI response
  const extractImagePromptFromAIResponse = (text) => {
    // Look for quotes that might contain the image prompt
    const quotedText = text.match(/"([^"]*)"/);
    if (quotedText && quotedText[1].length > 3) {
      return quotedText[1];
    }
    
    // If no quotes, try to extract based on common patterns
    const lines = text.split('\n');
    
    // Look for lines that might describe what to generate
    for (const line of lines) {
      if (
        line.includes("generate") || 
        line.includes("create") || 
        line.includes("image of") ||
        line.includes("picture of")
      ) {
        // Extract the description part
        let promptLine = line
          .replace(/^I('ll| will| can) (generate|create|make|produce) (an |a |)image (of|showing|with|that depicts|that shows|about|based on|featuring) /i, '')
          .replace(/^(Let me |I can |I could |I'll |I will |)(generate|create|make|produce|draw) (an |a |)image (of|showing|with|that depicts|that shows|about|based on|featuring) /i, '')
          .replace(/using (FLUX|Flux|flux).*/i, '')
          .trim();
          
        if (promptLine.length > 3) {
          return promptLine;
        }
      }
    }
    
    // If we can't extract a specific prompt, return a default one based on the user's last message
    return "visual representation of the user's request";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const callVisionModel = async (base64File, file) => {
    setIsLoading(true);
    
    try {
      // Create a temporary message for streaming
      const tempId = Date.now() + 1;
      setMessages((prev) => [
        ...prev, 
        { id: tempId, content: "", role: "assistant", isStreaming: true }
      ]);
      
      // Format the prompt based on file type
      let prompt = "What's in this file?";
      
      if (file.type.startsWith('image/')) {
        prompt = "What's in this image?";
      } else if (file.type === 'application/pdf') {
        prompt = "Analyze this PDF document and summarize its content.";
      } else if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.name.endsWith('.csv')) {
        prompt = "Analyze this spreadsheet and summarize the key data insights.";
      } else if (file.type.includes('document') || file.type.includes('word')) {
        prompt = "Analyze this document and summarize its content.";
      }
      
      // Include custom prompt if user has entered text
      if (inputValue.trim()) {
        prompt = inputValue;
        setInputValue("");
      }
      
      // Only make API call if a vision model is selected
      const currentModel = AI_MODELS.find(model => model.id === selectedModel);
      if (currentModel && currentModel.vision) {
        const response = await together.chat.completions.create({
          model: selectedModel,
          messages: [
            {
              role: "user",
              content: [
                { type: "image_url", image_url: { url: `data:${file.type};base64,${base64File}` } },
                { type: "text", text: prompt }
              ]
            }
          ],
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
        
        // Update the final message and remove streaming flag
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === tempId 
              ? { ...msg, content: fullContent, isStreaming: false } 
              : msg
          )
        );
      } else {
        // For non-vision models, provide error message
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === tempId 
              ? { 
                  ...msg, 
                  content: "This model doesn't support file analysis. Please select a vision model like Llama 3.2 Vision.", 
                  isStreaming: false 
                } 
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Vision API Error:", error);
      toast.error("Failed to analyze file");
      
      // Remove streaming message on error
      setMessages((prev) => prev.filter(msg => !msg.isStreaming));
    } finally {
      setIsLoading(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Extract the base64 part from data URL
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const processImageFile = async (file, messageId) => {
    // Display the image in chat as a user message
    const imageUrl = URL.createObjectURL(file);
    
    // Update the placeholder message with the actual image
    setMessages((prev) => prev.map(msg => 
      msg.id === messageId ? {
        id: messageId,
        content: imageUrl,
        fileName: file.name,
        fileType: file.type,
        role: "user",
        isImage: true,
        isFileProcessing: false
      } : msg
    ));
    
    // Convert image to base64 for API
    const base64 = await fileToBase64(file);
    
    // Call the vision model with the image
    await callVisionModel(base64, file);
  };
  
  const processPdfFile = async (file, messageId) => {
    // Update the message to show PDF thumbnail
    setMessages((prev) => prev.map(msg => 
      msg.id === messageId ? {
        id: messageId,
        content: URL.createObjectURL(file),
        fileName: file.name,
        fileType: 'application/pdf',
        role: "user",
        isPdf: true,
        isFileProcessing: false
      } : msg
    ));
    
    // Convert PDF to base64
    const base64 = await fileToBase64(file);
    
    // Call the vision model with the PDF
    await callVisionModel(base64, file);
  };
  
  const processSpreadsheetFile = async (file, messageId) => {
    setMessages((prev) => prev.map(msg => 
      msg.id === messageId ? {
        id: messageId,
        content: URL.createObjectURL(file),
        fileName: file.name,
        fileType: file.type,
        role: "user",
        isSpreadsheet: true,
        isFileProcessing: false
      } : msg
    ));
    
    const base64 = await fileToBase64(file);
    await callVisionModel(base64, file);
  };
  
  const processDocumentFile = async (file, messageId) => {
    setMessages((prev) => prev.map(msg => 
      msg.id === messageId ? {
        id: messageId,
        content: URL.createObjectURL(file),
        fileName: file.name,
        fileType: file.type,
        role: "user",
        isDocument: true,
        isFileProcessing: false
      } : msg
    ));
    
    const base64 = await fileToBase64(file);
    await callVisionModel(base64, file);
  };
  
  const processGenericFile = async (file, messageId) => {
    setMessages((prev) => prev.map(msg => 
      msg.id === messageId ? {
        id: messageId,
        content: URL.createObjectURL(file),
        fileName: file.name,
        fileType: file.type,
        role: "user",
        isGenericFile: true,
        isFileProcessing: false
      } : msg
    ));
    
    const base64 = await fileToBase64(file);
    await callVisionModel(base64, file);
  };

  const processFile = async (file) => {
    try {
      // Check if current model supports vision
      const currentModel = AI_MODELS.find(model => model.id === selectedModel);
      
      if (!currentModel.vision) {
        const visionModel = AI_MODELS.find(model => model.vision);
        if (visionModel) {
          setSelectedModel(visionModel.id);
          toast.info(`Switched to ${visionModel.name} to process files`);
        } else {
          toast.error("No vision model available");
          return;
        }
      }
      
      // Display loader while processing
      const tempId = Date.now();
      setMessages((prev) => [...prev, {
        id: tempId,
        content: `Processing ${file.name}...`,
        role: "user",
        isFileProcessing: true
      }]);
      
      // Process based on file type
      let fileTypeProps = {};
      
      if (file.type.startsWith('image/')) {
        fileTypeProps = { isImage: true };
      } else if (file.type === 'application/pdf') {
        fileTypeProps = { isPdf: true };
      } else if (file.type.includes('spreadsheet') || file.type.includes('excel') || file.name.endsWith('.csv')) {
        fileTypeProps = { isSpreadsheet: true };
      } else if (file.type.includes('document') || file.type.includes('word')) {
        fileTypeProps = { isDocument: true };
      } else {
        fileTypeProps = { isGenericFile: true };
      }
      
      // Update the message with processed file data
      setMessages((prev) => prev.map(msg => 
        msg.id === tempId ? {
          id: tempId,
          content: URL.createObjectURL(file),
          fileName: file.name,
          fileType: file.type,
          role: "user",
          isFileProcessing: false,
          ...fileTypeProps
        } : msg
      ));
      
      // Convert to base64 and call vision model
      const base64 = await fileToBase64(file);
      await callVisionModel(base64, file);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Failed to process file");
    }
  };

  const handleFileUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt'; // Accept more file types
    fileInput.multiple = false;
    
    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      processFile(file);
    };
    
    fileInput.click();
  };

  const startRecording = () => {
    if (!recognition) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }
    
    try {
      recognition.start();
      setIsRecording(true);
      toast.info("Listening...");
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      toast.error("Could not start microphone");
    }
  };
  
  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
      
      // If we have transcript, keep it in the input field
      if (transcript.trim()) {
        toast.success("Recording stopped");
        // Optionally, you can auto-send the message:
        // if (transcript.trim()) handleSendMessage();
      } else {
        toast.info("Recording stopped (no speech detected)");
      }
    }
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
      console.error("Image generation error:", error);
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
    // Create blob and download
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
    // Would load messages for this chat from API
    setMessages([]);
    setIsMobileMenuOpen(false);
  };

  // Image generation dialog
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  
  // If not mounted yet (for theme)
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-background">
        <div className="p-4 flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">AI Chat</h1>
        </div>
        
        <div className="flex-1 overflow-auto p-3 space-y-2">
          <Button onClick={createNewChat} variant="outline" className="w-full justify-start gap-2">
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          
          <div className="mt-4 space-y-1">
            {chatList.map((chat) => (
              <Button
                key={chat.id}
                variant={currentChat === chat.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left font-normal h-auto py-2"
                onClick={() => selectChat(chat.id)}
              >
                <div className="truncate">
                  <div className="truncate">{chat.title}</div>
                  <div className="text-xs text-muted-foreground">{chat.date}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

<Dialog open={showMicPermissionDialog} onOpenChange={setShowMicPermissionDialog}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Microphone Access Required</DialogTitle>
      <DialogDescription>
        Voice recording requires microphone permission. When prompted, please select "Allow" to enable voice input.
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      <p className="text-sm text-muted-foreground">
        If you denied permission earlier, you may need to reset it in your browser settings:
      </p>
      <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
        <li>Click the lock/info icon in your address bar</li>
        <li>Find "Microphone" permissions</li>
        <li>Change to "Allow"</li>
        <li>Refresh the page</li>
      </ul>
    </div>
    <DialogFooter>
      <Button onClick={() => {
        setShowMicPermissionDialog(false);
        requestMicrophonePermission();
      }}>
        Request Permission
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
        
        <div className="p-4 border-t">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>Dark Mode</span>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/avatar.png" />
                    <AvatarFallback>UK</AvatarFallback>
                  </Avatar>
                  <span>User Account</span>
                </div>
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Upgrade Plan</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] sm:w-[300px] p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">AI Chat</h1>
            </div>
            
            <div className="flex-1 overflow-auto p-3 space-y-2">
              <Button onClick={createNewChat} variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
              
              <div className="mt-4 space-y-1">
                {chatList.map((chat) => (
                  <Button
                    key={chat.id}
                    variant={currentChat === chat.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left font-normal h-auto py-2"
                    onClick={() => selectChat(chat.id)}
                  >
                    <div className="truncate">
                      <div className="truncate">{chat.title}</div>
                      <div className="text-xs text-muted-foreground">{chat.date}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  <span>Dark Mode</span>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/avatar.png" />
                        <AvatarFallback>UK</AvatarFallback>
                      </Avatar>
                      <span>User Account</span>
                    </div>
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Upgrade Plan</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem>
  <div className="w-full">
    <Label htmlFor="speech-language" className="mb-2 block">Speech Language</Label>
    <Select value={speechLanguage} onValueChange={setSpeechLanguage}>
      <SelectTrigger id="speech-language">
        <SelectValue placeholder="Speech Language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map(lang => (
          <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
</DropdownMenuItem>

                </DropdownMenuContent>


              </DropdownMenu>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header with model selector */}
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <Select
                value={selectedModel}
                onValueChange={setSelectedModel}
              >
                <SelectTrigger className="w-[180px] md:w-[250px]">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="md:hidden"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Chat area */}
        <main 
  className={`flex-1 overflow-auto p-4 md:p-6 space-y-4 ${isDragging ? "bg-primary/10" : ""}`}
  onDragEnter={handleDragEnter}
  onDragLeave={handleDragLeave}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
  ref={chatAreaRef}
>

{isDragging && (
    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center z-10 backdrop-blur-sm">
      <div className="bg-background p-6 rounded-lg shadow-lg text-center">
        <ImageIcon className="h-12 w-12 mx-auto mb-2 text-primary" />
        <h3 className="text-xl font-bold">Drop image to analyze</h3>
        <p className="text-muted-foreground">Will switch to vision model if needed</p>
      </div>
    </div>
  )}

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] text-center space-y-4">
              <Bot className="h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-bold">How can I help you today?</h2>
              <p className="text-muted-foreground max-w-md">
                Ask me anything or select from the suggested prompts below
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                {["Explain quantum computing", "Write a poem about AI", "Help me debug my React code", "Create a marketing strategy"].map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setInputValue(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <Card
                key={message.id}
                className={`border-0 ${
                  message.role === "user" ? "bg-primary-foreground" : "bg-card"
                } ${message.isStreaming ? "border-l-4 border-l-primary" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none">

                  {message.role === "user" ? (
  message.isFileProcessing ? (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <p>{message.content}</p>
    </div>
  ) : message.isImage ? (
    <div className="flex flex-col">
      <img 
        src={message.content} 
        alt="User uploaded image" 
        className="max-w-[300px] max-h-[300px] rounded-md object-contain" 
      />
      <p className="mt-1 text-xs text-muted-foreground">{message.fileName}</p>
    </div>
  ) : message.isPdf ? (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
        <FileIcon className="h-8 w-8 text-red-500" />
        <div>
          <p className="font-medium">{message.fileName}</p>
          <p className="text-xs text-muted-foreground">PDF Document</p>
        </div>
      </div>
    </div>
  ) : message.isDocument ? (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
        <FileTextIcon className="h-8 w-8 text-blue-500" />
        <div>
          <p className="font-medium">{message.fileName}</p>
          <p className="text-xs text-muted-foreground">Document</p>
        </div>
      </div>
    </div>
  ) : message.isSpreadsheet ? (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
        <TableIcon className="h-8 w-8 text-green-500" />
        <div>
          <p className="font-medium">{message.fileName}</p>
          <p className="text-xs text-muted-foreground">Spreadsheet</p>
        </div>
      </div>
    </div>
  ) : message.isGenericFile ? (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
        <FileIcon className="h-8 w-8 text-gray-500" />
        <div>
          <p className="font-medium">{message.fileName}</p>
          <p className="text-xs text-muted-foreground">{message.fileType || "File"}</p>
        </div>
      </div>
    </div>
  ) : (
    <p>{message.content}</p>
  )
)

                : (
                      // For text messages
                      <Markdown
                        components={{
                          code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const code = String(children).replace(/\n$/, "");
                            if (!inline && match) {
                              return (
                                <div className="relative">
                                  <pre className={className} {...props}>
                                    <code>{children}</code>
                                  </pre>
                                  <div className="absolute top-2 right-2 flex space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleCopyCode(code)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleSaveCode(code)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.content || " "}
                      </Markdown>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
          <div ref={messagesEndRef} />
          {isLoading && !messages.some(msg => msg.isStreaming) && (
            <Card className="border-0 bg-card animate-pulse">
              <CardContent className="p-4">
                <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-5 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          )}
        </main>

        <Select
  value={speechLanguage}
  onValueChange={(value) => {
    console.log('Language changed to:', value);
    setSpeechLanguage(value);
  }}
>
  <SelectTrigger className="w-[150px]">   
    <SelectValue placeholder="Speech Language" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="en-US">English (US)</SelectItem>
    <SelectItem value="en-GB">English (UK)</SelectItem>
    <SelectItem value="es-ES">Spanish</SelectItem>
    <SelectItem value="fr-FR">French</SelectItem>
    <SelectItem value="de-DE">German</SelectItem>
    <SelectItem value="it-IT">Italian</SelectItem>
    <SelectItem value="ja-JP">Japanese</SelectItem>
    <SelectItem value="ko-KR">Korean</SelectItem>
    <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
    <SelectItem value="ru-RU">Russian</SelectItem>
    <SelectItem value="ar-SA">Arabic</SelectItem>
    <SelectItem value="hi-IN">Hindi</SelectItem>
    <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
  </SelectContent>
</Select>

        {/* Input area */}
        <footer className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative">
           <Textarea
  placeholder="Message..."
  value={inputValue}
  onChange={(e) => setInputValue(e.target.value)}
  onKeyDown={handleKeyDown}
  className={`min-h-[60px] resize-none pr-24 pl-4 py-3 rounded-lg ${isDragging ? "border-primary" : ""}`}
  rows={1}
  onDragEnter={handleDragEnter}
  onDragLeave={handleDragLeave}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
/>
              <div className="absolute right-2 bottom-2 flex items-center space-x-2">
              <Button
  variant="ghost"
  size="icon"
  onClick={handleFileUpload}
  className="h-8 w-8"
>
  <Paperclip className="h-4 w-4" />
</Button>
<Button
  variant={isRecording ? "destructive" : "ghost"}
  size="icon"
  onClick={startRecordingWithPermission}
  className={`h-8 w-8 ${isRecording ? "animate-pulse" : ""}`}
>
  <Mic className="h-4 w-4" />
</Button>

{/* Add this near your textarea */}
{isRecording && (
  <div className="absolute bottom-16 left-0 right-0 bg-destructive text-destructive-foreground p-2 text-center">
    Listening... (speak now)
  </div>
)}

                <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Generate Image</DialogTitle>
                      <DialogDescription>
                        Enter a prompt to generate an image using FLUX.1
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="image-prompt">Prompt</Label>
                        <Input
                          id="image-prompt"
                          placeholder="A futuristic city with flying cars..."
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={() => {
                          generateImage(imagePrompt);
                          setImageDialogOpen(false);
                          setImagePrompt("");
                        }}
                        disabled={isGeneratingImage || !imagePrompt.trim()}
                      >
                        {isGeneratingImage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating
                          </>
                        ) : (
                          "Generate"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="default"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="h-8 w-8"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {isRecording && (
  <div className="fixed inset-0 bg-red-500/10 pointer-events-none z-50">
    <div className="absolute top-0 left-0 right-0 bg-red-500 text-white py-2 text-center">
      <div className="flex items-center justify-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        Recording... Tap microphone when done
      </div>
    </div>
  </div>
)}


        </footer>
      </div>
    </div>
  );
}