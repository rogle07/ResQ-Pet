import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  MessageSquare, Send, Users, Search, Phone, Video,
  Smile, Paperclip, Sun, Moon, Check, CheckCheck, Mic
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────── */
interface Message {
  id: number;
  from: string;
  avatar: string;
  text: string;
  time: string;
  self: boolean;
  status: 'sent' | 'delivered' | 'read';
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  avatar: string;
  lastMsg: string;
  time: string;
  unread: number;
}

/* ─── Data ──────────────────────────────────────────────── */
const TEAM_MEMBERS: TeamMember[] = [
  { id: 1, name: 'Arjun Sharma',  role: 'Team Leader',       status: 'online',  avatar: '👮',    lastMsg: 'En route to Haldwani location',       time: '2 min ago',  unread: 2 },
  { id: 2, name: 'Priya Mehta',   role: 'Field Officer',     status: 'online',  avatar: '👩‍⚕️',  lastMsg: 'Animal secured, heading to shelter',   time: '15 min ago', unread: 0 },
  { id: 3, name: 'Rohan Singh',   role: 'Rescue Specialist', status: 'busy',    avatar: '🧑‍🚒', lastMsg: 'Need backup at Nainital checkpoint',   time: '30 min ago', unread: 1 },
  { id: 4, name: 'Kavita Rawat',  role: 'Vet Assistant',     status: 'offline', avatar: '👩‍🔬', lastMsg: 'Medical supplies restocked',           time: '1 hr ago',   unread: 0 },
  { id: 5, name: 'Dev Kumar',     role: 'Driver',            status: 'online',  avatar: '🚐',    lastMsg: 'Vehicle refuelled, ready to deploy',  time: '45 min ago', unread: 0 },
];

const CHAT_HISTORY: Record<number, Message[]> = {
  1: [
    { id: 1, from: 'Arjun Sharma', avatar: '👮',   text: 'Team, HIGH priority — two injured dogs near Haldwani bypass.', time: '10:32 AM', self: false, status: 'read' },
    { id: 2, from: 'You',          avatar: '🦺',   text: 'Roger that. Deploying Unit 2. ETA 12 minutes.', time: '10:33 AM', self: true,  status: 'read' },
    { id: 3, from: 'Arjun Sharma', avatar: '👮',   text: 'Good. Bring the large crate and tranq kit.', time: '10:34 AM', self: false, status: 'read' },
    { id: 4, from: 'You',          avatar: '🦺',   text: 'Already on it! Alerting the shelter too.', time: '10:35 AM', self: true,  status: 'read' },
    { id: 5, from: 'Arjun Sharma', avatar: '👮',   text: '🐾 Great coordination. Let\'s get them to safety!', time: '10:36 AM', self: false, status: 'read' },
    { id: 6, from: 'Arjun Sharma', avatar: '👮',   text: 'On site. Dogs are scared but not aggressive. Proceeding carefully.', time: '10:45 AM', self: false, status: 'delivered' },
    { id: 7, from: 'Arjun Sharma', avatar: '👮',   text: 'First dog secured. Going for the second one now.', time: '10:52 AM', self: false, status: 'sent' },
  ],
  2: [
    { id: 1, from: 'Priya Mehta',  avatar: '👩‍⚕️', text: 'I have the medical kit ready. Heading to your position.', time: '10:34 AM', self: false, status: 'read' },
    { id: 2, from: 'You',          avatar: '🦺',   text: 'Copy that. Meet us at the Haldwani bypass junction.', time: '10:35 AM', self: true,  status: 'read' },
    { id: 3, from: 'Priya Mehta',  avatar: '👩‍⚕️', text: 'Animal secured safely, heading to the shelter now. 🐕', time: '11:00 AM', self: false, status: 'read' },
    { id: 4, from: 'You',          avatar: '🦺',   text: 'Excellent work! Please update the rescue log when done.', time: '11:02 AM', self: true,  status: 'read' },
  ],
  3: [
    { id: 1, from: 'Rohan Singh',  avatar: '🧑‍🚒', text: 'I\'m at the Nainital checkpoint. Need backup — there\'s a monkey.', time: '10:30 AM', self: false, status: 'read' },
    { id: 2, from: 'You',          avatar: '🦺',   text: 'Sending Dev with the cage. Stay safe and keep distance.', time: '10:32 AM', self: true,  status: 'read' },
    { id: 3, from: 'Rohan Singh',  avatar: '🧑‍🚒', text: 'Understood. Setting up a perimeter now.', time: '10:33 AM', self: false, status: 'delivered' },
  ],
  4: [
    { id: 1, from: 'Kavita Rawat', avatar: '👩‍🔬', text: 'Medical supplies fully restocked. Ready for tomorrow.', time: '09:00 AM', self: false, status: 'read' },
    { id: 2, from: 'You',          avatar: '🦺',   text: 'Perfect timing! We have 2 dogs coming in from Haldwani.', time: '09:05 AM', self: true,  status: 'read' },
    { id: 3, from: 'Kavita Rawat', avatar: '👩‍🔬', text: 'I\'ll prepare the treatment bay. Any injuries reported?', time: '09:07 AM', self: false, status: 'read' },
  ],
  5: [
    { id: 1, from: 'Dev Kumar',    avatar: '🚐',   text: 'Vehicle refuelled and ready. Where do you need me?', time: '10:00 AM', self: false, status: 'read' },
    { id: 2, from: 'You',          avatar: '🦺',   text: 'Head to Nainital checkpoint. Rohan needs backup with a cage.', time: '10:05 AM', self: true,  status: 'read' },
    { id: 3, from: 'Dev Kumar',    avatar: '🚐',   text: 'On my way! ETA 20 minutes. 🚐', time: '10:06 AM', self: false, status: 'read' },
  ],
};

