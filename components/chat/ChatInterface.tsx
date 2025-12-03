"use client";

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Send, Paperclip, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const { currentRole, isContextCached, setContextCached } = useAppStore();
  const [cacheName, setCacheName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Context Cache when role changes
  useEffect(() => {
    const initContext = async () => {
      setContextCached(false);
      setCacheName(null);
      setMessages([]); // Clear messages when role changes
      
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
            // Fallback if cache creation failed (e.g. API key missing)
            // We still allow chat but without cache
            setContextCached(true);
        }
      } catch (error) {
        console.error("Failed to init context:", error);
        setContextCached(true); // Allow proceed anyway
      }
    };

    initContext();
  }, [currentRole, setContextCached]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          cacheName,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantContent += chunk;

          setMessages(prev => 
            prev.map(m => 
              m.id === assistantMessage.id 
                ? { ...m, content: assistantContent }
                : m
            )
          );
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll">
        {messages.map((m: Message) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                : 'bg-white border border-slate-200 shadow-sm rounded-tl-none text-slate-800'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Thinking...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200 shrink-0">
        {!isContextCached ? (
           <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-medium py-2 animate-pulse">
             <Loader2 className="w-4 h-4 animate-spin" />
             Establishing Neural Link...
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2 max-w-4xl mx-auto">
            <button type="button" className="p-3 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition">
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition text-slate-800 placeholder-slate-400"
              placeholder={`Ask ${currentRole}...`}
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/30">
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
