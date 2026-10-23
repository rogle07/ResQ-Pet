import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Send,
  Bot,
  User,
  Sparkles,
  PawPrint,
  Heart,
  Home,
  AlertTriangle,
  Building2,
  MapPin,
  Cpu,
  DollarSign,
  Settings,
  RefreshCw,
  Lightbulb,
  MessageSquare,
} from 'lucide-react';

/* ── Types ──────────────────────────────────────────────────────────── */
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

/* ── Knowledge Base ─────────────────────────────────────────────────── */
const GREETING = `Hi there! 👋 I'm **PawBot**, your ResQ-Pet AI assistant.

I can help you understand everything available in your Owner Portal. Here are a few things you can ask me:

- 🐾 How do I add or manage my pets?
- 🏠 How does Foster Care work?
- ❤️ How can I put my pet up for adoption?
- 🚨 How do I request an emergency rescue?
- 📍 How does pet tracking work?
- 🌐 What is the IoT collar?
- 💰 How do donations work?
- 🏢 What is NGO Shelter Care?

What would you like to know?`;

const KNOWLEDGE_BASE: Array<{ keywords: string[]; response: string }> = [
  {
    keywords: ['hello', 'hi', 'hey', 'start', 'help', 'what can', 'what do', 'options', 'menu'],
    response: `Welcome to ResQ-Pet! 🐾 Here's a quick overview of everything you can do as a Pet Owner:

**🐾 My Pets** – Add, edit, view, and manage all your registered pets with full profiles including photos, breed, medical records, and vaccination history.

**🏠 Foster Care** – Request a trusted foster home for your pet temporarily while you travel, move, or face a personal situation.

**❤️ Adoption** – List your pet for adoption, review applicant profiles, conduct interviews, and find the perfect forever home.

**🏢 NGO Shelter Care** – Submit a request to a verified NGO shelter for longer-term professional pet care.

**🚨 Rescue Request** – Emergency 24/7 rescue dispatch for pets in immediate danger, accidents, or distress.

**📍 Pet Tracking** – Real-time GPS tracking of your pet via IoT collar data.

**🌐 IoT Collar** – Smart sensor collar providing live health vitals, temperature, heart rate, and location.

**💰 Donations** – Support pet welfare NGOs, rescue teams, and shelters.

**⚙️ Settings** – Manage your account, notification preferences, and privacy settings.

What would you like to explore first?`,
  },
  {
    keywords: ['pet', 'my pets', 'add pet', 'register pet', 'manage pet', 'pet profile', 'pets'],
    response: `**🐾 Managing Your Pets**

In the **My Pets** section you can:

✅ **Add a new pet** – Register your pet with name, species, breed, age, weight, and photos.
✅ **View pet profiles** – See full medical history, vaccination records, and health notes.
✅ **Edit pet info** – Update details like weight, age, or add new photos anytime.
✅ **Upload medical records** – Keep vet records digitally organized per pet.
✅ **Link IoT Collar** – Associate an activated smart collar with your pet for live health tracking.

👉 **Go to:** [My Pets →](/owner/pets)

Want to know more about any specific feature?`,
  },
  {
    keywords: ['foster', 'foster care', 'temporary', 'travel', 'moving', 'foster home', 'temporary home'],
    response: `**🏠 Foster Care**

Foster Care allows you to place your pet in a safe, verified foster home for a temporary period — perfect if you're:

- ✈️ Travelling for work or vacation
- 🏥 Going through a medical procedure
- 🏠 In the middle of moving homes

**How it works:**
1. Go to **Foster Care** in your sidebar
2. Submit a foster request with dates and your pet's needs
3. Browse available foster homes (verified & reviewed)
4. The foster home accepts your request
5. Arrange pickup/drop-off
6. Track your pet's daily updates from the foster home

**What you'll see:**
- 🗓️ Your active & past foster requests
- 📋 Foster home profiles with ratings & reviews
- 📩 Direct messaging with the foster family
- 📸 Daily photo updates

👉 **Go to:** [Foster Care →](/owner/foster)`,
  },
  {
    keywords: ['adopt', 'adoption', 'give away', 'list for adoption', 'find home', 'rehome'],
    response: `**❤️ Adoption Portal**

If you need to find a loving permanent home for your pet:

**As a Pet Owner listing for adoption:**
1. Navigate to **Adoption** in the sidebar
2. Create an adoption listing with your pet's profile and requirements
3. Review incoming adoption applications from potential adopters
4. Chat with applicants, conduct virtual interviews
5. Approve your preferred adopter
6. Complete the handover with a digital adoption agreement

**Features:**
- 📋 Detailed adopter screening (family situation, home type, experience)
- 💬 In-app messaging with applicants
- 📊 Application tracking dashboard
- ✅ Safe, verified handover process

👉 **Go to:** [Adoption →](/owner/adoption)`,
  },
  {
    keywords: ['rescue', 'emergency', 'urgent', 'danger', 'injured', 'accident', 'distress', 'rescue request', 'help my pet', 'sos'],
    response: `**🚨 Emergency Rescue Request**

For urgent situations involving your pet or a stray animal you've found:

**When to use this:**
- 🚗 Pet injured in an accident
- 🪤 Pet trapped or stuck
- 🐕 Stray animal in immediate danger
- 🏥 Pet needs emergency veterinary transport

**How to request rescue:**
1. Go to **Rescue** in your sidebar
2. Fill in the emergency details (location, situation, pet description)
3. A rescue team gets dispatched immediately (24/7)
4. Real-time tracking of rescue team arrival
5. Status updates via notifications

⚡ **Average response time: Under 15 minutes** in active coverage zones.

📞 You can also call: **1800-RESQPET**

👉 **Go to:** [Rescue Request →](/owner/rescue)`,
  },
  {
    keywords: ['ngo', 'shelter', 'ngo shelter', 'sanctuary', 'long term', 'shelter care', 'organization'],
    response: `**🏢 NGO Shelter Care**

When you need professional long-term care for your pet at a verified NGO shelter:

**Use this if you:**
- Need care beyond what a foster home can provide
- Are relocating abroad and can't take your pet
- Need medical or rehabilitation support for your pet

**How it works:**
1. Go to **NGO Shelter** in your sidebar
2. Browse verified NGO shelters in your area with ratings & capacity info
3. Submit a placement request with your pet's details and reason
4. NGO reviews and confirms placement
5. Schedule a drop-off with the NGO team

**What you get:**
- 🏥 Professional animal care staff
- 🍽️ Regular feeding & health monitoring
- 🛁 Grooming & medical care
- 📸 Weekly updates on your pet

👉 **Go to:** [NGO Shelter →](/owner/ngo-shelter)`,
  },
  {
    keywords: ['track', 'tracking', 'gps', 'location', 'where is my pet', 'live location', 'find my pet'],
    response: `**📍 Pet Tracking**

Real-time GPS location tracking for your pet using the IoT Smart Collar:

**Features:**
- 🗺️ **Live Map View** – See your pet's exact location on an interactive map
- 📍 **Location History** – View movement trails for the past 24 hours
- 🔔 **Geo-fence Alerts** – Get notified when your pet leaves a defined safe zone
- ⚡ **Real-time Updates** – Location refreshes every 30 seconds

**Requirements:**
- Your pet must have an **active IoT Collar** connected to your account
- Collar must have sufficient battery (>20%)

👉 **Go to:** [Pet Tracking →](/owner/tracking)

Need help with the IoT collar? Just ask me!`,
  },
  {
    keywords: ['iot', 'collar', 'smart collar', 'sensor', 'health monitor', 'vitals', 'heart rate', 'temperature', 'device'],
    response: `**🌐 IoT Smart Collar**

The ResQ-Pet Smart Collar is a next-generation wearable pet health monitor:

**Real-time Metrics:**
- ❤️ **Heart Rate** – Continuous monitoring with alerts for abnormal rates
- 🌡️ **Body Temperature** – Fever detection & heat stress alerts
- 🏃 **Activity Level** – Steps, movement patterns, sleep quality
- 📍 **GPS Location** – Live location tracking
- 🔋 **Battery Level** – Low battery alerts

**How to set up:**
1. Purchase the IoT Collar from the IoT section
2. Activate it by entering the collar ID
3. Link it to your pet in **My Pets**
4. All data streams live to your dashboard

**Alerts you'll receive:**
- Temperature too high or low
- Heart rate anomaly detected
- Pet left safe zone
- Collar battery low

👉 **Go to:** [IoT Collar →](/owner/iot)`,
  },
  {
    keywords: ['donation', 'donate', 'fund', 'support', 'contribute', 'money', 'charity', 'campaign'],
    response: `**💰 Donations & Campaigns**

Support the ResQ-Pet ecosystem and help animals in need:

**What you can donate to:**
- 🏢 **NGO Shelters** – Fund daily operations, food, and medical supplies
- 🚨 **Rescue Teams** – Support equipment, vehicles, and emergency funds
- 🏥 **Veterinary Care** – Sponsor treatments for injured strays
- 📚 **Awareness Campaigns** – Fund educational programs

**Donation Features:**
- 💳 Multiple payment methods (UPI, cards, net banking)
- 🧾 Automatic tax receipts (80G eligible)
- 📊 Impact tracking – see exactly how your money was used
- 🔁 Set up recurring monthly donations
- 🏆 Donor badges and recognition on leaderboard

👉 **Go to:** [Donations →](/owner/donations)`,
  },
  {
    keywords: ['settings', 'account', 'profile', 'password', 'notification', 'privacy', 'email', 'phone'],
    response: `**⚙️ Settings & Account**

Manage your ResQ-Pet account preferences:

**Account Settings:**
- 👤 Edit your name, email, phone number
- 🔐 Change your password
- 🖼️ Update your profile photo
- 🌍 Set your city/location for local services

**Notification Preferences:**
- 🔔 Rescue request updates
- 📩 Foster care messages
- 🐾 Collar health alerts
- 💰 Donation receipts
- 📋 Adoption application updates

**Dark/Light Mode:**
- Toggle the theme using the sun/moon icon at the top of the sidebar

👉 **Go to:** [Settings →](/owner/settings)`,
  },
  {
    keywords: ['found pet', 'stray', 'found animal', 'lost animal', 'report found', 'found dog', 'found cat'],
    response: `**🔍 Found Pets**

If you've found a stray or lost animal:

1. Go to **Found Pets** in your sidebar or report at */finder/report*
2. Submit a detailed report with:
   - 📍 Location where you found it
   - 📸 Photo of the animal
   - 🐾 Description (species, color, markings)
   - 🏥 Current health condition
3. The system checks if any owner has reported that pet missing
4. Rescue team is notified to pick up if needed
5. The pet is logged in the system for owner matching

**As an Owner looking for a lost pet:**
- Check the **Found Pets** section in your owner dashboard

👉 **Go to:** [Found Pets →](/owner/found-pets)`,
  },
  {
    keywords: ['dashboard', 'overview', 'home', 'main page', 'summary'],
    response: `**🏠 Owner Dashboard Overview**

Your main dashboard gives you a bird's-eye view of everything:

**Quick Stats Panel:**
- 🐾 Number of registered pets
- 🔔 Pending notifications & alerts
- 📋 Active foster/rescue requests
- 💰 Recent donation activity

**Service Cards:**
Quick-access buttons to launch the 4 core services:
1. 🏠 Foster Care Request
2. ❤️ Adoption Listing
3. 🏢 NGO Shelter Care
4. 🚨 Rescue Request

**IoT Widget:**
- Live collar status of your pet
- Current heart rate, temperature, battery

👉 **Go to:** [Dashboard →](/owner)`,
  },
  {
    keywords: ['payment', 'pay', 'upi', 'card', 'cost', 'price', 'fee', 'charge'],
    response: `**💳 Payments & Fees**

**Free Services:**
✅ Pet profile registration
✅ Foster care requests
✅ Rescue request dispatch
✅ NGO shelter placement
✅ Pet tracking (with collar)
✅ AI Assistant (that's me! 😊)

**Paid Features:**
💰 **IoT Smart Collar** – One-time hardware purchase
💰 **Donations** – Voluntary, any amount you choose

**Payment Methods Accepted:**
- 💳 Credit / Debit Cards (Visa, Mastercard, RuPay)
- 📱 UPI (GPay, PhonePe, Paytm, BHIM)
- 🏦 Net Banking

All payments are secured via **Razorpay** with 256-bit SSL encryption.

Donation receipts are automatically emailed for tax purposes.`,
  },
  {
    keywords: ['contact', 'support', 'helpline', 'call', 'email support', 'phone number', 'reach', 'customer care'],
    response: `**📞 Contact & Support**

**Emergency Helpline:**
🚨 **1800-RESQPET** (1800-737-7738) – 24/7 for rescue emergencies

**General Support:**
📧 **support@resqpet.in**
📞 **+91 11 4567 8900** (Mon–Sat, 9 AM – 6 PM)

**WhatsApp Support:**
📲 **+91 98765 43210**

For rescue emergencies, always use the in-app Rescue Request for fastest response — it directly notifies the nearest available team.

I'm also here 24/7 to help with any questions! What else can I assist you with?`,
  },
];

