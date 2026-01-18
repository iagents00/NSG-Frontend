"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useUIStore } from '@/store/useUIStore';
// import { CONTEXT, RoleType } from '@/data/context';
import {
    Paperclip,
    Mic,
    ArrowUp,
    Loader2,
    X,
    FileText,
    Activity,
    Layers,
    Scale,
    ChevronDown,
    BrainCircuit,
    Clock
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
import { AnimatePresence, motion } from 'framer-motion';

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
    targetModel?: string;
}

const MessageItem = React.memo(({ msg, selectedModel }: { msg: Message; selectedModel: string }) => {
    // Calculate display content based on global selectedModel
    let displayContent: string = msg.content;
    let isWaiting = false;
    let isComingSoon = false;

    if (msg.role === 'assistant') {
        // Try parsing JSON if it looks like it
        if (msg.content && typeof msg.content === 'string' && msg.content.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(msg.content);
                
                // 1. Try specific model
                // 1. Check for Fusion 'answer' (Priority)
                if (parsed.answer) {
                    displayContent = parsed.answer;
                }
                // 2. Try specific model (New Keys)
                else if (selectedModel === 'Chat GPT' && (parsed.openai || parsed.openAI_response)) displayContent = parsed.openai || parsed.openAI_response;
                else if (selectedModel === 'Gemini' && (parsed.gemini || parsed.gemini_response)) displayContent = parsed.gemini || parsed.gemini_response;
                else if (selectedModel === 'Claude' && (parsed.claude || parsed.claude_response)) displayContent = parsed.claude || parsed.claude_response;
                
                // 3. Check for Unavailable Models (If incomplete parsed data)
                else if ((selectedModel === 'Claude' && (parsed.openai || parsed.gemini || parsed.openAI_response || parsed.gemini_response)) ||
                         (selectedModel === 'Gemini' && (parsed.openai || parsed.claude || parsed.openAI_response || parsed.claude_response)) ||
                         (selectedModel === 'Chat GPT' && (parsed.gemini || parsed.claude || parsed.gemini_response || parsed.claude_response))) {
                    isComingSoon = true;
                    displayContent = '';
                }

                // 4. General Fallbacks
                else if (parsed.response) displayContent = parsed.response;
                else if (parsed.output) displayContent = parsed.output;
                else if (parsed.text) displayContent = parsed.text;
                
                // 5. Cross-Model Fallbacks
                else if (parsed.openai || parsed.openAI_response) displayContent = parsed.openai || parsed.openAI_response;
                else if (parsed.gemini || parsed.gemini_response) displayContent = parsed.gemini || parsed.gemini_response;
                else if (parsed.claude || parsed.claude_response) displayContent = parsed.claude || parsed.claude_response;
                
            } catch (e) {
                // JSON parse failed, keep original raw text
                displayContent = msg.content;
            }
        }
        
        // If content is empty/null and NOT marked as coming soon, assume waiting
        if ((!displayContent || displayContent.length === 0) && !isComingSoon) {
            isWaiting = true;
        }
    }

    return (
        <div className={clsx("flex w-full animate-fade-in-up", msg.role === 'user' ? "justify-end" : "justify-start")}>
            
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
                        <div className="text-[16px] text-navy-850 leading-7 font-normal tracking-normal pt-0.5">
                            {isComingSoon ? (
                                // COMING SOON STATE (Professional Branding)
                                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50/80 border border-slate-200/60 shadow-sm max-w-sm mt-1 animate-fade-in">
                                    <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[13px] font-bold text-slate-700 tracking-tight font-display">Próximamente</span>
                                        <span className="text-[12px] text-slate-500 font-medium">Este modelo estará disponible pronto.</span>
                                    </div>
                                </div>
                            ) : !isWaiting ? (
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
                                            code: ({node, inline, className, children, ...props}: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean, node?: unknown }) => {
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
                                            div: ({node, children, ...props}) => {
                                                return (
                                                    <div {...props}>
                                                        {React.Children.map(children, child => {
                                                            if (typeof child === 'string') {
                                                                 return (
                                                                    <ReactMarkdown 
                                                                        remarkPlugins={[remarkGfm]}
                                                                        rehypePlugins={[rehypeRaw]}
                                                                        components={{
                                                                            p: ({node, ...props}) => <>{props.children}</>,
                                                                            h1: ({node, ...props}) => <span className="block text-2xl font-bold mt-6 mb-3 tracking-tight" {...props} />,
                                                                            h2: ({node, ...props}) => <span className="block text-xl font-bold mt-5 mb-2 tracking-tight" {...props} />,
                                                                            h3: ({node, ...props}) => <span className="block text-lg font-semibold mt-4 mb-2" {...props} />,
                                                                            ul: ({node, ...props}) => <span className="block pl-5 mb-3" {...props} />,
                                                                            ol: ({node, ...props}) => <span className="block pl-5 mb-3" {...props} />,
                                                                            li: ({node, ...props}) => <span className="block pl-1" {...props} />,
                                                                            strong: ({node, ...props}) => <strong className="font-bold text-inherit" {...props} />,
                                                                            em: ({node, ...props}) => <em className="italic text-inherit" {...props} />,
                                                                            code: ({node, ...props}) => <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[13px] font-mono font-medium" {...props} />
                                                                        }}
                                                                    >
                                                                        {child}
                                                                    </ReactMarkdown>
                                                                );
                                                            }
                                                            return child;
                                                        })}
                                                    </div>
                                                );
                                            },
                                            span: ({node, children, ...props}) => {
                                                return (
                                                    <span {...props}>
                                                        {React.Children.map(children, child => {
                                                            if (typeof child === 'string') {
                                                                return (
                                                                    <ReactMarkdown 
                                                                        remarkPlugins={[remarkGfm]}
                                                                        rehypePlugins={[rehypeRaw]}
                                                                        components={{
                                                                            p: ({node, ...props}) => <>{props.children}</>,
                                                                            h1: ({node, ...props}) => <span className="block text-2xl font-bold mt-6 mb-3 tracking-tight" {...props} />,
                                                                            h2: ({node, ...props}) => <span className="block text-xl font-bold mt-5 mb-2 tracking-tight" {...props} />,
                                                                            h3: ({node, ...props}) => <span className="block text-lg font-semibold mt-4 mb-2" {...props} />,
                                                                            ul: ({node, ...props}) => <span className="block pl-5 mb-3" {...props} />,
                                                                            ol: ({node, ...props}) => <span className="block pl-5 mb-3" {...props} />,
                                                                            li: ({node, ...props}) => <span className="block pl-1" {...props} />,
                                                                            blockquote: ({node, ...props}) => <span className="block border-l-[3px] border-slate-300 pl-4 py-1 my-3 text-slate-500 italic" {...props} />,
                                                                            strong: ({node, ...props}) => <strong className="font-bold text-inherit" {...props} />,
                                                                            em: ({node, ...props}) => <em className="italic text-inherit" {...props} />,
                                                                            code: ({node, ...props}) => <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[13px] font-mono font-medium" {...props} />
                                                                        }}
                                                                    >
                                                                        {child}
                                                                    </ReactMarkdown>
                                                                );
                                                            }
                                                            return child;
                                                        })}
                                                    </span>
                                                );
                                            }
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
}, (prev, next) => {
    return prev.msg.content === next.msg.content && 
           prev.msg.role === next.msg.role && 
           prev.msg.type === next.msg.type &&
           prev.selectedModel === next.selectedModel;
});

MessageItem.displayName = 'MessageItem';

export default function ChatInterface() {
    // 1. GLOBAL STATE
    const { currentRole, isContextCached, setContextCached, userId } = useAppStore();

    // 2. LOCAL STATE
    const [cacheName, setCacheName] = useState<string | null>(null);

    // Refactored State: Store conversations and loading states by mode
    const [conversations, setConversations] = useState<Record<string, Message[]>>({});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    // const [mode, setMode] = useState('standard');
    const { activeAIMode: mode, setAIMode: setMode } = useUIStore();
    const [selectedModel, setSelectedModel] = useState('Claude');

    const [intelligenceMode, setIntelligenceMode] = useState<'pulse' | 'compare' | 'fusion' | 'deep'>('pulse');
    const [isModeOpen, setIsModeOpen] = useState(false);

    // Attachment & Audio State
    const [attachment, setAttachment] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);


    // Derived context key for separation (Pulse = specific model, Fusion = fusion, Compare = compare)
    const contextKey = intelligenceMode === 'pulse' ? selectedModel : intelligenceMode;
    const loadingKey = `${mode}-${contextKey}`;

    // Derived state for current view (Filtered by Pulse Model, Fusion, or Compare)
    const rawMessages = conversations[mode] || [];
    const messages = React.useMemo(() => {
        if (intelligenceMode === 'pulse') {
             return rawMessages.filter(m => m.targetModel === selectedModel);
        }
        // Fusion and Compare have their own isolated history
        return rawMessages.filter(m => m.targetModel === intelligenceMode || (!m.targetModel && intelligenceMode === 'compare')); 
    }, [rawMessages, intelligenceMode, selectedModel]);

    const isLoading = loadingStates[loadingKey] || false;

    // Helpers for Safe Updates (targeting specific modes)
    const updateMessages = (targetMode: string, action: Message[] | ((prev: Message[]) => Message[])) => {
        setConversations(prev => {
            const current = prev[targetMode] || [];
            const updated = typeof action === 'function' ? action(current) : action;
            return { ...prev, [targetMode]: updated };
        });
    };

    const setLoading = (key: string, status: boolean) => {
        setLoadingStates(prev => ({ ...prev, [key]: status }));
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
    }, [mode, selectedModel, intelligenceMode]); // Added selectedModel/intelligenceMode dependencies

    // Smart Auto-Scroll for Messages
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        const isUserLast = lastMsg?.role === 'user';
        const isAssistantAndEmpty = lastMsg?.role === 'assistant' && !lastMsg.content;

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
    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        // Capture state snapshots
        const activeMode = mode;
        const currentIntelligenceMode = intelligenceMode;
        const currentSelectedModel = selectedModel;
        
        // Determine context key for this specific message (Pulse=Specific, Fusion=Fusion, Compare=Compare)
        const msgTargetModel = currentIntelligenceMode === 'pulse' ? currentSelectedModel : currentIntelligenceMode;
        const activeLoadingKey = `${activeMode}-${msgTargetModel}`;

        if ((!input.trim() && !attachment) || isLoading) {
            return;
        }

        // Add User Message immediately
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            type: 'text',
            content: attachment ? `[Attached: ${attachment.name}] ${input.trim()}` : input.trim(),
            targetModel: msgTargetModel
        };

        updateMessages(activeMode, prev => [...prev, userMessage]);
        setInput('');
        setAttachment(null); // Clear attachment immediately from UI (it's in the request now)
        if (fileInputRef.current) fileInputRef.current.value = '';
        setLoading(activeLoadingKey, true);

        try {
            // Create placeholder for AI response
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                type: 'text',
                content: '',
                targetModel: msgTargetModel
            };
            updateMessages(activeMode, prev => [...prev, assistantMessage]);

            // Use local API proxy
            const webhookUrl = '/api/chat';

            let requestData;
            let headers = { 'Content-Type': 'application/json' };

            // Map internal state to requested API payload structure
            const fieldMap: Record<string, string> = {
                'nsg_clarity': 'clarity',
                'nsg_horizon': 'horizon',
                'nsg_news': 'news',
                'settings': 'settings'
            };
            const field = fieldMap[activeMode] || activeMode.replace('nsg_', '');

            // Map models
            const modelMap: Record<string, string> = {
                'Chat GPT': 'openai',
                'openai': 'openai',
                'claude': 'claude',
                'Claude': 'claude',
                'gemini': 'gemini',
                'Gemini': 'gemini'
            };
            const aiModel = modelMap[selectedModel] || 'claude';

            const finalMessage = input.trim();

            const payload = {
                userId: userId,
                field: field,
                message: finalMessage,
                mode: intelligenceMode,
                aiModel: aiModel,
                attachments: [] as any[]
            };

            if (attachment) {
                const formData = new FormData();
                formData.append('userId', payload.userId);
                formData.append('field', payload.field);
                formData.append('message', payload.message);
                formData.append('mode', payload.mode);
                formData.append('aiModel', payload.aiModel);
                formData.append('file', attachment);
                // We keep attachments array empty in JSON per spec, but send file via formData
                
                requestData = formData;
                headers = { 'Content-Type': 'multipart/form-data' };
            } else {
                requestData = payload;
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

                // IMPROVED LOGIC: Check for model-specific keys first to enable dynamic switching
                if (responseData.claude_response || responseData.gemini_response || responseData.openAI_response || 
                    responseData.openai || responseData.gemini || responseData.claude || responseData.answer) {
                     // If we have specific model responses, save the whole object as string
                     // so MessageItem can parse and select the right one based on selectedModel state
                     assistantContent = JSON.stringify(responseData);
                } else {
                     // General Fallback
                     assistantContent = responseData.response || responseData.output ||
                        responseData.content || responseData.text ||
                        responseData.message ||
                        (typeof responseData === 'string' ? responseData : JSON.stringify(responseData));
                }
            }

            // Update the assistant's message with the response
            updateMessages(activeMode, prev =>
                prev.map(m =>
                    m.id === assistantMessage.id
                        ? { ...m, content: assistantContent, type: messageType, metadata: messageMetadata }
                        : m
                )
            );

        } catch (err: unknown) {
            const error = err as { response?: { status: number }, message?: string };

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
        <div className="absolute top-0 left-0 w-full flex justify-center pt-16 md:pt-8 lg:pt-6 z-40 pointer-events-none">
            <div className="pointer-events-auto w-full px-4 md:px-0 flex justify-center">
                <DynamicIsland 
                    currentMode={mode} 
                    setMode={setMode} 
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                    intelligenceMode={intelligenceMode}
                    setIntelligenceMode={setIntelligenceMode}
                />
            </div>
        </div>

        {/* spacer to push chat body down below header area (Red Zone) */}
        <div className="w-full h-52 md:h-64 shrink-0" />

        {/* --- LAYER 2: CHAT BODY (Restricted to Yellow Zone) --- */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scroll p-4 md:p-6 lg:p-12 pb-12 space-y-6 md:space-y-8">
            
            {/* Messages List */}
            <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
                {messages.map((msg) => (
                    <MessageItem key={msg.id} msg={msg} selectedModel={selectedModel} />
                ))}
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
            <div className="w-full h-48 md:h-56 shrink-0" />
            
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
                        <div className="relative flex flex-col bg-white rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] focus-within:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow duration-300">
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
                                        handleSubmit(e);
                                    }
                                }}
                                disabled={isLoading}
                                rows={1}
                                className="w-full bg-transparent border-none pt-4 pb-2 px-6 font-normal text-[#1f1f1f] placeholder:text-slate-500 text-[16px] focus:ring-0 focus:outline-none disabled:opacity-50 resize-none custom-scroll"
                                placeholder={isRecording ? "Grabando audio..." : (attachment ? "Añade un comentario..." : "Pregunta a NSG...")}
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

                                    {/* SEPARATOR */}
                                    <div className="w-px h-5 bg-slate-200 mx-1" />

                                    {/* INTELLIGENCE MODE SELECTOR (Pro-Futuristic) */}
                                    {/* INTELLIGENCE MODE SELECTOR (Pro-Futuristic) */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsModeOpen(!isModeOpen)}
                                            className={clsx(
                                                "flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-300 border shadow-sm group",
                                                "bg-blue-50/80 border-blue-200 text-blue-600 ring-2 ring-blue-100/50" 
                                            )}
                                        >
                                            {intelligenceMode === 'pulse' && <Zap className="w-4 h-4 transition-colors text-blue-500" />}
                                            {intelligenceMode === 'compare' && <Layers className="w-4 h-4 text-blue-500" />}
                                            {intelligenceMode === 'fusion' && <Scale className="w-4 h-4 text-blue-500" />}
                                            
                                            <span className="font-display tracking-tight">
                                                {intelligenceMode === 'pulse' ? 'Pulso' : 
                                                 intelligenceMode === 'compare' ? 'Comparar' : 'Fusión'}
                                            </span>
                                            <ChevronDown className={clsx("w-3.5 h-3.5 opacity-40 transition-transform duration-300", isModeOpen && "rotate-180")} />
                                        </button>