const EMOJI_QUICK = ['👍', '✅', '🐾', '🚑', '❤️', '🙏', '🔥', '👏'];

const AUTO_REPLIES: Record<number, string[]> = {
  1: ['Copy that! On my way.', 'Understood. Stand by.', 'Roger! Securing the animal now.', '🐾 Will update shortly.'],
  2: ['Got it! Heading there now.', 'Confirmed. Medical kit ready.', 'All done. Writing the report.', 'On site. Situation under control.'],
  3: ['Backup is coming. Hold position.', 'Perimeter set. Waiting for you.', 'Animal spotted near the fence.', 'Need the tranq kit urgently!'],
  4: ['Treatment bay is ready.', 'Medications logged and stored.', 'Two more cases checked in.', 'Vet on call has been notified.'],
  5: ['Vehicle ready and waiting.', 'Route planned. ETA 15 min.', 'All equipment loaded.', '🚐 Departing now!'],
};

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/* ─── Component ─────────────────────────────────────────── */
const TeamCommunication = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [members, setMembers]           = useState<TeamMember[]>(TEAM_MEMBERS);
  const [chatHistory, setChatHistory]   = useState<Record<number, Message[]>>(CHAT_HISTORY);
  const [selectedId, setSelectedId]     = useState<number>(1);
  const [message, setMessage]           = useState('');
  const [search, setSearch]             = useState('');
  const [showEmoji, setShowEmoji]       = useState(false);
  const [isTyping, setIsTyping]         = useState(false);
  const messagesEndRef                  = useRef<HTMLDivElement>(null);
  const inputRef                        = useRef<HTMLInputElement>(null);
  const typingTimerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedMember = members.find(m => m.id === selectedId) ?? members[0];
  const messages = chatHistory[selectedId] ?? [];

  /* Auto-scroll to bottom whenever messages change */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* Clear unread when switching chat */
  useEffect(() => {
    setMembers(prev => prev.map(m => m.id === selectedId ? { ...m, unread: 0 } : m));
    inputRef.current?.focus();
  }, [selectedId]);

  /* Simulate "typing…" then auto-reply */
  const scheduleReply = useCallback((memberId: number) => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    setIsTyping(true);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      const replies = AUTO_REPLIES[memberId] ?? ['👍'];
      const replyText = replies[Math.floor(Math.random() * replies.length)];
      const member = TEAM_MEMBERS.find(m => m.id === memberId);
      if (!member) return;

      const newMsg: Message = {
        id: Date.now(),
        from: member.name,
        avatar: member.avatar,
        text: replyText,
        time: now(),
        self: false,
        status: 'delivered',
      };

      setChatHistory(prev => ({
        ...prev,
        [memberId]: [...(prev[memberId] ?? []), newMsg],
      }));
      setMembers(prev => prev.map(m =>
        m.id === memberId
          ? { ...m, lastMsg: replyText, time: 'just now' }
          : m
      ));
    }, 1200 + Math.random() * 800);
  }, []);

  /* Send a message */
  const sendMessage = useCallback(() => {
    const text = message.trim();
    if (!text) return;

    const newMsg: Message = {
      id: Date.now(),
      from: 'You',
      avatar: '🦺',
      text,
      time: now(),
      self: true,
      status: 'sent',
    };

    setChatHistory(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), newMsg],
    }));
    setMembers(prev => prev.map(m =>
      m.id === selectedId ? { ...m, lastMsg: text, time: 'just now' } : m
    ));
    setMessage('');
    setShowEmoji(false);

    // Mark as delivered after 600ms, then schedule reply
    setTimeout(() => {
      setChatHistory(prev => ({
        ...prev,
        [selectedId]: (prev[selectedId] ?? []).map(m =>
          m.id === newMsg.id ? { ...m, status: 'delivered' } : m
        ),
      }));
    }, 600);

    // Only reply if member is online/busy
    if (selectedMember.status !== 'offline') {
      scheduleReply(selectedId);
    }
  }, [message, selectedId, selectedMember.status, scheduleReply]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const appendEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  /* Theme helpers */
  const bg          = isDark ? 'bg-[#040d17]'   : 'bg-slate-100';
  const cardBg      = isDark ? 'bg-[#071726]'   : 'bg-white';
  const innerBg     = isDark ? 'bg-[#05111d]'   : 'bg-slate-50';
  const innerBorder = isDark ? 'border-[#14344f]' : 'border-slate-200';
  const textPrimary = isDark ? 'text-white'      : 'text-slate-800';
  const textSec     = isDark ? 'text-slate-400'  : 'text-slate-500';
  const inputClass  = isDark
    ? 'bg-[#071624] border-[#14344f] text-white placeholder-slate-500'
    : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400';

  const statusColor = (s: string) =>
    s === 'online' ? 'bg-emerald-400' : s === 'busy' ? 'bg-amber-400' : 'bg-slate-500';

  const statusLabel = (s: string) =>
    s === 'online' ? 'Online' : s === 'busy' ? 'Busy' : 'Offline';

  const filteredMembers = members.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase())
  );

  const onlineCount = members.filter(m => m.status === 'online').length;

  return (
    <div className={`-m-3.5 sm:-m-5 md:-m-6 min-h-screen ${bg} ${textPrimary} transition-colors duration-300`}
      style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b ${isDark ? 'border-[#0d2235]' : 'border-slate-200'} shrink-0`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <MessageSquare className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${textPrimary}`}>Team Communication</h1>
            <p className={`text-xs ${textSec}`}>
              <span className="text-emerald-400 font-semibold">{onlineCount} online</span> · {members.length} members
            </p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${isDark ? 'border-[#14344f] bg-[#071624] text-amber-400' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'}`}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Members List ─────────────────────────── */}
        <div className={`hidden sm:flex w-72 shrink-0 flex-col border-r ${isDark ? 'border-[#12314a]' : 'border-slate-200'}`}>
          {/* Search */}
          <div className={`p-3 border-b ${isDark ? 'border-[#12314a]' : 'border-slate-200'}`}>
            <div className="relative">
              <Search className={`absolute left-3 top-2.5 h-3.5 w-3.5 ${textSec}`} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search members..."
                className={`w-full rounded-xl border py-2 pl-9 pr-3 text-xs focus:border-emerald-500 focus:outline-none ${inputClass}`}
              />
            </div>
          </div>

          {/* Member list */}
          <div className="flex-1 overflow-y-auto py-2">
            {filteredMembers.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedId(m.id)}
                className={`w-full text-left px-3 py-3 transition-all ${
                  selectedId === m.id
                    ? isDark ? 'bg-emerald-600/15 border-l-2 border-emerald-500' : 'bg-emerald-50 border-l-2 border-emerald-500'
                    : isDark ? 'hover:bg-[#05111d]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {/* Avatar + status dot */}
                  <div className="relative shrink-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xl ${isDark ? 'bg-[#0e273d]' : 'bg-slate-100'}`}>
                      {m.avatar}
                    </div>
                    <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 ${isDark ? 'border-[#071726]' : 'border-white'} ${statusColor(m.status)}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold truncate ${textPrimary}`}>{m.name}</span>
                      <span className={`text-[9px] shrink-0 ml-1 ${textSec}`}>{m.time}</span>
                    </div>
                    <div className={`text-[10px] ${textSec}`}>{m.role}</div>
                    <div className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{m.lastMsg}</div>
                  </div>

                  {m.unread > 0 && (
                    <span className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">
                      {m.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: Chat Area ───────────────────────────── */}
        <div className={`flex flex-1 flex-col min-w-0 ${cardBg}`}>

          {/* Chat header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-[#12314a]' : 'border-slate-200'} shrink-0`}>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xl ${isDark ? 'bg-[#0e273d]' : 'bg-slate-100'}`}>
                {selectedMember.avatar}
              </div>
              <div>
                <div className={`text-sm font-bold ${textPrimary}`}>{selectedMember.name}</div>
                <div className={`flex items-center gap-1.5 text-[10px]`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusColor(selectedMember.status)}`} />
                  <span className={textSec}>{statusLabel(selectedMember.status)}</span>
                  {isTyping && <span className="text-emerald-400 italic">· typing…</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${isDark ? 'border-[#14344f] bg-[#071624] text-slate-400 hover:text-white' : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-700'}`}>
                <Phone className="h-3.5 w-3.5" />
              </button>
              <button className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${isDark ? 'border-[#14344f] bg-[#071624] text-slate-400 hover:text-white' : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-700'}`}>
                <Video className="h-3.5 w-3.5" />
              </button>
              <button className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${isDark ? 'border-[#14344f] bg-[#071624] text-slate-400 hover:text-white' : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-700'}`}>
                <Users className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-5xl mb-3">{selectedMember.avatar}</div>
                <p className={`text-sm font-semibold ${textPrimary}`}>Start a conversation</p>
                <p className={`text-xs ${textSec} mt-1`}>Say hi to {selectedMember.name}!</p>
              </div>
            )}

            {messages.map((msg, idx) => {
              const showDate = idx === 0 || messages[idx - 1].time !== msg.time;
              return (
                <div key={msg.id}>
                  {showDate && idx === 0 && (
                    <div className="flex items-center gap-3 my-2">
                      <div className={`h-px flex-1 ${isDark ? 'bg-[#12314a]' : 'bg-slate-200'}`} />
                      <span className={`text-[9px] font-medium ${textSec}`}>Today</span>
                      <div className={`h-px flex-1 ${isDark ? 'bg-[#12314a]' : 'bg-slate-200'}`} />
                    </div>
                  )}

                  <div className={`flex gap-2.5 ${msg.self ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-sm ${isDark ? 'bg-[#0e273d]' : 'bg-slate-100'}`}>
                      {msg.avatar}
                    </div>

                    {/* Bubble */}
                    <div className={`flex flex-col max-w-[70%] ${msg.self ? 'items-end' : 'items-start'}`}>
                      {!msg.self && (
                        <span className={`text-[10px] font-medium ${textSec} mb-1`}>{msg.from}</span>
                      )}
                      <div className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed break-words ${
                        msg.self
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : isDark
                          ? `${innerBg} border ${innerBorder} text-slate-200 rounded-tl-none`
                          : 'bg-slate-100 text-slate-700 rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                      {/* Time + status */}
                      <div className={`flex items-center gap-1 mt-1 ${msg.self ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className={`text-[9px] ${textSec}`}>{msg.time}</span>
                        {msg.self && (
                          msg.status === 'read'
                            ? <CheckCheck className="h-3 w-3 text-blue-400" />
                            : msg.status === 'delivered'
                            ? <CheckCheck className={`h-3 w-3 ${textSec}`} />
                            : <Check className={`h-3 w-3 ${textSec}`} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2.5 items-end">
                <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-sm ${isDark ? 'bg-[#0e273d]' : 'bg-slate-100'}`}>
                  {selectedMember.avatar}
                </div>
                <div className={`rounded-2xl rounded-tl-none px-4 py-3 ${isDark ? `${innerBg} border ${innerBorder}` : 'bg-slate-100'}`}>
                  <div className="flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Emoji picker */}
          {showEmoji && (
            <div className={`px-4 pb-2 flex flex-wrap gap-2`}>
              {EMOJI_QUICK.map(e => (
                <button
                  key={e}
                  onClick={() => appendEmoji(e)}
                  className={`text-xl rounded-xl p-2 transition-colors ${isDark ? 'hover:bg-[#05111d]' : 'hover:bg-slate-100'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className={`px-4 py-3 border-t ${isDark ? 'border-[#12314a]' : 'border-slate-200'} shrink-0`}>
            <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-colors ${
              isDark ? 'bg-[#05111d] border-[#14344f] focus-within:border-emerald-500/50' : 'bg-slate-50 border-slate-200 focus-within:border-emerald-400'
            }`}>
              {/* Emoji toggle */}
              <button
                onClick={() => setShowEmoji(v => !v)}
                className={`shrink-0 transition-colors ${showEmoji ? 'text-emerald-400' : textSec + ' hover:text-emerald-400'}`}
              >
                <Smile className="h-4 w-4" />
              </button>

              {/* Attachment */}
              <button className={`shrink-0 transition-colors ${textSec} hover:text-emerald-400`}>
                <Paperclip className="h-4 w-4" />
              </button>

              {/* Text input */}
              <input
                ref={inputRef}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${selectedMember.name}…`}
                className={`flex-1 bg-transparent text-xs focus:outline-none ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
              />

              {/* Voice / Send */}
              {message.trim() ? (
                <button
                  onClick={sendMessage}
                  className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button className={`shrink-0 transition-colors ${textSec} hover:text-emerald-400`}>
                  <Mic className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className={`text-[9px] ${textSec} mt-1.5 text-center`}>
              Press <kbd className={`px-1 py-0.5 rounded text-[9px] font-mono ${isDark ? 'bg-[#0b2133]' : 'bg-slate-200'}`}>Enter</kbd> to send
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamCommunication;