const FALLBACK = `I'm not sure I fully understood that. Let me suggest some things I can help you with:

🐾 **Pet Management** – Adding, editing, managing pet profiles
🏠 **Foster Care** – How to request temporary foster placement
❤️ **Adoption** – How to list your pet for adoption
🚨 **Rescue** – Emergency rescue request process
🏢 **NGO Shelter** – Long-term professional shelter care
📍 **Tracking** – GPS & live location tracking
🌐 **IoT Collar** – Smart health monitoring device
💰 **Donations** – How to support animal welfare
⚙️ **Settings** – Account & notification management

Feel free to ask anything about the ResQ-Pet owner portal!`;

function getAIResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.response;
    }
  }
  return FALLBACK;
}

/* ── Markdown renderer ──────────────────────────────────────────────── */
function RenderMarkdown({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => {
        if (line.trim() === '') return <div key={i} className="h-1.5" />;

        // Parse bold and links inline
        const parseLine = (raw: string): React.ReactNode => {
          const parts: React.ReactNode[] = [];
          let remaining = raw;
          let key = 0;

          while (remaining.length > 0) {
            const boldIdx = remaining.indexOf('**');
            const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

            const boldPos = boldIdx >= 0 ? boldIdx : Infinity;
            const linkPos = linkMatch?.index !== undefined ? linkMatch.index : Infinity;

            if (boldPos === Infinity && linkPos === Infinity) {
              parts.push(<span key={key++}>{remaining}</span>);
              break;
            }

            if (boldPos <= linkPos) {
              if (boldPos > 0) parts.push(<span key={key++}>{remaining.slice(0, boldPos)}</span>);
              const endBold = remaining.indexOf('**', boldPos + 2);
              if (endBold === -1) {
                parts.push(<span key={key++}>{remaining}</span>);
                break;
              }
              parts.push(<strong key={key++} className="font-bold">{remaining.slice(boldPos + 2, endBold)}</strong>);
              remaining = remaining.slice(endBold + 2);
            } else {
              if (linkPos > 0) parts.push(<span key={key++}>{remaining.slice(0, linkPos)}</span>);
              parts.push(
                <Link
                  key={key++}
                  to={linkMatch![2]}
                  className="text-purple-600 dark:text-purple-400 underline underline-offset-2 font-semibold hover:text-purple-800 dark:hover:text-purple-300"
                >
                  {linkMatch![1]}
                </Link>
              );
              remaining = remaining.slice(linkPos + linkMatch![0].length);
            }
          }
          return <>{parts}</>;
        };

        // Check if line looks like a list item or emoji bullet
        const isListLike = /^[-✅🐾🏠❤️🚨🏢📍🌐💰⚙️📋📞📧📲⚡🗺️🔔💳🏥🌡️🏃🔋📶🍽️🛁📸🗓️👤🔐🖼️🌍👁️🔒🧾🔁🏆🪤🚗🌊✈️🔍\d]/.test(line);

        if (isListLike && !line.startsWith('**')) {
          return (
            <div key={i} className="flex gap-1.5 my-0.5 text-slate-700 dark:text-slate-300 text-xs">
              <span className="flex-shrink-0">{line.startsWith('- ') ? '•' : ''}</span>
              <span className="leading-relaxed">{parseLine(line.replace(/^- /, ''))}</span>
            </div>
          );
        }

        if (line.startsWith('**') && line.endsWith('**') && line.length > 4) {
          return (
            <p key={i} className="font-bold text-slate-800 dark:text-slate-100 mt-2 mb-1 text-xs">
              {parseLine(line)}
            </p>
          );
        }

        return (
          <p key={i} className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
            {parseLine(line)}
          </p>
        );
      })}
    </>
  );
}

