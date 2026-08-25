import { useState, useRef, useEffect } from 'react';
import { Send, Search, MessageSquare, Phone, Video, MoreVertical, Check, CheckCheck } from 'lucide-react';

type Message = { id: string; from: string; text: string; time: string; isMe: boolean; status: 'sent' | 'delivered' | 'read' };
type ConvMessages = Record<string, Message[]>;

const CONVERSATIONS = [
  { id: '1', from: 'Rescue Team Alpha', initials: 'RA', color: 'bg-violet-600', lastMessage: 'We are on the way to Indira Nagar.', timeAgo: '5 min ago', unread: 2, online: true },
  { id: '2', from: 'Rescue Team Bravo', initials: 'RB', color: 'bg-blue-600', lastMessage: 'Need a vet at Faizabad Road case.', timeAgo: '20 min ago', unread: 1, online: true },
  { id: '3', from: 'Volunteer Group', initials: 'VG', color: 'bg-emerald-600', lastMessage: 'We can help with transport.', timeAgo: '1 hr ago', unread: 0, online: false },
  { id: '4', from: 'Dr. Sharma (Vet)', initials: 'DS', color: 'bg-teal-600', lastMessage: 'The dog needs surgery tomorrow morning.', timeAgo: '2 hr ago', unread: 0, online: false },
  { id: '5', from: 'Rescue Team Charlie', initials: 'RC', color: 'bg-amber-600', lastMessage: 'Case C003 has been resolved.', timeAgo: '3 hr ago', unread: 0, online: false },
  { id: '6', from: 'Admin Ravi', initials: 'AR', color: 'bg-rose-600', lastMessage: 'Please submit the monthly report by Friday.', timeAgo: '5 hr ago', unread: 0, online: false },
];

const INITIAL_MESSAGES: ConvMessages = {
  '1': [
    { id: 'm1', from: 'Rescue Team Alpha', text: 'We received the request. Heading to Indira Nagar now.', time: '10:32 AM', isMe: false, status: 'read' },
    { id: 'm2', from: 'NGO', text: 'Great! Please update once you reach the site.', time: '10:33 AM', isMe: true, status: 'read' },
    { id: 'm3', from: 'Rescue Team Alpha', text: 'Will do. ETA 15 minutes.', time: '10:34 AM', isMe: false, status: 'read' },
    { id: 'm4', from: 'Rescue Team Alpha', text: 'We are on the way to Indira Nagar.', time: '10:38 AM', isMe: false, status: 'read' },
  ],
  '2': [
    { id: 'm1', from: 'Rescue Team Bravo', text: 'The cow on Faizabad Road is in critical condition.', time: '10:15 AM', isMe: false, status: 'read' },
    { id: 'm2', from: 'NGO', text: "I'll contact Dr. Yadav immediately.", time: '10:16 AM', isMe: true, status: 'read' },
    { id: 'm3', from: 'Rescue Team Bravo', text: 'Need a vet at Faizabad Road case.', time: '10:18 AM', isMe: false, status: 'read' },
  ],
  '3': [
    { id: 'm1', from: 'Volunteer Group', text: 'Hello! We are available for transport support.', time: '9:00 AM', isMe: false, status: 'read' },
    { id: 'm2', from: 'NGO', text: 'Thank you! We may need you around 2 PM.', time: '9:05 AM', isMe: true, status: 'delivered' },
    { id: 'm3', from: 'Volunteer Group', text: 'We can help with transport.', time: '9:10 AM', isMe: false, status: 'read' },
  ],
  '4': [
    { id: 'm1', from: 'Dr. Sharma (Vet)', text: 'The injured dog at Indira Nagar needs X-rays done urgently.', time: '8:30 AM', isMe: false, status: 'read' },
    { id: 'm2', from: 'NGO', text: 'We will arrange that. Can you be there by 11 AM?', time: '8:35 AM', isMe: true, status: 'read' },
    { id: 'm3', from: 'Dr. Sharma (Vet)', text: 'The dog needs surgery tomorrow morning.', time: '8:40 AM', isMe: false, status: 'read' },
  ],
  '5': [
    { id: 'm1', from: 'Rescue Team Charlie', text: 'All stray dogs in Aliganj have been relocated.', time: '7:00 AM', isMe: false, status: 'read' },
    { id: 'm2', from: 'Rescue Team Charlie', text: 'Case C003 has been resolved.', time: '7:05 AM', isMe: false, status: 'read' },
    { id: 'm3', from: 'NGO', text: 'Excellent work team! Great job.', time: '7:10 AM', isMe: true, status: 'delivered' },
  ],
  '6': [
    { id: 'm1', from: 'Admin Ravi', text: 'Please submit the monthly report by Friday.', time: '6:00 AM', isMe: false, status: 'read' },
  ],
};

