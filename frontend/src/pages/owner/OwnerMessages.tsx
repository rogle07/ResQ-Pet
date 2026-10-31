import { useState, useEffect } from 'react';
import { useAppSelector } from '@/app/hooks';
import { getSocket } from '@/hooks/useSocket';
import {
  MessageSquare,
  Search,
  PawPrint,
  Heart,
  AlertTriangle,
  Clock,
  Circle,
  Send,
  Shield,
  CheckCheck,
} from 'lucide-react';

interface ChatMessage {
  _id: string;
  sender: {
    _id?: string;
    name: string;
    role?: string;
  };
  text: string;
  imageUrl?: string;
  createdAt: string;
  isRead?: boolean;
}

interface ConversationItem {
  _id: string;
  type: 'lost_found_case' | 'foster_care' | 'adoption';
  caseId: string;
  relatedId: string;
  otherParticipant: {
    _id?: string;
    name: string;
    role?: string;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

const TYPE_CONFIG = {
  lost_found_case: {
    label: 'Lost & Found Case',
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
  },
  foster_care: {
    label: 'Foster Care Request',
    icon: <PawPrint className="h-4 w-4" />,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  adoption: {
    label: 'Adoption Request',
    icon: <Heart className="h-4 w-4" />,
    color: 'text-pink-600',
    bg: 'bg-pink-50 dark:bg-pink-950/30',
    border: 'border-pink-200 dark:border-pink-800',
  },
};

const INITIAL_CONVERSATIONS: ConversationItem[] = [
  {
    _id: 'conv-lost-01',
    type: 'lost_found_case',
    caseId: 'LP-A1B2C3',
    relatedId: 'Case: LP-A1B2C3 (Bruno)',
    otherParticipant: { name: 'Rahul Sharma (Finder)', role: 'finder' },
    lastMessage: 'Yes, the dog has a distinctive white patch on the left ear.',
    lastMessageAt: '2026-10-31T10:30:00Z',
    unreadCount: 1,
  },
  {
    _id: 'conv-foster-02',
    type: 'foster_care',
    caseId: 'FC-MILO02',
    relatedId: 'Request: FC-MILO02 (Milo)',
    otherParticipant: { name: 'Sarah Jenkins (Foster Provider)', role: 'foster_home' },
    lastMessage: 'Our quiet feline suite is ready. Looking forward to Milo!',
    lastMessageAt: '2026-10-30T14:20:00Z',
    unreadCount: 0,
  },
  {
    _id: 'conv-adopt-03',
    type: 'adoption',
    caseId: 'AR-001',
    relatedId: 'Adoption: AR-001 (Coco)',
    otherParticipant: { name: 'Priya Nair (Adopter)', role: 'adopter' },
    lastMessage: 'Could we schedule a home visit this coming Saturday?',
    lastMessageAt: '2026-10-29T16:00:00Z',
    unreadCount: 0,
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-lost-01': [
    {
      _id: 'm1',
      sender: { name: 'Rahul Sharma (Finder)', role: 'finder' },
      text: 'Hello, I reported a found Golden Retriever near Sector 15. The match score showed 91%.',
      createdAt: '2026-10-31T10:15:00Z',
      isRead: true,
    },
    {
      _id: 'm2',
      sender: { name: 'You', role: 'owner' },
      text: 'Hi Rahul! Bruno has a small white patch on his left ear. Can you confirm if you see that?',
      createdAt: '2026-10-31T10:22:00Z',
      isRead: true,
    },
    {
      _id: 'm3',
      sender: { name: 'Rahul Sharma (Finder)', role: 'finder' },
      text: 'Yes, the dog has a distinctive white patch on the left ear.',
      createdAt: '2026-10-31T10:30:00Z',
      isRead: false,
    },
  ],
  'conv-foster-02': [
    {
      _id: 'mf1',
      sender: { name: 'You', role: 'owner' },
      text: 'Hello Sarah, I submitted a foster care request for Milo for 8 days.',
      createdAt: '2026-10-30T11:00:00Z',
      isRead: true,
    },
    {
      _id: 'mf2',
      sender: { name: 'Sarah Jenkins (Foster Provider)', role: 'foster_home' },
      text: 'Our quiet feline suite is ready. Looking forward to Milo!',
      createdAt: '2026-10-30T14:20:00Z',
      isRead: true,
    },
  ],
  'conv-adopt-03': [
    {
      _id: 'ma1',
      sender: { name: 'Priya Nair (Adopter)', role: 'adopter' },
      text: 'Hello, I saw your listing for Coco. We have a spacious garden and love Beagles.',
      createdAt: '2026-10-29T15:30:00Z',
      isRead: true,
    },
    {
      _id: 'ma2',
      sender: { name: 'Priya Nair (Adopter)', role: 'adopter' },
      text: 'Could we schedule a home visit this coming Saturday?',
      createdAt: '2026-10-29T16:00:00Z',
      isRead: true,
    },
  ],
};

const OwnerMessages = () => {
  const currentUser = useAppSelector((s) => s.auth.user);
  const [conversations, setConversations] = useState<ConversationItem[]>(() => {
    try {
      const saved = localStorage.getItem('resqpet_owner_conversations_v1');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return INITIAL_CONVERSATIONS;
  });

  const [activeConvId, setActiveConvId] = useState<string>('conv-lost-01');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('resqpet_messages_map_v1');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return INITIAL_MESSAGES;
  });

  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    try {
      localStorage.setItem('resqpet_owner_conversations_v1', JSON.stringify(conversations));
      localStorage.setItem('resqpet_messages_map_v1', JSON.stringify(messagesMap));
    } catch { /* ignore */ }
  }, [conversations, messagesMap]);

