import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  MessageSquare,
  Send,
} from 'lucide-react';

interface DonorMessageItem {
  id: string;
  sender: string;
  role: string;
  organization: string;
  text: string;
  timestamp: string;
  avatar: string;
}

const INITIAL_DONOR_MESSAGES: DonorMessageItem[] = [
  {
    id: 'MSG-101',
    sender: 'Dr. Neha Verma (Chief Vet)',
    role: 'Veterinarian',
    organization: 'Jeev Aashraya Animal Hospital, Lucknow',
    text: 'Dear Rahul, your donation towards the Emergency Medical Fund directly funded the leg surgery and pain relief meds for Bruno the street pup. He is now standing and playing! Thank you for giving him a second chance at life.',
    timestamp: 'Today at 11:30 AM',
    avatar: '/animal-dog.jpg',
  },
  {
    id: 'MSG-102',
    sender: 'Vikram Singh (Rescue Team Lead)',
    role: 'Field Rescue',
    organization: 'Rapid Rescue Squad Unit 4',
    text: 'Hello Rahul! Because of patrons like you, our Lucknow night ambulance was fully refueled and restocked with new trauma splints and oxygen masks this week. We successfully rescued 6 animals last night.',
    timestamp: 'Yesterday at 04:15 PM',
    avatar: '/bird.jpg',
  },
];

export const DonorMessages: React.FC = () => {
  const [messages, setMessages] = useState(INITIAL_DONOR_MESSAGES);
  const [replyText, setReplyText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg: DonorMessageItem = {
      id: `MSG-${Date.now()}`,
      sender: 'Rahul Sharma (You)',
      role: 'Kind Donor',
      organization: 'ResQPet Patron Community',
      text: replyText,
      timestamp: 'Just now',
      avatar: '/buddy-puppy.jpg',
    };

    setMessages((prev) => [...prev, newMsg]);
    setReplyText('');
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-xs">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/donor" className="hover:text-purple-700">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-purple-800 dark:text-purple-400">Messages</span>
        </div>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          Shelter & Rescue Team Updates <MessageSquare className="h-6 w-6 text-purple-600" />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Direct heartfelt thank-you notes and recovery logs from the medical units you support.
        </p>
      </div>

      {/* Messages Feed */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-2xl border ${
                m.sender.includes('You')
                  ? 'border-purple-200 bg-purple-50/50 ml-12 dark:border-purple-900 dark:bg-purple-950/30'
                  : 'border-slate-100 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40'
              } space-y-2`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={m.avatar} alt={m.sender} className="h-9 w-9 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{m.sender}</h4>
                    <span className="text-[10px] text-slate-400">{m.organization}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">{m.timestamp}</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed pl-11">
                {m.text}
              </p>
            </div>
          ))}
        </div>

        {/* Reply Input */}
        <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <input
            type="text"
            placeholder="Send an encouraging message to the rescue squad..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 focus:border-purple-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-purple-700 px-5 py-2.5 font-bold text-white hover:bg-purple-800 shadow-md shadow-purple-950/20"
          >
            <Send className="h-3.5 w-3.5" /> Send
          </button>
        </form>
      </div>
    </div>
  );
};
export default DonorMessages;
