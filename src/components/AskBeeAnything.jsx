import React, { useState } from 'react';
import { Bot, Send, Sparkles, Lightbulb, HelpCircle, ArrowRight, MessageSquareText, ShieldCheck } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import SkeletonLoader from './SkeletonLoader';
import { askBeeTutor, getSmartFallbackAnswer } from '../services/geminiService';
import { FormattedMessageText } from '../utils/formatText';

export default function AskBeeAnything() {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'bee',
      text: "BZZZ! 🐝 Welcome to Ask Bee Anything! Ask me any homework question, concept explanation, or study strategy problem, and I'll break it down step by step!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    'Explain Cellular Respiration in simple terms',
    'How do closures work in JavaScript?',
    'Give me a 3-step study plan for my midterms',
    'What is the difference between DNA and RNA?'
  ];

  const handleSend = async (customPrompt) => {
    const text = customPrompt || input;
    if (!text.trim() || loading) return;

    const userMsg = { id: 'usr-' + Date.now(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await askBeeTutor(text, 'General AI Q&A Studio');
      setMessages((prev) => [...prev, { id: 'bee-' + Date.now(), sender: 'bee', text: reply || getSmartFallbackAnswer(text, 'General AI Q&A Studio') }]);
    } catch (e) {
      const fallback = getSmartFallbackAnswer(text, 'General AI Q&A Studio');
      setMessages((prev) => [...prev, { id: 'bee-' + Date.now(), sender: 'bee', text: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header Banner */}
      <div className="glass-panel p-6 border-sky-500/30 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="text-sky-400" size={26} />
            <h2 className="text-2xl font-bold text-white font-display">Ask Bee Anything Studio</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Get instant AI explanations, homework help, and study analogies from mascot Bee!
          </p>
        </div>

        <BeeAnimatedMascot size="lg" animated={true} speechBubble="Ask Bee anything!" />
      </div>

      {/* Suggested Prompts Chips */}
      <div className="glass-panel p-4 space-y-2 border-slate-800">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Suggested Questions</span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="text-xs bg-slate-900 border border-slate-800 hover:border-sky-500 text-sky-300 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
            >
              <Lightbulb size={13} className="text-amber-400" />
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Stream Window */}
      <div className="glass-panel p-6 min-h-[360px] flex flex-col justify-between border-slate-800 space-y-4">
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-none">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2.5`}
            >
              {m.sender === 'bee' && <BeeAnimatedMascot size="sm" animated={true} />}
              <div
                className={`max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-sky-500 text-white rounded-br-none shadow-md font-medium'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm'
                }`}
              >
                <FormattedMessageText text={m.text} />
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 w-fit">
              <BeeAnimatedMascot size="sm" animated={true} />
              <span className="text-xs text-sky-400 animate-pulse font-semibold">
                Bee is crafting your explanation...
              </span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question or homework problem here..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none shadow-inner"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="btn-primary py-3 px-5 text-xs disabled:opacity-50"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Ask Bee</span>
          </button>
        </div>
      </div>
    </div>
  );
}
