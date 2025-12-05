"use client";

import { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CONTEXT, RoleType } from '@/data/context';
import { 
  Paperclip, 
  Mic, 
  ArrowUp, 
  Sparkles, 
  Loader2
} from 'lucide-react';
import DynamicIsland from '@/components/layout/DynamicIsland';
import clsx from 'clsx';
import NewsAnalysisResult from './NewsAnalysisResult';
import axiosInstance from '@/api/axios';

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

  // 3. INITIALIZE CONTEXT (Your Backend Logic)
  useEffect(() => {
    const initContext = async () => {
      setContextCached(false);
      setCacheName(null);
      setMessages([]); // Clear messages on role switch
      
      try {
        const res = await fetch('/api/context', {
          method: 'POST',
          body: JSON.stringify({ role: currentRole }),
        });
        const data = await res.json();
        if (data.cacheName) {
          setCacheName(data.cacheName);
          setContextCached(true);
        } else {
          // Fallback if cache creation failed
          setContextCached(true);
        }
      } catch (error) {
        console.error("Failed to init context:", error);
        setContextCached(true); // Allow proceed anyway
      }
    };

    if (currentRole) {
      initContext();
    }
  }, [currentRole, setContextCached]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);



  // 5. HANDLER (Merged Logic: UI Updates + API Stream)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

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

      console.log('Sending message to N8N webhook...');
      
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
      const response = await axiosInstance.post('', requestData);

      // Process the response
      const responseData = response.data;
      const assistantContent = responseData.response || responseData.output || 
                             responseData.content || responseData.text || 
                             (typeof responseData === 'string' ? responseData : JSON.stringify(responseData));

      // Update the assistant's message with the response
      setMessages(prev => 
        prev.map(m => 
          m.id === assistantMessage.id 
            ? { ...m, content: assistantContent }
            : m
        )
      );

    } catch (error) {
      console.error('Error sending message to N8N:', error);
      setMessages(prev => prev.map(m => 
        m.id === (Date.now() + 1).toString() 
          ? { ...m, content: "Error: Could not connect to NSG Intelligence. Please try again later." } 
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
        
        {/* Messages List */}
        {messages.map((msg) => (
          <div key={msg.id} className={clsx("flex w-full animate-fade-in-up", msg.role === 'user' ? "justify-end" : "justify-start")}>
            
            {msg.role === 'user' ? (
              // USER MESSAGE STYLE
              <div className="bg-blue-600 text-white px-6 py-4 rounded-3xl rounded-tr-none text-sm font-medium max-w-[85%] shadow-lg leading-relaxed">
                {msg.content}
              </div>
            ) : (
              // AI MESSAGE STYLE
              <div className="flex gap-4 group max-w-[90%]">
                 <div className="w-9 h-9 bg-navy-950 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white mt-auto mb-1">
                    <Sparkles className="w-4 h-4" />
                 </div>
                 
                 {/* Logic to choose between Text Bubble or Special Analysis Card */}
                 {msg.type === 'analysis' ? (
                    <NewsAnalysisResult 
                      tag={msg.metadata?.tag}
                      roleContext={msg.metadata?.roleContext}
                    />
                 ) : (
                    <div className="bg-white p-6 rounded-3xl rounded-tl-none text-sm text-slate-700 shadow-card border border-slate-100">
                        {/* Using whitespace-pre-wrap to handle line breaks from AI */}
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                 )}
              </div>
            )}
          </div>
        ))}

        {/* Loading State (Thinking...) */}
        {isLoading && !messages[messages.length - 1]?.content && (
             <div className="flex flex-col items-center justify-center mt-8 animate-fade-in-up gap-6 w-full">
                 <div className="w-16 h-16 relative atom-container">
                      <div className="w-full h-full animate-spin-process">
                         <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                             <defs>
                                <linearGradient id="processGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#3B82F6" />
                                    <stop offset="100%" stopColor="#60A5FA" />
                                </linearGradient>
                             </defs>
                             <circle cx="50" cy="50" r="42" className="morph-orbit" stroke="url(#processGrad)" strokeWidth="2" fill="none" />
                             <circle cx="50" cy="50" r="8" fill="#3B82F6" />
                         </svg>
                      </div>
                 </div>
                 <p className="text-xs font-bold text-blue-500 tracking-widest uppercase animate-text-glow">Procesando...</p>
             </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* --- LAYER 3: INPUT AREA --- */}
      <div className="shrink-0 relative z-20 safe-pb-modal bg-white/80 backdrop-blur-xl border-t border-slate-200">
        <div className="p-4 sm:p-6 lg:p-8">
            {!isContextCached ? (
                <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-medium py-4 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sincronizando Contexto de {currentRole?.toUpperCase()}...
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto group">
                    <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none transform scale-95"></div>
                    <div className="relative flex items-center bg-white border border-slate-200 rounded-3xl shadow-sm focus-within:shadow-md transition-all duration-300">
                        <div className="flex gap-1 pl-3 text-slate-400">
                            <button type="button" className="p-2.5 hover:bg-slate-100 rounded-xl hover:text-blue-600 transition"><Mic className="w-5 h-5"/></button>
                            <button type="button" className="p-2.5 hover:bg-slate-100 rounded-xl hover:text-blue-600 transition"><Paperclip className="w-5 h-5"/></button>  
                        </div>
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="flex-1 bg-transparent border-none py-4 px-3 font-medium text-navy-900 focus:ring-0 placeholder-slate-400 text-base focus:outline-none disabled:opacity-50" 
                            placeholder={`Escribe tu consulta o comando para ${currentRole}...`}
                            autoComplete="off" 
                        />
                        <div className="pr-2">
                            <button 
                                type="submit" 
                                disabled={isLoading || !input.trim()}
                                className="p-3 bg-navy-900 text-white rounded-2xl hover:bg-blue-600 transition shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowUp className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}