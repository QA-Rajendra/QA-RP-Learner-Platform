'use client';

import { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  Phone,
  MapPin,
  Globe,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject: subject || 'QA Platform Inquiry', message })
      });
      if (res.ok) {
        setSent(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase">
            <MessageSquare size={14} /> Get in Touch
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Contact &amp; QA Consultation
          </h1>
          <p className="text-sm text-slate-400">
            Have a question about test automation blueprints, team training, or consulting services? Leave a message below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info Card */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 md:col-span-1">
            <h2 className="text-base font-black text-white">Contact Info</h2>
            <div className="space-y-4 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Email</div>
                  <div className="text-slate-400">qarajendra4893@gmail.com</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe size={16} className="text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Website</div>
                  <div className="text-slate-400">-</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Location</div>
                  <div className="text-slate-400">Global</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 md:col-span-2">
            {sent ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 size={40} className="mx-auto text-emerald-400 animate-bounce" />
                <h3 className="font-black text-white text-lg">Message Sent Successfully!</h3>
                <p className="text-xs text-slate-300">Thank you for reaching out. We will get back to you shortly.</p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Smith"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Your Email *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Playwright Training / Custom QA Consulting"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Message *</label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your project, team size, or questions..."
                    className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xl shadow-indigo-950/60"
                >
                  <Send size={15} /> {sending ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
