"use client";

import { useState } from 'react';
import clsx from 'clsx';
import { Sparkles, Bot, BrainCircuit } from 'lucide-react';

interface ModelSelectorTabsProps {
  content: string;
}

export default function ModelSelectorTabs({ content }: ModelSelectorTabsProps) {
  const [activeTab, setActiveTab] = useState<'Chat GPT' | 'Gemini' | 'Claude'>('Chat GPT');

  const models = [
    { id: 'Chat GPT', label: 'Chat GPT', icon: Bot },
    { id: 'Gemini', label: 'Gemini', icon: Sparkles },
    { id: 'Claude', label: 'Claude', icon: BrainCircuit },
  ] as const;

  return (
    <div className="flex flex-col w-full gap-2">
      {/* Tabs Header - Google Pro / Material 3 Chips */}
      <div className="flex items-center gap-2 pb-1 overflow-x-auto no-scrollbar">
        {models.map((model) => {
          const isActive = activeTab === model.id;
          const Icon = model.icon;
          return (
            <button
              key={model.id}
              onClick={() => setActiveTab(model.id)}
              className={clsx(
                "group flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border select-none",
                isActive 
                  ? "bg-blue-50 text-[#0b57d0] border-blue-100 shadow-sm" // Active: Gentle Blue (Google style)
                  : "bg-transparent text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300" // Inactive
              )}
            >
              <Icon 
                className={clsx(
                  "w-3.5 h-3.5 transition-colors", 
                  isActive ? "text-[#0b57d0]" : "text-slate-400 group-hover:text-slate-500"
                )} 
              />
              {model.label}
            </button>
          );
        })}
      </div>

      {/* Active Content Area */}
      <div className="mt-2 text-[16px] text-[#1f1f1f] leading-8 font-normal tracking-normal animate-fade-in">
        {activeTab === 'Chat GPT' ? (
             <p className="whitespace-pre-wrap">{content}</p>
        ) : (
             <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-2 border border-dashed border-slate-200 rounded-lg bg-slate-50/50 mt-2">
                <IconPlaceholder model={activeTab} />
                <span className="text-[13px] font-medium">Waiting for {activeTab} response...</span>
             </div>
        )}
      </div>
    </div>
  );
}

// Helper to render icon for placeholder
function IconPlaceholder({ model }: { model: string }) {
    if (model === 'Gemini') return <Sparkles className="w-5 h-5 opacity-50" />;
    if (model === 'Claude') return <BrainCircuit className="w-5 h-5 opacity-50" />;
    return <Bot className="w-5 h-5 opacity-50" />;
}