/* ── Typing Indicator ────────────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-md">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-none bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

/* ── Message Bubble ─────────────────────────────────────────────────── */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const timeStr = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl shadow-md ${
          isUser ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-purple-600 to-indigo-600'
        }`}
      >
        {isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
      </div>
      <div className={`max-w-[82%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 shadow-sm ${
            isUser
              ? 'rounded-2xl rounded-br-none bg-gradient-to-br from-purple-600 to-purple-700 text-white text-xs leading-relaxed'
              : 'rounded-2xl rounded-bl-none bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700'
          }`}
        >
          {isUser ? (
            <span className="text-xs">{message.text}</span>
          ) : (
            <div className="space-y-0.5">
              <RenderMarkdown text={message.text} />
            </div>
          )}
        </div>
        <span className={`text-[10px] text-slate-400 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {timeStr}
        </span>
      </div>
    </div>
  );
}

/* ── Quick Chips ────────────────────────────────────────────────────── */
const QUICK_CHIPS = [
  { label: 'My Pets', icon: <PawPrint className="h-3 w-3" /> },
  { label: 'Foster Care', icon: <Home className="h-3 w-3" /> },
  { label: 'Adoption', icon: <Heart className="h-3 w-3" /> },
  { label: 'Rescue Request', icon: <AlertTriangle className="h-3 w-3" /> },
  { label: 'IoT Collar', icon: <Cpu className="h-3 w-3" /> },
  { label: 'NGO Shelter', icon: <Building2 className="h-3 w-3" /> },
  { label: 'Pet Tracking', icon: <MapPin className="h-3 w-3" /> },
  { label: 'Donations', icon: <DollarSign className="h-3 w-3" /> },
  { label: 'Settings', icon: <Settings className="h-3 w-3" /> },
];