  // Socket.IO listener for incoming messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    if (currentUser?._id) {
      socket.emit('join:user', currentUser._id);
    }

    const handleIncomingMessage = (data: any) => {
      if (!data?.message) return;
      const convId = data.conversationId || activeConvId;
      const newMsg: ChatMessage = {
        _id: data.message._id || `msg-${Date.now()}`,
        sender: data.message.sender || { name: 'Other User' },
        text: data.message.text,
        imageUrl: data.message.imageUrl,
        createdAt: data.message.createdAt || new Date().toISOString(),
        isRead: convId === activeConvId,
      };

      setMessagesMap((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] || []), newMsg],
      }));

      setConversations((prev) =>
        prev.map((c) =>
          c._id === convId
            ? {
                ...c,
                lastMessage: data.message.text || '[Image]',
                lastMessageAt: new Date().toISOString(),
                unreadCount: convId === activeConvId ? 0 : c.unreadCount + 1,
              }
            : c
        )
      );
    };

    socket.on('chat:message', handleIncomingMessage);
    return () => {
      socket.off('chat:message', handleIncomingMessage);
    };
  }, [activeConvId, currentUser]);

  const activeConversation = conversations.find((c) => c._id === activeConvId) || conversations[0];
  const activeMessages = activeConversation ? messagesMap[activeConversation._id] || [] : [];

  const handleSelectConv = (convId: string) => {
    setActiveConvId(convId);
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c._id === convId ? { ...c, unreadCount: 0 } : c))
    );
    setMessagesMap((prev) => ({
      ...prev,
      [convId]: (prev[convId] || []).map((m) => ({ ...m, isRead: true })),
    }));
  };

  const handleSend = () => {
    if (!inputText.trim() || !activeConversation) return;

    const newMsg: ChatMessage = {
      _id: `msg-${Date.now()}`,
      sender: {
        _id: currentUser?._id,
        name: currentUser?.name || 'You',
        role: currentUser?.role || 'owner',
      },
      text: inputText.trim(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    const convId = activeConversation._id;

    setMessagesMap((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), newMsg],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c._id === convId
          ? {
              ...c,
              lastMessage: inputText.trim(),
              lastMessageAt: new Date().toISOString(),
            }
          : c
      )
    );

    // Also emit via socket if available
    const socket = getSocket();
    if (socket) {
      socket.emit('chat:send', {
        conversationId: convId,
        text: inputText.trim(),
      });
    }

    setInputText('');
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesFilter = selectedFilter === 'all' || c.type === selectedFilter;
    const matchesSearch =
      c.otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.relatedId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-emerald-600" />
            Messages
            {totalUnread > 0 && (
              <span className="rounded-full bg-rose-500 text-white text-xs font-bold px-2 py-0.5">
                {totalUnread} new
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Unified communications for Lost Pet Cases, Foster Care, and Adoption requests.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Shield className="h-4 w-4 text-emerald-600" />
          <span>Private & encrypted • Phone numbers protected</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-210px)] min-h-[520px]">
        {/* Left Sidebar: Conversations List */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          {/* Search & Filters */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
              {[
                { key: 'all', label: 'All' },
                { key: 'lost_found_case', label: 'Lost & Found' },
                { key: 'foster_care', label: 'Foster' },
                { key: 'adoption', label: 'Adoption' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedFilter(tab.key)}
                  className={`px-2.5 py-1 rounded-lg font-semibold shrink-0 transition-colors ${
                    selectedFilter === tab.key
                      ? 'bg-[#1e6f42] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/60">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No conversations found.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const tc = TYPE_CONFIG[conv.type];
                const isSelected = activeConversation?._id === conv._id;

                return (
                  <button
                    key={conv._id}
                    onClick={() => handleSelectConv(conv._id)}
                    className={`w-full text-left p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isSelected ? 'bg-emerald-50/70 dark:bg-emerald-950/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${tc.bg} ${tc.color} flex items-center justify-center shrink-0`}>
                        {tc.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                            {conv.otherParticipant.name}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="rounded-full bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">
                          {conv.relatedId}
                        </p>

                        <p className="text-xs text-slate-600 dark:text-slate-300 truncate mt-1">
                          {conv.lastMessage}
                        </p>

                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Active Chat */}
        <div className="flex-1 flex flex-col border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${TYPE_CONFIG[activeConversation.type]?.bg} ${TYPE_CONFIG[activeConversation.type]?.color} flex items-center justify-center`}>
                    {TYPE_CONFIG[activeConversation.type]?.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                        {activeConversation.otherParticipant.name}
                      </h3>
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Circle className="h-2 w-2 fill-emerald-500" /> Online
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {TYPE_CONFIG[activeConversation.type]?.label} • {activeConversation.relatedId}
                    </p>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    Verified Channel
                  </span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-50/30 dark:bg-slate-950/20">
                {activeMessages.map((msg) => {
                  const isOwn = msg.sender.name === 'You' || msg.sender._id === currentUser?._id;

                  return (
                    <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-3.5 text-xs sm:text-sm shadow-xs ${
                          isOwn
                            ? 'bg-[#1e6f42] text-white rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-bl-xs'
                        }`}
                      >
                        {!isOwn && (
                          <p className="font-bold text-[10px] text-slate-400 dark:text-slate-400 mb-1">
                            {msg.sender.name}
                          </p>
                        )}

                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                        <div className={`flex items-center justify-end gap-1 text-[10px] mt-1.5 ${isOwn ? 'text-emerald-200' : 'text-slate-400'}`}>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input */}
              <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    className="flex-1 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Type a message or share information securely..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-[#1e6f42] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-800 transition-colors shadow-sm"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="h-12 w-12 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerMessages;
