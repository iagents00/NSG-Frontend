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
        {messages.map((msg) => (
          <div key={msg.id} className={clsx("flex w-full animate-fade-in-up", msg.role === 'user' ? "justify-end" : "justify-start")}>
            
            {msg.role === 'user' ? (
              // USER MESSAGE - Standard Blue
              <div className="bg-blue-600 text-white px-6 py-3.5 rounded-[24px] text-[15px] max-w-[85%] shadow-sm leading-relaxed font-normal selection:bg-white/30">
                {msg.content}
              </div>
            ) : (
              // AI MESSAGE - Clean Surface
              <div className="flex gap-4 group max-w-[90%]">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm text-white mt-1">
                    <Sparkles className="w-4 h-4 text-white/90" />
                 </div>
                 
                 {msg.type === 'analysis' ? (
                    <NewsAnalysisResult 
                      tag={msg.metadata?.tag}
                      roleContext={msg.metadata?.roleContext}
                    />
                 ) : (
                    <div className="bg-white px-6 py-4 rounded-[24px] text-[15px] text-slate-800 leading-7 shadow-sm border border-slate-100">
                        <p className="whitespace-pre-wrap">{msg.content}</p>
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
                 <p className="text-[11px] font-bold text-blue-600/60 tracking-widest uppercase animate-pulse">Procesando...</p>
             </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* --- LAYER 3: INPUT AREA (Floating Pill) --- */}
      <div className="shrink-0 relative z-20 bg-gradient-to-t from-white via-white/95 to-transparent pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            {!isContextCached ? (
                <div className="flex items-center justify-center gap-3 text-sm text-blue-600 font-medium py-4 bg-white rounded-full animate-pulse border border-blue-100 shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sincronizando Contexto de {currentRole?.toUpperCase()}...</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="relative group">
                    <div className="relative flex items-center bg-white border border-slate-200 p-2 pr-2.5 rounded-full transition-all duration-300 focus-within:shadow-md focus-within:border-blue-300/50 hover:shadow-sm">
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 pl-2">
                            <button type="button" className="p-2.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded-full transition-colors flex items-center justify-center">
                                <Mic className="w-[22px] h-[22px]" />
                            </button>
                            <button type="button" className="p-2.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 rounded-full transition-colors flex items-center justify-center">
                                <Paperclip className="w-[22px] h-[22px]" />
                            </button>
                        </div>

                        {/* Input Field */}
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="flex-1 bg-transparent border-none py-3 px-4 font-normal text-slate-800 placeholder:text-slate-400 text-[16px] focus:ring-0 focus:outline-none disabled:opacity-50" 
                            placeholder={`Pregunta a ${currentRole || 'NSG'}...`}
                            autoComplete="off" 
                        />
                        
                        {/* Send Button */}
                        <button 
                            type="submit" 
                            disabled={isLoading || !input.trim()}
                            onClick={() => console.log('Send button clicked!')}
                            className={`
                                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                                ${input.trim() ? 'bg-navy-900 text-white shadow-md hover:scale-105 hover:bg-blue-600' : 'bg-slate-100 text-slate-300 cursor-default'}
                            `}
                        >
                            <ArrowUp className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
}