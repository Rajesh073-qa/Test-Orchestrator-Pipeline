'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, MinusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your AI QA Agent. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data } = await api.post('/chat', { message: userMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[400px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-white/10">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight">AI QA Agent</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Always Online</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/10 rounded-xl" onClick={() => setIsOpen(false)}>
              <MinusCircle className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3 max-w-[85%]", m.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", m.role === 'assistant' ? "bg-slate-900 text-white" : "bg-primary text-white shadow-lg shadow-primary/20")}>
                  {m.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={cn("p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm", m.role === 'assistant' ? "bg-white text-slate-700 border border-slate-100" : "bg-primary text-white")}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Agent is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask me anything..." 
                className="w-full h-14 pl-6 pr-16 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
              />
              <Button 
                size="icon" 
                className={cn("absolute right-2 top-2 h-10 w-10 rounded-xl transition-all", input.trim() ? "bg-primary shadow-lg shadow-primary/20 scale-100" : "bg-slate-200 scale-90 opacity-50")}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">
              <Sparkles className="w-3 h-3 inline mr-1 text-primary" /> Powered by GPT-4o Enterprise
            </p>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <Button 
        size="icon" 
        className={cn("w-16 h-16 rounded-[2rem] shadow-2xl transition-all hover:scale-105 active:scale-95", isOpen ? "bg-slate-900 rotate-90" : "bg-primary shadow-primary/30")}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageSquare className="w-7 h-7" />}
      </Button>
    </div>
  );
}