const SIDEBAR_TOPICS = [
  { icon: <PawPrint className="h-3.5 w-3.5" />, label: 'My Pets', desc: 'Pet profiles & records' },
  { icon: <Home className="h-3.5 w-3.5" />, label: 'Foster Care', desc: 'Temporary placements' },
  { icon: <Heart className="h-3.5 w-3.5" />, label: 'Adoption', desc: 'Rehoming & listings' },
  { icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'Rescue', desc: '24/7 emergency dispatch' },
  { icon: <Building2 className="h-3.5 w-3.5" />, label: 'NGO Shelter', desc: 'Long-term shelter care' },
  { icon: <MapPin className="h-3.5 w-3.5" />, label: 'Pet Tracking', desc: 'Live GPS location' },
  { icon: <Cpu className="h-3.5 w-3.5" />, label: 'IoT Collar', desc: 'Smart health monitor' },
  { icon: <DollarSign className="h-3.5 w-3.5" />, label: 'Donations', desc: 'Support campaigns' },
  { icon: <Settings className="h-3.5 w-3.5" />, label: 'Settings', desc: 'Account & preferences' },
];

/* ── Main Component ──────────────────────────────────────────────────── */
const OwnerMessages: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', text: GREETING, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmed,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      const aiResponse = getAIResponse(trimmed);
      const delay = Math.min(600 + aiResponse.length * 0.4, 1800);
      await new Promise((res) => setTimeout(res, delay));

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, role: 'assistant', text: aiResponse, timestamp: new Date() },
      ]);
    },
    [isTyping]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleChip = (label: string) => sendMessage(`Tell me about ${label}`);

  const handleReset = () => {
    setMessages([{ id: `welcome-${Date.now()}`, role: 'assistant', text: GREETING, timestamp: new Date() }]);
    setInput('');
    setIsTyping(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-h-[900px] font-sans">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/owner" className="hover:text-purple-700 dark:hover:text-purple-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-purple-800 dark:text-purple-400">AI Assistant</span>
        </div>
        <div className="mt-1 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              PawBot AI Assistant
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ask anything about ResQ-Pet — your 24/7 intelligent guide to the owner portal
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-purple-400 hover:text-purple-700 dark:hover:text-purple-400 transition-all shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            New Chat
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex flex-1 gap-4 min-h-0">
        {/* Main Chat Area */}
        <div className="flex flex-col flex-1 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden min-h-0">
          {/* Chat Header */}
          <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 shadow-md">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">PawBot</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Online · ResQ-Pet AI · Always available
              </p>
            </div>
            <div className="ml-auto">
              <div className="flex items-center gap-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 px-3 py-1.5 text-[11px] font-bold text-purple-700 dark:text-purple-300">
                <Sparkles className="h-3 w-3" />
                AI Powered
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips */}
          <div className="flex-shrink-0 px-5 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-x-auto">
            <div className="flex gap-2 flex-nowrap pb-1">
              <span className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0 mr-1">
                <Lightbulb className="h-3 w-3" />
                Quick ask:
              </span>
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => handleChip(chip.label)}
                  disabled={isTyping}
                  className="flex-shrink-0 flex items-center gap-1.5 rounded-full border border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:border-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {chip.icon}
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="flex-shrink-0 flex gap-2 p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about ResQ-Pet…"
              disabled={isTyping}
              className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-[42px] w-[42px] items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md hover:shadow-purple-300/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Sidebar (desktop only) */}
        <div className="hidden lg:flex flex-col w-64 gap-3 flex-shrink-0">
          {/* About */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">About PawBot</p>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              PawBot is your intelligent ResQ-Pet guide. Ask about any feature, get step-by-step instructions, or explore what the owner portal can do for you and your pet.
            </p>
          </div>

          {/* Topics */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 flex-1 overflow-y-auto">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-purple-500" />
              Topics I Know About
            </p>
            <div className="space-y-1">
              {SIDEBAR_TOPICS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleChip(item.label)}
                  disabled={isTyping}
                  className="w-full flex items-center gap-2.5 rounded-xl p-2 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-purple-600 dark:text-purple-400 flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-400">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerMessages;
