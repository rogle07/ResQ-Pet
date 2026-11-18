import { useState, useEffect, type FC } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  Heart,
  Smartphone,
  Info,
} from 'lucide-react';
export interface DonationSuccessDetails {
  amount: number;
  paymentId: string;
  orderId?: string;
}

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  upiId?: string;
  merchantName?: string;
  onPaymentSuccess?: (details: DonationSuccessDetails) => void;
}

export const DonationModal: FC<DonationModalProps> = ({
  isOpen,
  onClose,
  amount,
  upiId = 'ykumar778899@okaxis',
  merchantName = 'ROGLE',
  onPaymentSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [dynamicQrUrl, setDynamicQrUrl] = useState('');
  const [showStandee, setShowStandee] = useState(false);

  // Generate the standard UPI payment URI with pre-filled amount
  const upiUri = `upi://pay?ver=01&mode=19&pa=${upiId}&pn=${encodeURIComponent(
    merchantName
  )}&tr=RZPU1ZN7yYJyzzWNmqrv2&cu=INR&mc=5732&qrMedium=04&tn=ResQPet%20Donation&am=${amount}`;

  // Generate dynamic QR code data URL whenever amount or upiUri changes
  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(upiUri, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 500,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((url) => setDynamicQrUrl(url))
      .catch((err) => console.error('Failed to generate QR:', err));
  }, [isOpen, upiUri]);

  if (!isOpen) return null;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyUpiLink = () => {
    navigator.clipboard.writeText(upiUri);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenUpiApp = (appScheme?: string) => {
    let target = upiUri;
    if (appScheme === 'gpay') {
      target = `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(
        merchantName
      )}&am=${amount}&cu=INR&tn=ResQPet%20Donation`;
    } else if (appScheme === 'phonepe') {
      target = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(
        merchantName
      )}&am=${amount}&cu=INR&tn=ResQPet%20Donation`;
    } else if (appScheme === 'paytm') {
      target = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(
        merchantName
      )}&am=${amount}&cu=INR&tn=ResQPet%20Donation`;
    }
    window.location.href = target;
  };

  const handleCompletedPayment = () => {
    const generatedId = `UPI-${Date.now().toString().slice(-8)}`;
    if (onPaymentSuccess) {
      onPaymentSuccess({
        amount,
        paymentId: generatedId,
        orderId: `ORD-${Date.now().toString().slice(-6)}`,
      });
    }
    onClose();
  };

  const qrToDownload = showStandee ? '/gpay-donation-qr.jpg' : dynamicQrUrl || '/gpay-donation-qr.jpg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl overflow-hidden dark:bg-slate-900 dark:text-slate-100 border border-emerald-500/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-white px-6 py-4 dark:border-slate-800 dark:from-emerald-950/40 dark:via-slate-800/60 dark:to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[#1e6f42] flex items-center justify-center text-white shadow-sm">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                Donate ₹{amount} to {merchantName}
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  Verified UPI
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                100% directly supports rescue care, food & medical treatment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Amount Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Contribution Amount
              </p>
              <p className="text-2xl font-black text-[#1e6f42] dark:text-emerald-400">
                ₹{amount}
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Secure UPI Payment
              </span>
              <p className="text-[10px] text-slate-500 font-mono">
                Merchant: {merchantName}
              </p>
            </div>
          </div>

          {/* QR Display Card */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-[#1e6f42]" />
                {showStandee ? 'Official GPay Standee QR' : `Dynamic QR for exact ₹${amount}`}
              </span>
              <button
                type="button"
                onClick={() => setShowStandee(!showStandee)}
                className="text-[11px] text-[#1e6f42] dark:text-emerald-400 hover:underline font-bold"
              >
                {showStandee ? 'Show Dynamic QR' : 'Show Standee View'}
              </button>
            </div>

            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              {showStandee ? (
                <img
                  src="/gpay-donation-qr.jpg"
                  alt="GPay ROGLE Standee"
                  className="h-56 w-auto object-contain rounded-lg"
                />
              ) : dynamicQrUrl ? (
                <img
                  src={dynamicQrUrl}
                  alt={`UPI QR code for ₹${amount}`}
                  className="h-52 w-52 object-contain"
                />
              ) : (
                <div className="h-52 w-52 flex items-center justify-center text-xs text-slate-400 font-mono">
                  Generating QR code…
                </div>
              )}
            </div>

            <p className="text-center text-xs text-slate-600 dark:text-slate-300 max-w-xs">
              Open <strong>Google Pay</strong>, <strong>PhonePe</strong>, or <strong>Paytm</strong> on your phone and scan this QR to pay ₹{amount}.
            </p>

            <div className="flex items-center gap-2">
              <a
                href={qrToDownload}
                download={`ROGLE_ResQPet_₹${amount}_Donation_QR.png`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold shadow-sm transition"
              >
                <Download className="h-3.5 w-3.5 text-[#1e6f42]" />
                Save QR Image
              </a>
            </div>
          </div>

          {/* Quick Pay Buttons (Native Mobile App Launch or Deep Links) */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Direct Tap to Pay (Mobile Apps):
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleOpenUpiApp('gpay')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Smartphone className="h-3.5 w-3.5 text-blue-500" />
                Google Pay
              </button>
              <button
                type="button"
                onClick={() => handleOpenUpiApp('phonepe')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Smartphone className="h-3.5 w-3.5 text-purple-600" />
                PhonePe
              </button>
              <button
                type="button"
                onClick={() => handleOpenUpiApp('paytm')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-xs font-bold shadow-sm transition active:scale-95"
              >
                <Smartphone className="h-3.5 w-3.5 text-cyan-600" />
                Paytm
              </button>
              <button
                type="button"
                onClick={() => handleOpenUpiApp()}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-[#1e6f42] hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Any UPI App
              </button>
            </div>
          </div>

          {/* UPI ID & Copy Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                Official UPI ID:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {upiId}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyUpiId}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">UPI ID Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                    <span>Copy UPI ID ({upiId})</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCopyUpiLink}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">UPI Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                    <span>Copy Full UPI URI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Confirmation button after paying via UPI */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleCompletedPayment}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-[0.98]"
            >
              <Check className="h-4 w-4" />
              <span>I Have Paid ₹{amount} (Confirm Donation)</span>
            </button>
          </div>

          {/* Trust Notice */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
            <Info className="h-4 w-4 text-[#1e6f42] shrink-0 mt-0.5" />
            <span>
              All donations processed under merchant <strong>ROGLE</strong> are audited and 100% deployed directly to animal emergency vet care, rescue transport, daily feeding drives, and IoT protective tags.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;
