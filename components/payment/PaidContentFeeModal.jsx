'use client';

import { useState } from 'react';
import {
  Lock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  ArrowRight,
  X,
  FileText,
  Download,
  Award,
  Video,
  Code2,
  Check
} from 'lucide-react';

export default function PaidContentFeeModal({
  isOpen,
  onClose,
  item = {},
  commonFee = 499,
  currency = 'INR',
  currencySymbol = '₹',
  onPaymentSuccess = () => {},
}) {
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null); // When success, stores transaction details

  if (!isOpen) return null;

  const handlePayNow = async () => {
    setProcessing(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: item?.courseId || 'general_course',
          lessonId: item?._id || item?.id || 'lesson_paid',
          amount: commonFee,
          currency,
          paymentMethod: paymentMethod.toUpperCase(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReceipt(data);
      } else {
        alert(data.error || 'Payment failed. Please try again.');
      }
    } catch (e) {
      alert('Payment processing error: ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteAndUnlock = () => {
    if (receipt && onPaymentSuccess) {
      onPaymentSuccess(receipt);
    }
    setReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        {/* Glow Header */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />

        {/* Close Button */}
        <button
          onClick={() => {
            setReceipt(null);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X size={18} />
        </button>

        {!receipt ? (
          /* STEP 1: FEE POPUP & CHECKOUT */
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header Badge */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold shadow-lg shadow-amber-500/10 shrink-0">
                <Lock size={24} />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Sparkles size={11} /> Premium Paid Content
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  Paid Content Access Required
                </h2>
              </div>
            </div>

            {/* Target Item Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {item?.contentType ? `Content Type: ${item.contentType.toUpperCase()}` : 'Selected Content'}
              </div>
              <div className="text-sm font-bold text-slate-100 line-clamp-2">
                {item?.title || 'Advanced QA Automation Module'}
              </div>
              {item?.sectionTitle && (
                <div className="text-xs text-indigo-400 font-medium">
                  {item.sectionTitle}
                </div>
              )}
            </div>

            {/* Fee Amount Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/30 flex items-center justify-between shadow-inner">
              <div>
                <div className="text-xs text-indigo-300 font-semibold">Standard Platform Fee</div>
                <div className="text-xs text-slate-400">One-time payment • Lifetime access</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-white flex items-center gap-0.5">
                  <span className="text-indigo-400">{currencySymbol}</span>
                  <span>{commonFee}</span>
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">{currency}</div>
              </div>
            </div>

            {/* What's Included */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">What's Included:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Full Video &amp; Lab Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Downloadable PDF Notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Full Code Snippets &amp; Spec</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>Verified Completion Badge</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">Select Payment Method:</div>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode size={18} className={paymentMethod === 'upi' ? 'text-indigo-400' : ''} />
                  <span className="text-[11px] font-bold">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard size={18} className={paymentMethod === 'card' ? 'text-indigo-400' : ''} />
                  <span className="text-[11px] font-bold">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Building size={18} className={paymentMethod === 'netbanking' ? 'text-indigo-400' : ''} />
                  <span className="text-[11px] font-bold">NetBanking</span>
                </button>
              </div>
            </div>

            {/* Pay Now CTA */}
            <button
              onClick={handlePayNow}
              disabled={processing}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-950/60 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <span>Pay Now ({currencySymbol}{commonFee}) &rarr;</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* STEP 2: PAYMENT SUCCESS CONFIRMATION & UNLOCK */
          <div className="p-6 sm:p-8 text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <Check size={32} />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Payment Success
              </span>
              <h2 className="text-2xl font-black text-white pt-2">
                Content Unlocked!
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Your payment of {currencySymbol}{receipt.amount} {receipt.currency} has been verified and your access is active.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Transaction Ref:</span>
                <span className="font-mono text-slate-200 font-bold">{receipt.transactionId}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Method:</span>
                <span className="text-slate-200 font-semibold">{receipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">Paid &amp; Active</span>
              </div>
            </div>

            <button
              onClick={handleCompleteAndUnlock}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-950/60 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Unlock &amp; Start Learning Now &rarr;</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
