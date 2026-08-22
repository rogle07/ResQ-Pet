import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import { DonationRecord } from '@/types/foster';

interface ReceiptModalProps {
  record: DonationRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ record, isOpen, onClose }) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl overflow-hidden dark:bg-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h3 className="font-display font-bold text-slate-800 dark:text-white">Official 80G Tax Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Receipt Paper */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 dark:border-slate-700 dark:bg-slate-800/40 text-xs">
            {/* Header Org Info */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-base dark:text-emerald-400">
                  <Heart className="h-4 w-4" fill="currentColor" /> ResQPet Animal Welfare Society
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Reg. No: UTT/NGO/2026/0942 | Section 80G Tax Exempted</p>
                <p className="text-[10px] text-slate-500">Mall Road, Nainital, Uttarakhand - 263001</p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {record.status}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">{record.receiptNumber}</p>
              </div>
            </div>

            {/* Receipt Details Table */}
            <div className="py-4 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Date of Donation:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Donor Name:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.donorEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purpose / Category:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.forCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Plan Type:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Mode:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{record.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">80G Exemption Code:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{record.taxExemptNumber || '80G-AACTP2026RQP'}</span>
              </div>
            </div>

            {/* Amount Banner */}
            <div className="flex items-center justify-between rounded-2xl bg-emerald-600 p-4 text-white shadow-md">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold opacity-90">Total Contribution</p>
                <p className="text-xl font-black">₹{record.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="h-4 w-4" /> Paid & Verified
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-4 italic">
              This is a computer-generated official receipt for eligible 50% deduction under Section 80G of the Income Tax Act, 1961.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-white px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 dark:bg-slate-800 dark:border-emerald-700 dark:text-emerald-300 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};
