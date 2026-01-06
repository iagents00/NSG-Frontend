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
    Bot,
    BrainCircuit,
    X,
    FileText
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
// Refresh import to clear stale cache
import DynamicIsland from '@/components/layout/DynamicIsland';
import clsx from 'clsx';
import BrandAtom from '@/components/ui/BrandAtom';
import AtomEffect from '@/components/ui/AtomEffect';
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
    const { currentRole, isContextCached, setContextCached, userId } = useAppStore();

    // 2. LOCAL STATE
    const [cacheName, setCacheName] = useState<string | null>(null);

    // Refactored State: Store conversations and loading states by mode
    const [conversations, setConversations] = useState<Record<string, Message[]>>({});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [mode, setMode] = useState('standard');
    const [selectedModel, setSelectedModel] = useState('Chat GPT');

    // Attachment & Audio State
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);



    // Derived state for current view
    const messages = conversations[mode] || [];
    const isLoading = loadingStates[mode] || false;

    // Helpers for Safe Updates (targeting specific modes)
    const updateMessages = (targetMode: string, action: Message[] | ((prev: Message[]) => Message[])) => {
        setConversations(prev => {
            const current = prev[targetMode] || [];
            const updated = typeof action === 'function' ? action(current) : action;
            return { ...prev, [targetMode]: updated };
        });
    };

    const setLoading = (targetMode: string, status: boolean) => {
        setLoadingStates(prev => ({ ...prev, [targetMode]: status }));
    };

    const [input, setInput] = useState('');

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset to calculate shrinkage
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`; // Limit max height
        }
    }, [input]);

    // Refs for scrolling
    const chatEndRef = useRef<HTMLDivElement>(null);

    // 3. INITIALIZE CONTEXT (Simple - no Gemini dependency)
    useEffect(() => {
        // Set context as ready immediately - N8N will handle the rest
        setContextCached(true);
        setCacheName('n8n-managed');
    }, [setContextCached]);

    // Scroll to bottom on MODE switch (Context/Tab change) - Instant
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "instant" });
    }, [mode]);

    // Smart Auto-Scroll for Messages
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        const isUserLast = lastMsg?.role === 'user';

        // 1. If Loading (Thinking...) -> Scroll to show spinner
        // 2. If User sent a message -> Scroll to confirm input
        const isAssistantAndEmpty = lastMsg?.role === 'assistant' && !lastMsg.content;

        // 1. If Loading (Thinking...) -> Scroll to center (safe with spacer)
        // 2. If User sent a message -> Scroll to center (safe with spacer)
        // 3. If AI response arrives (content exists) -> DO NOT SCROLL (keeps reading position at top)
        if (isUserLast || (isLoading && isAssistantAndEmpty)) {
           chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }, [messages, isLoading]);



    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleRemoveAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleMicClick = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                const audioChunks: BlobPart[] = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const audioFile = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });
                    setAttachment(audioFile);
                    // Optional: Stop tracks to release mic
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Could not access microphone. Please allow permissions.");
            }
        }
    };

    // 5. HANDLER (Merged Logic: UI Updates + API Stream)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Capture the mode at the start of the request to prevent race conditions if user switches tabs
        const activeMode = mode;
        const activeMessages = messages; // Snapshot of current messages for context

        if ((!input.trim() && !attachment) || isLoading) {
            return;
        }

        // Add User Message immediately
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            type: 'text',
            content: attachment ? `[Attached: ${attachment.name}] ${input.trim()}` : input.trim(),
        };

        updateMessages(activeMode, prev => [...prev, userMessage]);
        setInput('');
        setAttachment(null); // Clear attachment immediately from UI (it's in the request now)
        if (fileInputRef.current) fileInputRef.current.value = '';
        setLoading(activeMode, true);

        try {
            // Create placeholder for AI response
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                type: 'text',
                content: '',
            };
            updateMessages(activeMode, prev => [...prev, assistantMessage]);

            // Use local API proxy
            const webhookUrl = '/api/chat';

            let requestData;
            let headers = { 'Content-Type': 'application/json' };

            const contextData = {
                role: currentRole,
                mode: activeMode,
                cacheName: cacheName,
                messageHistory: [...activeMessages, userMessage].map(m => ({
                    role: m.role,
                    content: m.content,
                    type: m.type,
                    metadata: m.metadata
                }))
            };

            const stylingPrompt = `\n\n[SYSTEM: Generate the following content using GitHub Flavored Markdown for structure. For colors, wrap the text in <span style="color: [hex];"> tags using Notion’s specific palette: use #28456C for blue text and #18592E for green text. Ensure headers use #, ##, and ###, and apply bold (***) or italics () inside the span tags where necessary.]`;
            const finalMessage = input.trim() + stylingPrompt;

            if (attachment) {
                const formData = new FormData();
                formData.append('file', attachment);
                formData.append('message', finalMessage);
                formData.append('userId', userId); // Send User ID
                formData.append('context', JSON.stringify(contextData));
                requestData = formData;
                headers = { 'Content-Type': 'multipart/form-data' }; // axios sets boundary automatically usually, but good to be explicit or let axios handle it
            } else {
                requestData = {
                    message: finalMessage,
                    userId: userId, // Send User ID
                    context: contextData
                };
            }

            const response = await axios.post(webhookUrl, requestData, {
                headers: attachment ? undefined : headers, // Let browser set multipart headers with boundary
            });

            // Process the response
            const responseData = response.data;

            let assistantContent;
            let messageType: 'text' | 'analysis' = 'text';
            let messageMetadata = {};

            if (responseData.message === "Workflow was started") {
                assistantContent = "⚠️ **Configuration Issue:** The N8N workflow started successfully, but returned the default message.";
            } else {
                if (responseData.type === 'analysis' || responseData.type === 'text') {
                    messageType = responseData.type;
                }
                if (responseData.metadata) {
                    messageMetadata = responseData.metadata;
                }

                assistantContent = responseData.response || responseData.output ||
                    responseData.content || responseData.text ||
                    responseData.message ||
                    (typeof responseData === 'string' ? responseData : JSON.stringify(responseData));
            }

            // Update the assistant's message with the response
            updateMessages(activeMode, prev =>
                prev.map(m =>
                    m.id === assistantMessage.id
                        ? { ...m, content: assistantContent, type: messageType, metadata: messageMetadata }
                        : m
                )
            );

        } catch (error: any) {

            let errorMessage = "Error: Could not connect to NSG Intelligence.";

            if (error.response && error.response.status === 404) {
                errorMessage = "⚠️ **Workflow Not Active:** The N8N test URL is not listening.";
            } else if (error.message) {
                errorMessage = `Connection Error: ${error.message}`;
            }

            updateMessages(activeMode, prev => prev.map(m =>
                m.id === (Date.now() + 1).toString()
                    ? { ...m, content: errorMessage }
                    : m
            ));
        } finally {
            setLoading(activeMode, false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full relative overflow-hidden">
        
        {/* --- LAYER 1: DYNAMIC ISLAND (Visuals) --- */}
        {/* Adjusted top padding to clear the "Volver" button on mobile but stay high */}
        <div className="absolute top-0 left-0 w-full flex justify-center pt-16 md:pt-8 lg:pt-6 z-40 pointer-events-none transition-all duration-500 ease-in-out">
            <div className="pointer-events-auto w-full px-4 md:px-0 flex justify-center">
                <DynamicIsland 
                    currentMode={mode} 
                    setMode={setMode} 
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                />
            </div>
        </div>

        {/* spacer to push chat body down below header area (Red Zone) */}
        <div className="w-full h-52 md:h-60 shrink-0" />

        {/* --- LAYER 2: CHAT BODY (Restricted to Yellow Zone) --- */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scroll p-4 md:p-6 lg:p-12 pb-12 space-y-6 md:space-y-8 transition-all duration-500 ease-in-out">
            
            {/* Messages List */}
            <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
                {messages.map((msg) => {
                    // Calculate display content based on global selectedModel
                    let displayContent: string = msg.content;
                    let isWaiting = false;

                    if (msg.role === 'assistant') {
                        // Try parsing JSON if it looks like it
                        if (msg.content && typeof msg.content === 'string' && msg.content.trim().startsWith('{')) {
                            try {
                                const parsed = JSON.parse(msg.content);
                                
                                // 1. Try specific model
                                if (selectedModel === 'Chat GPT' && parsed.openAI_response) displayContent = parsed.openAI_response;
                                else if (selectedModel === 'Gemini' && parsed.gemini_response) displayContent = parsed.gemini_response;
                                else if (selectedModel === 'Claude' && parsed.claude_response) displayContent = parsed.claude_response;
                                
                                // 2. General Fallbacks
                                else if (parsed.response) displayContent = parsed.response;
                                else if (parsed.output) displayContent = parsed.output;
                                else if (parsed.text) displayContent = parsed.text;
                                
                                // 3. Cross-Model Fallbacks (Show *something* rather than nothing)
                                else if (parsed.openAI_response) displayContent = parsed.openAI_response;
                                else if (parsed.gemini_response) displayContent = parsed.gemini_response;
                                else if (parsed.claude_response) displayContent = parsed.claude_response;
                                
                            } catch (e) {
                                // JSON parse failed, keep original raw text
                                displayContent = msg.content;
                            }
                        }
                        
                        if (!displayContent || displayContent.length === 0) isWaiting = true;
                    }

                    return (
                        <div key={msg.id} className={clsx("flex w-full animate-fade-in-up", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            
                            {msg.role === 'user' ? (
                            // USER MESSAGE - Apple Pro Blue Bubble
                            <div className="bg-[#007AFF] text-white px-5 py-3 rounded-[20px] rounded-br-[4px] shadow-sm text-[16px] max-w-[85%] leading-relaxed font-normal tracking-wide selection:bg-white/30">
                                {msg.content}
                            </div>
                            ) : (
                            // AI MESSAGE - Clean Pro Text
                            <div className="flex gap-4 group w-full max-w-full items-start">
                                {/* Pro Apple Avatar */}
                                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-gradient-to-b from-white to-slate-50 border border-slate-200/60 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                                    <BrandAtom className="w-5 h-5" variant="colored" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    {msg.type === 'analysis' ? (
                                        <NewsAnalysisResult 
                                        tag={msg.metadata?.tag}
                                        roleContext={msg.metadata?.roleContext}
                                        />
                                    ) : (
                                        <div className="text-[16px] text-[#111827] leading-7 font-normal tracking-normal pt-0.5">
                                            {!isWaiting ? (
                                                <div className="prose prose-slate max-w-none prose-p:text-slate-800 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-a:text-[#007AFF] prose-code:text-[#eb5757] prose-li:text-slate-800 [&>*:first-child]:mt-0">
                                                    <ReactMarkdown 
                                                        remarkPlugins={[remarkGfm]}
                                                        rehypePlugins={[rehypeRaw]}
                                                        components={{
                                                            h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-3 tracking-tight" {...props} />,
                                                            h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-2 tracking-tight" {...props} />,
                                                            h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                                                            p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                                                            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                                                            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                                                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                                            code: ({node, inline, className, children, ...props}: any) => {
                                                                return inline ? (
                                                                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[13px] font-mono text-[#D12F2F] font-medium align-middle" {...props}>{children}</code>
                                                                ) : (
                                                                    <span className="block bg-[#1C1C1E] rounded-xl p-4 my-4 overflow-x-auto shadow-sm">
                                                                        <code className="text-sm font-mono text-white block whitespace-pre" {...props}>{children}</code>
                                                                    </span>
                                                                );
                                                            },
                                                            blockquote: ({node, ...props}) => <blockquote className="border-l-[3px] border-slate-300 pl-4 py-1 my-3 text-slate-500 italic" {...props} />,
                                                            table: ({node, ...props}) => <div className="overflow-x-auto my-4 rounded-lg border border-slate-200"><table className="min-w-full divide-y divide-slate-200" {...props} /></div>,
                                                            th: ({node, ...props}) => <th className="bg-slate-50 px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider" {...props} />,
                                                            td: ({node, ...props}) => <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-600 border-t border-slate-100" {...props} />,
                                                            span: ({node, ...props}) => <span {...props} />
                                                        }}
                                                    >
                                                        {displayContent || ''}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-400 mt-1 px-1 animate-pulse">
                                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                                     <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

        {/* Loading State (Atom at Top/Center) */}
        {isLoading && !messages[messages.length - 1]?.content && (
            <div className={clsx("flex flex-col flex-1 items-center w-full gap-6 animate-fade-in-up", messages.length <= 2 ? "justify-start pt-0 md:pt-6" : "justify-center py-12")}>
                <div className="relative flex items-center justify-center scale-[1.5]">
                    <AtomEffect className="w-20 h-20" />
                </div>
                <span className="text-sm font-medium text-slate-500 animate-pulse tracking-[0.2em] font-display uppercase">Pensando...</span>
            </div>
        )}
        
        {/* Spacer to guarantee scroll clearance above the fixed input area */}
        <div className="w-full h-40 shrink-0" />
        
        <div ref={chatEndRef} className="h-px w-full" />
      </div>

      {/* --- LAYER 3: INPUT AREA (Stacked Gemini Style) --- */}
      <div className="absolute bottom-0 left-0 w-full z-40 px-4 pb-6 md:pb-8 pt-12 bg-gradient-to-t from-[#F5F5F7] via-[#F5F5F7] via-60% to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
            {!isContextCached ? (
                <div className="flex items-center justify-center gap-4 text-[15px] text-[#0b57d0] font-medium py-5 bg-white rounded-[24px] shadow-sm animate-pulse">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sincronizando Contexto de {currentRole?.toUpperCase()}...</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="relative group">
                    <div className="relative flex flex-col bg-white rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.12)] focus-within:border-slate-200 transition-all duration-300">
                        {/* Attachment Preview */}
                        {attachment && (
                            <div className="px-6 pb-2 pt-0 flex">
                                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm animate-fade-in">
                                    <FileText className="w-4 h-4" />
                                    <span className="max-w-[150px] truncate">{attachment.name}</span>
                                    <button 
                                        type="button"
                                        onClick={handleRemoveAttachment}
                                        className="ml-1 p-0.5 hover:bg-blue-100 rounded-full cursor-pointer"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Top: Input (Textarea for Multiline) */}
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e as any);
                                }
                            }}
                            disabled={isLoading}
                            rows={1}
                            className="w-full bg-transparent border-none pt-4 pb-2 px-6 font-normal text-[#1f1f1f] placeholder:text-slate-500 text-[16px] focus:ring-0 focus:outline-none disabled:opacity-50 resize-none custom-scroll"
                            placeholder={isRecording ? "Grabando audio..." : (attachment ? "Añade un comentario..." : `Pregunta a ${currentRole || 'NSG'}...`)}
                        />

                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />

                        {/* Bottom: Icons & Send */}
                        <div className="flex justify-between items-center px-4 pb-3">
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={handleFileSelect}
                                    className="p-2.5 text-slate-500 hover:bg-[#dce3f1] rounded-full transition-colors cursor-pointer"
                                >
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={handleMicClick}
                                    className={clsx(
                                        "p-2.5 rounded-full transition-colors cursor-pointer",
                                        isRecording ? "text-red-500 bg-red-100 hover:bg-red-200 animate-pulse" : "text-slate-500 hover:bg-[#dce3f1]"
                                    )}
                                >
                                    <Mic className="w-5 h-5" />
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || (!input.trim() && !attachment)}
                                className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                            ${(input.trim() || attachment) ? 'bg-[#007AFF] text-white hover:bg-blue-600 cursor-pointer shadow-md' : 'bg-slate-100 text-slate-400 cursor-default'}
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