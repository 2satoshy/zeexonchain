import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Send, ShieldCheck, CheckCircle2, Bot, User, Sparkles } from 'lucide-react';
import { WhatsAppMessage } from '../types';

export const WhatsAppWalletView: React.FC = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([
    {
      id: 'm-1',
      sender: 'bot',
      text: '🤖 *Welcome to ZEEX WhatsApp Pay*\n\nYour phone number (+263 77 491 8820) is successfully linked to your Base crypto wallet and SECZim custodial trust.\n\nType any command below or click a quick action:',
      timestamp: '14:00'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: WhatsAppMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/whatsapp/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, phoneNumber: '+263 77 491 8820' })
      });
      const data = await res.json();

      setTimeout(() => {
        setIsTyping(false);
        const botMsg: WhatsAppMessage = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionCard: data.actionCard
        };
        setMessages(prev => [...prev, botMsg]);
      }, 700);
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: '⚠️ Sorry, network error connecting to ZEEX WhatsApp relay. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const quickCommands = [
    'balance',
    'buy 100 nyng',
    'send 250 zig to +263 77 123 4567',
    'invoices',
    'menu'
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Smartphone className="w-4 h-4" />
            <span>WhatsApp Trading Wallet • Non-Crypto UX</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Chat & Trade via WhatsApp</h1>
          <p className="text-slate-500 text-sm mt-1">
            Simulated WhatsApp interface connecting phone numbers directly to Base wallets and SECZim tokenized assets.
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Phone # +263 77 491 8820 Linked</span>
        </div>
      </div>

      {/* WhatsApp Chat Box */}
      <div className="bg-[#efeae2] rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col h-[600px]">
        {/* WhatsApp Chat Header */}
        <div className="bg-[#005e54] text-white px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-white shadow-xs">
              ZX
            </div>
            <div>
              <div className="font-bold text-sm">ZEEX Official Trading Bot</div>
              <div className="text-[11px] text-emerald-200 flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                Online • SECZim Verified Gateway
              </div>
            </div>
          </div>
          <div className="text-xs bg-black/20 px-3 py-1 rounded-full font-mono">
            Base L2 • Encrypted
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[radial-gradient(#e5ddd5_1px,transparent_1px)] [background-size:16px_16px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%], sm:max-w-[70%] rounded-2xl p-4 shadow-xs text-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#dcf8c6] text-slate-900 rounded-tr-none'
                    : 'bg-white text-slate-900 rounded-tl-none border border-slate-200/60'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                {/* Action Card if any */}
                {msg.actionCard && (
                  <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
                    <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-1">
                      {msg.actionCard.title}
                    </div>
                    {Object.entries(msg.actionCard.details).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-slate-500">{k}:</span>
                        <span className="font-bold text-slate-900">{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 text-right mt-1.5 font-medium">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200 flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Command Suggestions */}
        <div className="bg-white px-4 py-2.5 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Quick Chat:</span>
          {quickCommands.map(cmd => (
            <button
              key={cmd}
              onClick={() => handleSend(cmd)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-full whitespace-nowrap transition-all"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="bg-white p-3 sm:p-4 border-t border-slate-200 flex items-center space-x-3">
          <input
            type="text"
            placeholder="Type message or command (e.g., 'buy 50 nyng')..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 bg-slate-100 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <button
            onClick={() => handleSend()}
            className="p-3 bg-[#005e54] hover:bg-[#004d44] text-white rounded-2xl shadow-md transition-all flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
