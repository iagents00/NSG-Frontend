"use client";

import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CONTEXT, RoleType } from '@/data/context';
import { 
  Paperclip, 
  Mic, 
  ArrowUp, 
  Sparkles, 
  Loader2,
  Atom
} from 'lucide-react';
// Refresh import to clear stale cache
import DynamicIsland from '@/components/layout/DynamicIsland';
import clsx from 'clsx';
import NewsAnalysisResult from './NewsAnalysisResult';
import axios from 'axios';

// Extended Message Type to support your Analysis Cards AND standard text
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  type?: 'text' | 'analysis'; 
  content: string;
  metadata?: {
    title?: string;
    tag?: string;
    roleContext?: string;
  };
}

export default function ChatInterface() {
  // 1. GLOBAL STATE
  const { currentRole, isContextCached, setContextCached } = useAppStore();
  
  // 2. LOCAL STATE
  const [cacheName, setCacheName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('standard'); // For Dynamic Island switching
  
  // Refs for scrolling
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 3. INITIALIZE CONTEXT (Simple - no Gemini dependency)
  useEffect(() => {
    // Set context as ready immediately - N8N will handle the rest
    setContextCached(true);
    setCacheName('n8n-managed');
  }, [setContextCached]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);



  // 5. HANDLER (Merged Logic: UI Updates + API Stream)
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit called!');
    e.preventDefault();
    console.log('Form prevented default');
    if (!input.trim() || isLoading) {
      console.log('Early return - input:', input.trim(), 'isLoading:', isLoading);
      return;
    }
    console.log('Proceeding with submission...');

    // Add User Message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      type: 'text',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create placeholder for AI response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: 'text',
        content: '',
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Use local API proxy to avoid CORS and hide upstream URL
      const webhookUrl = '/api/chat';
      console.log('Using API Proxy:', webhookUrl);
      
      // Prepare the request data
      const requestData = {
        message: input.trim(),
        context: {
          role: currentRole,
          mode: mode,
          cacheName: cacheName,
          messageHistory: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
            type: m.type,
            metadata: m.metadata
          }))
        }
      };

      // Make the POST request to N8N webhook
      console.log('Request data:', JSON.stringify(requestData, null, 2));
      console.log('About to make POST request to:', webhookUrl);
      
      const response = await axios.post(webhookUrl, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response received:', response.status, response.data);

      // Process the response
      const responseData = response.data;
      
      let assistantContent;
      let messageType: 'text' | 'analysis' = 'text';
      let messageMetadata = {};
      
      if (responseData.message === "Workflow was started") {
        assistantContent = "⚠️ **Configuration Issue:** The N8N workflow started successfully, but returned the default message. \n\nTo fix this, add a **Respond to Webhook** node at the end of your N8N workflow to return the AI's response.";
      } else {
        // Support structured responses from N8N (allowing the flowchart to control UI mode)
        if (responseData.type === 'analysis' || responseData.type === 'text') {
            messageType = responseData.type;
        }
        if (responseData.metadata) {
            messageMetadata = responseData.metadata;
        }

        // Flexible content extraction
        assistantContent = responseData.response || responseData.output || 
                               responseData.content || responseData.text || 
                               responseData.message ||
                               (typeof responseData === 'string' ? responseData : JSON.stringify(responseData));
      }

      // Update the assistant's message with the response
      setMessages(prev => 
        prev.map(m => 
          m.id === assistantMessage.id 
            ? { ...m, content: assistantContent, type: messageType, metadata: messageMetadata }
            : m
        )
      );

    } catch (error: any) {
      console.error('Error sending message to N8N:', error);
      
      let errorMessage = "Error: Could not connect to NSG Intelligence.";
      
      // Handle N8N 404 specifically (Workflow not listening)
      if (error.response && error.response.status === 404) {
           errorMessage = "⚠️ **Workflow Not Active:** The N8N test URL is not listening.\n\nPlease go to N8N and click **'Listen for Event'** (or Execute), then try again.";
      } 
      // Handle other server errors
      else if (error.response && error.response.data) {
           const logData = error.response.data;
           console.error('Server detailed error:', JSON.stringify(logData, null, 2));
           
           if (logData.error) {
               errorMessage = `Server Error: ${logData.error}`;
           }
      } else if (error.message) {
           errorMessage = `Connection Error: ${error.message}`;
      }

      setMessages(prev => prev.map(m => 
        m.id === (Date.now() + 1).toString() 
          ? { ...m, content: errorMessage } 
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      
      {/* --- LAYER 1: DYNAMIC ISLAND (Visuals) --- */}
      <div className="absolute top-0 left-0 w-full flex justify-center pt-6 lg:pt-8 z-40 pointer-events-none">
        <div className="pointer-events-auto">
            <DynamicIsland currentMode={mode} setMode={setMode} />
        </div>
      </div>

      {/* --- LAYER 2: CHAT BODY --- */}
      <div className="flex-1 overflow-y-auto custom-scroll p-6 lg:p-12 pt-24 lg:pt-32 space-y-8">
        
        {/* Messages List - Material 3 Style */}
        {/* Messages List - Gemini Style */}
        <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full">
            {messages.map((msg) => (
            <div key={msg.id} className={clsx("flex w-full animate-fade-in-up", msg.role === 'user' ? "justify-end" : "justify-start")}>
                
                {msg.role === 'user' ? (
                // USER MESSAGE - Right Aligned Bubble
                <div className="bg-[#f0f4f9] text-[#1f1f1f] px-6 py-4 rounded-[32px] rounded-br-[4px] text-[16px] max-w-[80%] leading-relaxed font-normal selection:bg-blue-100">
                    {msg.content}
                </div>
                ) : (
                // AI MESSAGE - Plain Text with Atom Icon
                <div className="flex gap-5 group w-full">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1">
                        <Atom className="w-6 h-6 text-[#1f1f1f] animate-spin-slow" />
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-1.5">
                        {msg.type === 'analysis' ? (
                            <NewsAnalysisResult 
                            tag={msg.metadata?.tag}
                            roleContext={msg.metadata?.roleContext}
                            />
                        ) : (
                            <div className="text-[16px] text-[#1f1f1f] leading-8 font-normal tracking-normal">
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        )}
                    </div>
                </div>
                )}
            </div>
            ))}
        </div>

        {/* Loading State (Thinking...) */}
        {/* Loading State (Atom) */}
        {isLoading && !messages[messages.length - 1]?.content && (
            <div className="flex flex-col items-center justify-center mt-8 animate-fade-in-up w-full max-w-3xl mx-auto gap-4">
                <div className="relative flex items-center justify-center">
                    <Atom className="w-12 h-12 text-[#1f1f1f] animate-[spin_1s_linear_infinite]" />
                    {/* Inner detail for atom look if needed, or just the icon */}
                </div>
                <span className="text-sm font-medium text-slate-500 animate-pulse tracking-wide">PENSANDO...</span>
            </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* --- LAYER 3: INPUT AREA (Stacked Gemini Style) --- */}
      <div className="shrink-0 relative z-20 pt-6 pb-6 px-4">
        <div className="max-w-3xl mx-auto">
            {!isContextCached ? (
                <div className="flex items-center justify-center gap-4 text-[15px] text-[#0b57d0] font-medium py-5 bg-[#f0f4f9] rounded-[24px] animate-pulse">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sincronizando Contexto de {currentRole?.toUpperCase()}...</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="relative group">
                    <div className="relative flex flex-col bg-[#f0f4f9] rounded-[28px] hover:bg-[#e9eef6] transition-colors duration-200 border border-transparent focus-within:bg-white focus-within:shadow-md focus-within:border-slate-200">
                        {/* Top: Input */}
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-transparent border-none pt-4 pb-2 px-6 font-normal text-[#1f1f1f] placeholder:text-slate-500 text-[16px] focus:ring-0 focus:outline-none disabled:opacity-50" 
                            placeholder={`Pregunta a ${currentRole || 'NSG'}...`}
                            autoComplete="off" 
                        />

                        {/* Bottom: Icons & Send */}
                        <div className="flex justify-between items-center px-4 pb-3">
                            <div className="flex gap-1">
                                <button type="button" className="p-2.5 text-slate-500 hover:bg-[#dce3f1] rounded-full transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <button type="button" className="p-2.5 text-slate-500 hover:bg-[#dce3f1] rounded-full transition-colors">
                                    <Mic className="w-5 h-5" />
                                </button>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading || !input.trim()}
                                onClick={() => console.log('Send button clicked!')}
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                                    ${input.trim() ? 'bg-[#0b57d0] text-white hover:bg-blue-700' : 'bg-transparent text-slate-400 cursor-default'}
                                `}
                            >
                                <ArrowUp className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[11px] text-slate-400">NSG Intelligence puede cometer errores. Considera verificar la información importante.</p>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}