<<<<<<< HEAD
                                        {/* SEPARATOR */}
                                        <div className="w-px h-5 bg-slate-200 mx-1" />

                                        {/* INTELLIGENCE MODE SELECTOR (Pro-Futuristic) */}
                                        {/* INTELLIGENCE MODE SELECTOR (Pro-Futuristic) */}
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsModeOpen(!isModeOpen)}
                                                className={clsx(
                                                    "flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 border shadow-sm group",
                                                    "bg-blue-50/80 border-blue-200 text-blue-600 ring-2 ring-blue-100/50"
                                                )}
                                            >
                                                {intelligenceMode === 'pulse' && <Activity className="w-4 h-4 transition-colors text-blue-500" />}
                                                {intelligenceMode === 'compare' && <Layers className="w-4 h-4 text-blue-500" />}
                                                {intelligenceMode === 'fusion' && <Scale className="w-4 h-4 text-blue-500" />}

                                                <span className="font-display tracking-tight">
                                                    {intelligenceMode === 'pulse' ? 'Pulso' :
                                                        intelligenceMode === 'compare' ? 'Comparar' : 'Fusión'}
                                                </span>
                                                <ChevronDown className={clsx("w-3.5 h-3.5 opacity-40 transition-transform duration-300", isModeOpen && "rotate-180")} />
                                            </button>

                                            <AnimatePresence>
                                                {isModeOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.96, y: 8, filter: 'blur(4px)' }}
                                                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                                                        exit={{ opacity: 0, scale: 0.96, y: 8, filter: 'blur(4px)' }}
                                                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                                        className="absolute bottom-full left-0 mb-3 w-64 p-2 bg-white/95 backdrop-blur-[24px] rounded-[20px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-white/60 flex flex-col gap-1 z-50 ring-1 ring-slate-900/5"
                                                    >
                                                        {[
                                                            { id: 'pulse', label: 'Pulso', icon: Activity, desc: 'Respuesta instantánea' },
                                                            { id: 'compare', label: 'Comparar', icon: Layers, desc: 'Ejecución en paralelo' },
                                                            { id: 'fusion', label: 'Fusión', icon: Scale, desc: 'Consenso de 3 modelos' },
                                                        ].map(m => (
                                                            <button
                                                                key={m.id}
                                                                type="button"
                                                                onClick={() => { setIntelligenceMode(m.id as any); setIsModeOpen(false); }}
                                                                className={clsx(
                                                                    "group relative flex items-start gap-3.5 p-3 rounded-2xl transition-all duration-200 text-left",
                                                                    intelligenceMode === m.id ? "bg-blue-50/80" : "hover:bg-slate-50"
                                                                )}
                                                            >
                                                                <div className={clsx("relative z-10 p-2 rounded-xl border shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-md bg-white",
                                                                    intelligenceMode === m.id ? "border-blue-100 text-blue-500 ring-2 ring-blue-50" : "border-slate-100 text-slate-400 group-hover:text-slate-600 group-hover:border-slate-200"
                                                                )}>
                                                                    <m.icon className="w-4 h-4" />
                                                                </div>
                                                                <div className="relative z-10 flex flex-col pt-0.5">
                                                                    <span className={clsx("text-[14px] font-bold tracking-tight font-display transition-colors", intelligenceMode === m.id ? "text-blue-700" : "text-slate-600 group-hover:text-slate-800")}>
                                                                        {m.label}
                                                                    </span>
                                                                    <span className="text-[11px] text-slate-400 font-medium transition-all duration-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5">
                                                                        {m.desc}
                                                                    </span>
                                                                </div>
                                                                {intelligenceMode === m.id && (
                                                                    <motion.div layoutId="activeCheck" className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
=======
                                        <AnimatePresence>
                                            {isModeOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.96, y: 8, filter: 'blur(4px)' }}
                                                    animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                                                    exit={{ opacity: 0, scale: 0.96, y: 8, filter: 'blur(4px)' }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                                                    className="absolute bottom-full left-0 mb-3 w-64 p-2 bg-white/95 backdrop-blur-[24px] rounded-[20px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border border-white/60 flex flex-col gap-1 z-50 ring-1 ring-slate-900/5"
                                                >
                                                    {[
                                                        { id: 'pulse', label: 'Pulso', icon: Zap, desc: 'Respuesta instantánea' },
                                                        { id: 'compare', label: 'Comparar', icon: Layers, desc: 'Ejecución en paralelo' },
                                                        { id: 'fusion', label: 'Fusión', icon: Scale, desc: 'Consenso de 3 modelos' },
                                                    ].map(m => (
                                                        <button
                                                            key={m.id}
                                                            type="button"
                                                            onClick={() => { setIntelligenceMode(m.id as any); setIsModeOpen(false); }}
                                                            className={clsx(
                                                                "group relative flex items-start gap-3.5 p-3 rounded-2xl transition-all duration-200 text-left",
                                                                intelligenceMode === m.id ? "bg-blue-50/80" : "hover:bg-slate-50"
                                                            )}
                                                        >
                                                            <div className={clsx("relative z-10 p-2 rounded-xl border shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-300 group-hover:scale-105 group-hover:shadow-md bg-white", 
                                                                intelligenceMode === m.id ? "border-blue-100 text-blue-500 ring-2 ring-blue-50" : "border-slate-100 text-slate-400 group-hover:text-slate-600 group-hover:border-slate-200"
                                                            )}>
                                                                <m.icon className="w-4 h-4" />
                                                            </div>
                                                            <div className="relative z-10 flex flex-col pt-0.5">
                                                                <span className={clsx("text-[14px] font-bold tracking-tight font-display transition-colors", intelligenceMode === m.id ? "text-blue-700" : "text-slate-600 group-hover:text-slate-800")}>
                                                                    {m.label}
                                                                </span>
                                                                <span className="text-[11px] text-slate-400 font-medium transition-all duration-300 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5">
                                                                    {m.desc}
                                                                </span>
                                                            </div>
                                                            {intelligenceMode === m.id && (
                                                                <motion.div layoutId="activeCheck" className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
>>>>>>> 66ccd083dfcc925b65cdefb1e3877b4cce562d80
                                    </div>
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