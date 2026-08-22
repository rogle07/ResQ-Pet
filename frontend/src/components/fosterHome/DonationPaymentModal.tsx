import React, { useState } from 'react';
import { X, QrCode, CreditCard, Landmark, CheckCircle2, Lock, Heart } from 'lucide-react';
import { DonationRecord } from '@/types/foster';

interface DonationPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  category: DonationRecord['forCategory'];
  type: DonationRecord['type'];
  onSuccess: (record: DonationRecord) => void;
}

export const DonationPaymentModal: React.FC<DonationPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  category,
  type,
  onSuccess,
}) => {
  const [method, setMethod] = useState<'UPI' | 'Card' | 'Net Banking'>('UPI');
  const [donorName, setDonorName] = useState('Rahul Khanna');
  const [donorEmail, setDonorEmail] = useState('rahul.k@example.com');
  const [upiId, setUpiId] = useState('rahul@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [generatedRecord, setGeneratedRecord] = useState<DonationRecord | null>(null);

  if (!isOpen) return null;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const receiptNumber = `#RQP${Math.floor(1000 + Math.random() * 9000)}`;
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      const newRecord: DonationRecord = {
        id: `DN-${Date.now()}`,
        receiptNumber,
        date: dateStr,
        forCategory: category,
        type: type,
        amount: amount || 1000,
        paymentMethod: method,
        status: 'Success',
        donorName: donorName || 'Kind Animal Lover',
        donorEmail: donorEmail || 'donor@example.com',
        taxExemptNumber: '80G-AACTP2026RQP',
      };

      setGeneratedRecord(newRecord);
      setIsProcessing(false);
      setIsComplete(true);
      onSuccess(newRecord);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl bg-white shadow-2xl overflow-hidden dark:bg-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-emerald-600" />
            <h3 className="font-display font-bold text-slate-800 dark:text-white">Secure Animal Donation</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {!isComplete ? (
          <form onSubmit={handlePay} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Amount Banner */}
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4 border border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-900/50">
              <div>
                <p className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">Donating To</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">{category}</p>
                <p className="text-[10px] text-slate-500">Plan: {type}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">Total Amount</p>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">₹{amount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Donor info */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Donor Name</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email for 80G Receipt</label>
                <input
                  type="email"
                  required
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('UPI')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                    method === 'UPI'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  <QrCode className="h-5 w-5 mb-1 text-emerald-600" />
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('Card')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                    method === 'Card'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  <CreditCard className="h-5 w-5 mb-1 text-emerald-600" />
                  Debit / Card
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('Net Banking')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all ${
                    method === 'Net Banking'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Landmark className="h-5 w-5 mb-1 text-emerald-600" />
                  Net Banking
                </button>
              </div>
            </div>

            {/* Method Inputs */}
            {method === 'UPI' && (
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 text-center space-y-2">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl bg-white p-2 shadow-inner border dark:bg-slate-900 dark:border-slate-700">
                  <QrCode className="h-20 w-20 text-slate-800 dark:text-slate-200" />
                </div>
                <p className="text-[11px] text-slate-500">Scan using any UPI App (GPay, PhonePe, Paytm)</p>
                <div className="text-left mt-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Or UPI ID / VPA</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full mt-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>
            )}

            {method === 'Card' && (
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">Expiry (MM/YY)</label>
                    <input type="text" defaultValue="08/29" className="w-full rounded-xl border border-slate-200 px-3.5 py-2 dark:border-slate-700 dark:bg-slate-800" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">CVV</label>
                    <input type="password" defaultValue="•••" maxLength={3} className="w-full rounded-xl border border-slate-200 px-3.5 py-2 dark:border-slate-700 dark:bg-slate-800" />
                  </div>
                </div>
              </div>
            )}

            {method === 'Net Banking' && (
              <div className="space-y-2 text-xs">
                <label className="block font-semibold text-slate-600 dark:text-slate-300">Select Bank</label>
                <select className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-800">
                  <option>State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Punjab National Bank</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/20 hover:bg-emerald-800 transition-all disabled:opacity-60"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">Processing Donation...</span>
              ) : (
                <>
                  <Heart className="h-4 w-4" fill="currentColor" /> Pay ₹{amount.toLocaleString('en-IN')} Securely
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="p-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">Donation Successful!</h4>
              <p className="text-xs text-slate-500 mt-1">Receipt ID: {generatedRecord?.receiptNumber}</p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40">
              Thank you for contributing ₹{amount.toLocaleString('en-IN')} to our animal rescue mission. An official 80G tax receipt has been generated.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white hover:bg-emerald-800 transition-colors"
            >
              Done & View History
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
