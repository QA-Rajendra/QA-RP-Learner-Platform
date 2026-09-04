'use client';

import React, { useState } from 'react';
import { X, Loader2, Sparkles, Check } from 'lucide-react';

const SUGGESTED_TOPICS = [
  'Main module 1',
  'Main module 2',
  'Academic Master',
  'Login & Auth',
  'Course Curriculum',
  'Admissions',
  'Checkout & Payments',
  'Playwright Automation',
  'Selenium Grid',
  'API Testing',
];

const TAG_COLORS = [
  { id: 'emerald', name: 'Emerald', bg: 'bg-[#204938]' },
  { id: 'amber', name: 'Amber', bg: 'bg-[#c68a4c]' },
  { id: 'rose', name: 'Rose', bg: 'bg-[#b95748]' },
  { id: 'blue', name: 'Blue', bg: 'bg-[#4c76ba]' },
  { id: 'slate', name: 'Slate', bg: 'bg-[#545e6d]' },
];

export default function NewMeetingNoteModal({
  isOpen,
  onClose,
  onSuccess,
  initialModule = 'Main module 1',
}) {
  const [moduleName, setModuleName] = useState(initialModule || 'Main module 1');
  const [noteTitle, setNoteTitle] = useState('');
  const [initialPurpose, setInitialPurpose] = useState('');
  const [tagColor, setTagColor] = useState('emerald');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setNoteTitle('');
    setInitialPurpose('');
    setErrorMsg('');
    onClose();
  };

  const handleCreate = async (e) => {
    if (e) e.preventDefault();

    if (!moduleName.trim()) {
      setErrorMsg('Please enter or select a Topic / Module.');
      return;
    }

    if (!noteTitle.trim()) {
      setErrorMsg('Please enter a note title.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const payload = {
        title: noteTitle.trim(),
        module: moduleName.trim(),
        topic: moduleName.trim(),
        topicDescription: `Coverage goals and test architecture for ${moduleName.trim()}`,
        tagColor: tagColor || 'emerald',
      };

      if (initialPurpose.trim()) {
        payload.summary = {
          purpose: initialPurpose.trim(),
        };
      }

      const res = await fetch('/api/meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.note) {
        if (onSuccess) onSuccess(data.note);
        setNoteTitle('');
        setInitialPurpose('');
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to create meeting note');
      }
    } catch (err) {
      console.error('Error creating meeting note:', err);
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 text-slate-900 transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#edf5f1] text-[#204938] border border-emerald-200">
            <Sparkles size={11} /> QA-Notes Studio
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
            Create Meeting Note
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Group under an existing module or start a new sprint topic.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="mt-5 space-y-4">
          {/* Field 1: Topic / Module */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Module / Topic <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">e.g. Main module 1, Checkout</span>
            </div>

            <input
              type="text"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              placeholder="e.g. Main module 1 or Sprint 24 Regression"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2f5547]/30 focus:border-[#2f5547] transition"
              required
            />

            {/* Quick Topic Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-0.5">
                Quick:
              </span>
              {SUGGESTED_TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setModuleName(t)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer border ${
                    moduleName === t
                      ? 'bg-[#edf5f1] border-[#2f5547] text-[#2f5547] font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Field 2: Note Title */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-700">
              Note Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Cross-browser Playwright matrix review"
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2f5547]/30 focus:border-[#2f5547] transition"
              autoFocus
              required
            />
          </div>

          {/* Field 3: Optional Purpose summary */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-700">
              Initial Purpose / Goal <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={initialPurpose}
              onChange={(e) => setInitialPurpose(e.target.value)}
              placeholder="Brief summary of discussion or coverage agenda..."
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2f5547]/30 focus:border-[#2f5547] transition leading-relaxed"
            />
          </div>

          {/* Field 4: Tag Color */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Card Color Tag</span>
            <div className="flex items-center gap-2">
              {TAG_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTagColor(c.id)}
                  className={`w-6 h-6 rounded-full transition-all cursor-pointer ${c.bg} flex items-center justify-center ${
                    tagColor === c.id
                      ? 'ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-md'
                      : 'opacity-75 hover:opacity-100 hover:scale-105'
                  }`}
                  title={c.name}
                >
                  {tagColor === c.id && <Check size={11} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !noteTitle.trim() || !moduleName.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#2f5547] hover:bg-[#254539] active:scale-[0.98] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-[#2f5547]/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>Create Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
