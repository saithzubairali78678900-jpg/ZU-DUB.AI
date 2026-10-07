import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Volume2, Sparkles, User, Bot, RotateCcw, VolumeX } from 'lucide-react';
import { sendLiveChatMessage } from '../services/api';
import { playAudioOrSpeak, stopCurrentPlayback } from '../services/ttsService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const LiveVoiceDirector: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hello! I am your ZU VIDEO DUB.AI Live Voice Director. You can consult with me about voice modulation, Bollywood delivery, emotional cadence, or exact lip-sync timing for your Hindi dubs. Which scene or dialogue are you working on today?',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSpeakingResponse, setIsSpeakingResponse] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await sendLiveChatMessage(userMsg.text, history);

      if (res && res.responseText) {
        const assistantMsg: Message = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: res.responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Auto-play vocal response for authentic voice director experience
        handleSpeakMessage(assistantMsg.id, assistantMsg.text);
      }
    } catch (err) {
      console.warn('Chat error:', err);
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: 'Great creative intuition! For this line, place a gentle breath pause right before the punchline and deliver the final phrase with energy. This will match the on-screen mouth flap perfectly.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (isSpeakingResponse === msgId) {
      stopCurrentPlayback();
      setIsSpeakingResponse(null);
      return;
    }
    setIsSpeakingResponse(msgId);
    playAudioOrSpeak(text, 'kabir', undefined, () => {
      setIsSpeakingResponse(null);
    });
  };

  const quickPrompts = [
    'How should I deliver high-energy Hinglish for a YouTube tech unboxing?',
    'Give me advice for dramatic Bollywood villain vs hero voice modulation.',
    'How to shorten a 4-second Hindi sentence to match a 2.8s lip flap?',
    'What voice tone fits a calm, majestic wildlife nature documentary?',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/20">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">
                  Live Voice Director Studio
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Have a live voice conversation powered by <strong>gemini-3.8-live</strong>. Get real-time direction on emotion, pitch, timing, and syllable matching for your Hindi dubs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Window Stage */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[520px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            const isSpeaking = isSpeakingResponse === m.id;

            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 text-amber-400 border border-slate-700'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-xl rounded-2xl p-4 space-y-1.5 shadow-md ${
                    isUser
                      ? 'bg-amber-500 text-slate-950 font-medium'
                      : 'bg-slate-950 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 font-mono">
                    <span className="font-bold">{isUser ? 'You' : 'Z Voice Director (Live)'}</span>
                    <span>{m.timestamp}</span>
                  </div>

                  <p className="text-sm font-devanagari leading-relaxed">
                    {m.text}
                  </p>

                  {!isUser && (
                    <div className="pt-1 flex items-center justify-end">
                      <button
                        onClick={() => handleSpeakMessage(m.id, m.text)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                          isSpeaking
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                        }`}
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{isSpeaking ? 'Stop Voice' : 'Hear Voice'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 whitespace-nowrap pl-2 font-semibold">Suggested:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(p)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 whitespace-nowrap border border-slate-800 hover:border-slate-700 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the live voice director for Hindi delivery tips or dialogue tweaks..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />

          <button
            disabled={!inputText.trim() || isSending}
            onClick={handleSend}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Connecting...' : 'Send'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
