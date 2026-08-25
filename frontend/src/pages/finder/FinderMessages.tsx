import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Send,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { FinderMessage } from '@/types/finder';

const INITIAL_MESSAGES: FinderMessage[] = [
  {
    id: 'MSG-1',
    sender: 'rescue_team',
    senderName: 'Lucknow Central Dispatch (Vikram)',
    text: 'Hello Rahul! We received your report for the injured dog near Wave Mall (REP-2026-0812). Our Rapid Unit 4 has been dispatched.',
    timestamp: '02:45 PM',
    isRead: true,
  },
  {
    id: 'MSG-2',
    sender: 'finder',
    senderName: 'Rahul Sharma (You)',
    text: 'Thanks Vikram! I have placed a clean water bowl near the dog. He is resting quietly under the neem tree.',
    timestamp: '02:47 PM',
    isRead: true,
  },
  {
    id: 'MSG-3',
    sender: 'rescue_team',
    senderName: 'Lucknow Central Dispatch (Vikram)',
    text: 'Excellent work! The ambulance is 5 minutes away. Driver phone: +91 94150 12345.',
    timestamp: '02:49 PM',
    isRead: true,
  },
];

export const FinderMessages: React.FC = () => {
  const [messages, setMessages] = useState<FinderMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: FinderMessage = {
      id: `MSG-${Date.now()}`,
      sender: 'finder',
      senderName: 'Rahul Sharma (You)',
      text: inputText,
      timestamp: 'Just now',
      isRead: true,
    };

    setMessages([...messages, newMsg]);
    setInputText('');

    // Simulate auto-reply from dispatcher
    setTimeout(() => {
      const reply: FinderMessage = {
        id: `MSG-${Date.now() + 1}`,
        sender: 'rescue_team',
        senderName: 'Lucknow Central Dispatch (Vikram)',
        text: 'Received your message! We are updating the live tracking coordinates.',
        timestamp: 'Just now',
        isRead: true,
      };
      setMessages((prev) => [...prev, reply]);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/finder" className="hover:text-purple-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-purple-800 dark:text-purple-400">Messages</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Rescue Dispatch Communications
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Live direct chat with field rescue officers and triage teams handling your reports.
        </p>
      </div>

      {/* Chat Container */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col h-[520px]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600 text-white font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white">Lucknow Central Dispatch Control</h3>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online • Rapid Unit Active
              </p>
            </div>
          </div>

          <a
            href="tel:1800264625"
            className="flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300"
          >
            <Phone className="h-3.5 w-3.5" /> Call Squad
          </a>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'finder' ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[10px] text-slate-400 mb-1 px-1">{m.senderName} • {m.timestamp}</span>
              <div
                className={`max-w-md p-3.5 rounded-2xl ${
                  m.sender === 'finder'
                    ? 'bg-purple-700 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Type message to rescue squad..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            className="rounded-2xl bg-purple-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-800 shadow-md transition-all hover:scale-105"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
export default FinderMessages;
