import ChatInterface from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col">
        <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex items-center px-6 shrink-0 justify-between">
            <h2 className="font-display font-bold text-lg text-slate-900">Neural Core v14.6</h2>
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Online</span>
            </div>
        </header>
        <div className="flex-1 overflow-hidden">
            <ChatInterface />
        </div>
    </div>
  );
}
