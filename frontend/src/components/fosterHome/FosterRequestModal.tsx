import React, { useState } from 'react';
import { FosterItem } from '@/types/foster';
import {
  X,
  MapPin,
  Phone,
  Mail,
  User,
  Send,
  Heart,
  ShieldCheck,
  Stethoscope,
  Info,
  MessageSquare,
  FileText
} from 'lucide-react';

interface FosterRequestModalProps {
  request: FosterItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: FosterItem['status']) => void;
  onSendMessage: (id: string, text: string) => void;
}

export const FosterRequestModal: React.FC<FosterRequestModalProps> = ({
  request,
  isOpen,
  onClose,
  onStatusChange,
  onSendMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'medical' | 'messages'>('details');
  const [replyText, setReplyText] = useState('');

  if (!isOpen || !request) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSendMessage(request.id, replyText.trim());
    setReplyText('');
  };

  const getStatusBadge = (status: FosterItem['status']) => {
    switch (status) {
      case 'New':
        return <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">New Request</span>;
      case 'Under Review':
        return <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">Under Review</span>;
      case 'Accepted':
        return <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">Accepted</span>;
      case 'Rejected':
        return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 border border-red-200">Rejected</span>;
      case 'Completed':
        return <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">Completed</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden dark:bg-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-lg font-bold text-slate-800 dark:text-white">
                  Foster Request: <span className="text-emerald-700 dark:text-emerald-400">{request.petName}</span>
                </h3>
                {getStatusBadge(request.status)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Request ID: {request.id} • Submitted on {request.requestDate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition-all ${
              activeTab === 'details'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Info className="h-4 w-4" /> Overview & Pet Info
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition-all ${
              activeTab === 'medical'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Stethoscope className="h-4 w-4" /> Care & Medical Needs
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold transition-all ${
              activeTab === 'messages'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <MessageSquare className="h-4 w-4" /> Messages ({request.messages.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Pet Quick View Card */}
              <div className="flex flex-col sm:flex-row gap-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/40 p-4 border border-emerald-100/80 dark:from-emerald-950/20 dark:to-teal-950/10 dark:border-emerald-900/30">
                <img
                  src={request.image}
                  alt={request.petName}
                  className="h-32 w-32 rounded-2xl object-cover shadow-md border-2 border-white dark:border-slate-800 shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-slate-900 dark:text-white">{request.petName}</h4>
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-100/80 dark:bg-emerald-900/50 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
                        {request.durationDays} Days Needed
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                      {request.age} • {request.gender} • {request.breed} ({request.species})
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      {request.location}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {request.healthInfo.temperament.map((tag, i) => (
                      <span key={i} className="text-[11px] font-medium bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200/60 dark:border-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Foster Reason & Details */}
              <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Reason for Foster Request</h5>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{request.reason}</p>
              </div>

              {/* Requester Details */}
              <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Requester Information</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2.5">
                    <User className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Full Name</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{request.requesterName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Phone</span>
                      <a href={`tel:${request.requesterPhone}`} className="font-semibold text-emerald-700 hover:underline dark:text-emerald-400">{request.requesterPhone}</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Email</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{request.requesterEmail}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Address</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{request.requesterAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 p-3.5 dark:border-slate-800">
                  <ShieldCheck className={`h-6 w-6 ${request.healthInfo.vaccinated ? 'text-emerald-600' : 'text-amber-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Vaccination Status</p>
                    <p className="text-xs text-slate-500">{request.healthInfo.vaccinated ? 'Up to date' : 'Pending shots'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 p-3.5 dark:border-slate-800">
                  <Heart className={`h-6 w-6 ${request.healthInfo.neutered ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Spayed / Neutered</p>
                    <p className="text-xs text-slate-500">{request.healthInfo.neutered ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-emerald-600" /> Medical & Recovery Notes
                </h5>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-900/40">
                  {request.healthInfo.medicalNeeds}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 p-4 dark:border-slate-800">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Feeding & Diet Instructions</h5>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{request.healthInfo.diet}</p>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="flex flex-col h-[340px]">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {request.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
                    <p className="text-xs">No direct messages yet. Send a message below to reach the requester.</p>
                  </div>
                ) : (
                  request.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                          m.sender === 'user'
                            ? 'bg-emerald-700 text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-tl-none'
                        }`}
                      >
                        <p className="font-semibold text-[10px] opacity-80 mb-0.5">{m.senderName}</p>
                        <p>{m.text}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSend} className="mt-4 flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <input
                  type="text"
                  placeholder="Type a message to the requester..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" /> Send
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Update Status:</span>
            <button
              onClick={() => onStatusChange(request.id, 'Under Review')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                request.status === 'Under Review'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              Under Review
            </button>
            <button
              onClick={() => onStatusChange(request.id, 'Accepted')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                request.status === 'Accepted'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
              }`}
            >
              Accept
            </button>
            <button
              onClick={() => onStatusChange(request.id, 'Rejected')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                request.status === 'Rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-950/40 dark:text-red-300'
              }`}
            >
              Decline
            </button>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