// Simulate bot auto-reply after user sends a message
const AUTO_REPLIES: Record<string, string[]> = {
  '1': ['Got it, will update you!', 'Animal is now secured. Heading back to shelter.', 'Team Alpha reporting in. All clear.'],
  '2': ['Vet is on the way.', 'Situation is under control now.', 'Need more supplies at this location.'],
  '3': ['Confirmed, we will be ready.', 'Our driver will be there on time.', 'Thanks for the update!'],
  '4': ['Surgery went well.', 'Animal is recovering.', 'Follow-up check scheduled for tomorrow.'],
  '5': ['Understood, thank you!', 'Will proceed as instructed.', 'Standing by for next assignment.'],
  '6': ['Noted. Will send it by EOD.', 'Report is ready for review.'],
};

const NgoMessages = () => {
  const [activeConv, setActiveConv] = useState('1');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ConvMessages>(INITIAL_MESSAGES);
  const [search, setSearch] = useState('');
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({ '1': 2, '2': 1 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConv]);

  // Clear unread when switching conversation
  useEffect(() => {
    setUnreadMap((prev) => ({ ...prev, [activeConv]: 0 }));
    inputRef.current?.focus();
  }, [activeConv]);

  const filteredConvs = CONVERSATIONS.filter((c) =>
    c.from.toLowerCase().includes(search.toLowerCase())
  );

  const activeConvData = CONVERSATIONS.find((c) => c.id === activeConv);
  const activeMessages = messages[activeConv] || [];

  const sendMessage = () => {
    const text = message.trim();
    if (!text) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: `m${Date.now()}`,
      from: 'NGO',
      text,
      time: now,
      isMe: true,
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      [activeConv]: [...(prev[activeConv] || []), newMsg],
    }));
    setMessage('');

    // Simulate status progression: sent → delivered → read
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeConv]: prev[activeConv]?.map((m) =>
          m.id === newMsg.id ? { ...m, status: 'delivered' } : m
        ),
      }));
    }, 800);
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeConv]: prev[activeConv]?.map((m) =>
          m.id === newMsg.id ? { ...m, status: 'read' } : m
        ),
      }));
    }, 1500);

    // Simulate auto-reply from the other side
    const replies = AUTO_REPLIES[activeConv];
    if (replies) {
      const replyText = replies[Math.floor(Math.random() * replies.length)];
      setTimeout(() => {
        const replyMsg: Message = {
          id: `mr${Date.now()}`,
          from: activeConvData?.from || 'Contact',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false,
          status: 'read',
        };
        setMessages((prev) => ({
          ...prev,
          [activeConv]: [...(prev[activeConv] || []), replyMsg],
        }));
      }, 2500 + Math.random() * 1000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Communicate with your rescue teams and volunteers.
        </p>
      </div>

      <div className="flex h-[calc(100vh-14rem)] min-h-[500px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* ── Sidebar ── */}
        <div className="flex w-72 shrink-0 flex-col border-r border-slate-100 dark:border-slate-800">
          {/* Search */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs focus:border-violet-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={`flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                  activeConv === conv.id
                    ? 'bg-violet-50 border-l-2 border-violet-600 dark:bg-violet-900/20'
                    : 'border-l-2 border-transparent'
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${conv.color} text-xs font-bold text-white`}>
                    {conv.initials}
                  </div>
                  {conv.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{conv.from}</p>
                    <span className="shrink-0 text-[10px] text-slate-400">{conv.timeAgo}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">{conv.lastMessage}</p>
                </div>
                {(unreadMap[conv.id] || 0) > 0 && (
                  <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                    {unreadMap[conv.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div className="flex flex-1 flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${activeConvData?.color} text-xs font-bold text-white shrink-0`}>
                {activeConvData?.initials}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{activeConvData?.from}</p>
                <p className={`text-[11px] ${activeConvData?.online ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {activeConvData?.online ? '● Online' : '● Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-violet-600 dark:hover:bg-slate-800 transition-colors">
                <Phone className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-violet-600 dark:hover:bg-slate-800 transition-colors">
                <Video className="h-4 w-4" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
            {activeMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-sm text-slate-400">
                <MessageSquare className="h-10 w-10 mb-2 text-slate-300" />
                No messages yet. Start the conversation!
              </div>
            ) : (
              activeMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                  {!msg.isMe && (
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${activeConvData?.color} text-[10px] font-bold text-white mr-2 mt-1`}>
                      {activeConvData?.initials}
                    </div>
                  )}
                  <div className={`max-w-[65%] ${msg.isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`rounded-2xl px-4 py-2.5 ${
                        msg.isMe
                          ? 'bg-violet-600 text-white rounded-tr-sm'
                          : 'bg-white text-slate-800 rounded-tl-sm shadow-sm dark:bg-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className={`text-[10px] ${msg.isMe ? 'text-slate-400' : 'text-slate-400'}`}>{msg.time}</span>
                      {msg.isMe && (
                        <span className="text-[10px]">
                          {msg.status === 'sent' && <Check className="h-3 w-3 text-slate-400" />}
                          {msg.status === 'delivered' && <CheckCheck className="h-3 w-3 text-slate-400" />}
                          {msg.status === 'read' && <CheckCheck className="h-3 w-3 text-violet-500" />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="shrink-0 flex items-center gap-3 border-t border-slate-100 p-4 dark:border-slate-800 bg-white dark:bg-slate-900">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Press Enter to send)"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-violet-600/25"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NgoMessages;
