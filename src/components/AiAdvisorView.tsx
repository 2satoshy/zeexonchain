import React, { useState } from 'react';
import { Sparkles, Send, ShieldCheck, Bot, User, ArrowRight, Loader2 } from 'lucide-react';

interface AiAdvisorViewProps {
  portfolioContext: any;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({ portfolioContext }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am your ZEEX AI Financial Copilot, powered by Gemini and SECZim capital market intelligence. How can I assist you with your Zimbabwean SME share portfolio, InvoiceX yields, or $ZIG stablecoin strategy today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText, portfolioContext })
      });
      const data = await res.json();

      setMessages(prev => [...prev, { role: 'assistant', text: data.reply || 'No response generated.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error connecting to the ZEEX AI server.' }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPrompts = [
    'Which SME stock has the highest dividend yield for Q3 2026?',
    'Explain how ZSE Debtbridge Trust guarantees my share tokens.',
    'What is the risk-return profile of InvoiceX discounting vs equity?',
    'How does the $ZIG stablecoin maintain parity against inflation?'
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-gradient-to-br from-purple-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>ZEEX AI Copilot • Powered by Gemini</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Intelligent Capital Advisory</h1>
          <p className="text-slate-300 text-sm mt-1">
            Get expert, SECZim-aligned insights on Zimbabwean SME equities, working capital yields, and macroeconomic stability.
          </p>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-slate-500 shrink-0">Suggested:</span>
        {suggestedPrompts.map(prompt => (
          <button
            key={prompt}
            onClick={() => {
              setInput(prompt);
            }}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-2xl whitespace-nowrap shadow-xs transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-[550px]">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-start space-x-3 max-w-[85%] sm:max-w-[75%] ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-purple-100 text-purple-700'}`}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-slate-50 text-slate-900 rounded-tl-none border border-slate-200/80'}`}>
                  {m.text}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                <span className="text-xs text-slate-500 font-medium">ZEEX AI is analyzing SECZim market data...</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex items-center space-x-3">
          <input
            type="text"
            placeholder="Ask about SME stocks, $ZIG reserves, or InvoiceX yields..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-3.5 bg-slate-100 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="p-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-md transition-all flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
