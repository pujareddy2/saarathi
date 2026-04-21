import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, RefreshCw, X, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface ChatBotProps {
  profile: UserProfile;
  theme?: 'dark' | 'light';
}

export const ChatBot: React.FC<ChatBotProps> = ({ profile, theme = 'dark' }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: `Greetings, Saarthi user. I am your synchronized behavior guide. How can I assist your ${profile.goal.replace('_', ' ')} journey today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY as string;
      if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
      const ai = new GoogleGenAI({ apiKey });
      const systemPrompt = `
        You are SaarthiAI, a personalized food behavior guide.
        User Context:
        - Age: ${profile.age}
        - Goal: ${profile.goal}
        - Preference: ${profile.preference}
        - Lifestyle: ${profile.lifestyle}
        - Stress Level: ${profile.stress_level}

        Guidelines:
        1. Be concise and authoritative but empathetic.
        2. Give specific behavioral nudges based on the user's profile.
        3. If they ask about eating heavy food at night, recommend lighter alternatives and explain why based on their goal.
        4. Always encourage mindful awareness.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        })), { role: 'user', parts: [{ text: userMsg }] }],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        }
      });

      setMessages(prev => [...prev, { role: 'bot', text: response.text || "I'm processing your request. Please re-state your intention." }]);
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "Protocol interference detected. My intelligence is temporarily offline. Trust your baseline mindful instinct." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl mx-auto rounded-[2.5rem] overflow-hidden border dark:border-white/10 border-slate-200 bg-transparent relative">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <div className="p-6 border-b dark:border-white/10 border-slate-200 backdrop-blur-xl z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
             <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={cn("text-lg font-black italic uppercase tracking-tighter", theme === 'dark' ? "text-white" : "text-slate-900")}>Intelligence Engine</h3>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Synchronized</span>
            </div>
          </div>
        </div>
        <Sparkles className="w-5 h-5 opacity-20 dark:text-white text-black" />
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 z-10 scrollbar-hide"
      >
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-4 w-full",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-white text-black" : "bg-emerald-500/10 text-emerald-500"
              )}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={cn(
                "p-5 rounded-3xl max-w-[80%] font-bold leading-relaxed",
                msg.role === 'user' 
                  ? (theme === 'dark' ? "bg-zinc-800 text-white rounded-tr-none" : "bg-slate-900 text-white rounded-tr-none")
                  : (theme === 'dark' ? "bg-white/5 text-white border border-white/10 rounded-tl-none" : "bg-slate-100 text-slate-900 border border-slate-200 rounded-tl-none")
              )}>
                {msg.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex gap-4"
            >
               <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 animate-spin" />
               </div>
               <div className="p-5 rounded-3xl bg-white/5 border border-white/10 italic font-bold opacity-40">Synchronizing intelligence...</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-6 border-t dark:border-white/10 border-slate-200 backdrop-blur-xl z-10">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative"
        >
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your behavior guide..."
            aria-label="Chat input"
            className={cn(
              "w-full pl-6 pr-16 py-5 rounded-[2rem] border-2 bg-transparent font-bold outline-none transition-all",
              theme === 'dark' ? "border-white/10 text-white focus:border-emerald-500" : "border-slate-200 text-slate-900 focus:border-emerald-500"
            )}
          />
          <button 
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-4 rounded-full bg-emerald-500 text-black shadow-lg active:scale-90 disabled:opacity-30 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
