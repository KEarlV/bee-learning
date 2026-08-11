import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, Lightbulb, MessageSquare } from 'lucide-react';
import BeeAnimatedMascot from './BeeAnimatedMascot';
import { askBeeTutor } from '../services/geminiService';
import { FormattedMessageText } from '../utils/formatText';

export default function AITutorDrawer({ isOpen, onClose, cardContext = '' }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bee',
      text: `BZZZ! 🐝 Hi there! I am Bee, your AI study buddy. Ask me anything about ${cardContext || 'your study topics'}!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText) => {
    const query = questionText || input;
    if (!query.trim() || loading) return;

    // Add user message
    const userMsg = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const beeReply = await askBeeTutor(query, cardContext);
      setMessages((prev) => [...prev, { sender: 'bee', text: beeReply }]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [...prev, { sender: 'bee', text: 'Bzzz! Bee had a small hiccup. Please try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl flex flex-col justify-between p-4">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <BeeAnimatedMascot size="sm" animated={true} />
          <div>
            <h3 className="font-bold text-white text-base">Ask Bee! AI Tutor</h3>
            <p className="text-[10px] text-sky-400 font-semibold">Gemini Powered Assistant</p>
          </div>
        </div>

        <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
          <X size={18} />
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-2 my-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => handleSend('Explain this concept in super simple terms.')}
          className="text-[11px] font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20 px-2.5 py-1 rounded-full whitespace-nowrap hover:bg-sky-500/20"
        >
          💡 Simple Explanation
        </button>
        <button
          onClick={() => handleSend('Give me a funny mnemonic acronym for this.')}
          className="text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-full whitespace-nowrap hover:bg-amber-500/20"
        >
          🐝 Mnemonic Trick
        </button>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 my-2 pr-1">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-sky-500 text-white rounded-br-none'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700 rounded-bl-none'
              }`}
            >
              <FormattedMessageText text={msg.text} />
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-sky-400 animate-pulse">
            <BeeAnimatedMascot size="sm" animated={true} />
            <span>Bee is typing...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask Bee anything..."
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="btn-primary p-2.5 rounded-xl disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
