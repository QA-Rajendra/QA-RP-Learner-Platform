'use client';

import React, { useState } from 'react';
import { X, Loader2, Tag, BookOpen, Layers } from 'lucide-react';

const SUGGESTED_TOPICS = [
  'Academic Master',
  'Login & Authentication',
  'Course Curriculum',
  'Programs & Admissions',
  'Checkout & Payments',
  'Access Control & RBAC',
  'Playwright Automation',
  'Selenium Grid',
  'API Testing',
  'Regression Sweep',
];

export default function NewMeetingNoteModal({
  isOpen,
  onClose,
  onSuccess,
  initialModule = 'Main module 1',
}) {
  const [moduleName, setModuleName] = useState(initialModule || 'Main module 1');
  const [noteTitle, setNoteTitle] = useState('');
  const [tagColor, setTagColor] = useState('emerald');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setModuleName(initialModule || 'Main module 1');
      setErrorMsg('');
    }
  }, [isOpen, initialModule]);

  if (!isOpen) return null;

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

      const res = await fetch('/api/meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noteTitle.trim(),
          module: moduleName.trim(),
          topic: moduleName.trim(),
          topicDescription: `Coverage goals and test architecture for ${moduleName.trim()}`,
          tagColor: tagColor || 'emerald',
        }),
      });

      const data = await res.json();

      if (res.ok && data.note) {
        if (onSuccess) onSuccess(data.note);
        setNoteTitle('');
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-slate-200 text-slate-900 transition-all">
        {/* Close Icon */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header (Serif typography matching screenshot) */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 tracking-tight">
            New meeting note
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            Enter the topic or module, then provide the note title.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCreate} className="mt-5 space-y-4">
          {/* Field 1: Topic / Module Note Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">
                Topic / Module Note <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">e.g. Main module 1, Academic Master, Login</span>
            </div>

            <div className="relative">
              <input
                type="text"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="Enter Topic or Module name..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2f5547]/30 focus:border-[#2f5547] transition shadow-xs"
                required
              />
            </div>

            {/* Quick Topic Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-0.5">
                Quick Topics:
              </span>
              {SUGGESTED_TOPICS.slice(0, 6).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setModuleName(t)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition cursor-pointer border ${
                    moduleName === t
                      ? 'bg-[#edf5f1] border-[#2f5547] text-[#2f5547] font-bold'
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
              Note title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Playwright regression review or Academic Program Test Plan"
              className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2f5547]/30 focus:border-[#2f5547] transition shadow-xs"
              autoFocus
              required
            />
          </div>

          {/* Field 3: Tag Color */}
          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Tag Color</span>
            <div className="flex items-center gap-2">
              {[
                { id: 'emerald', bg: 'bg-[#204938]' },
                { id: 'amber', bg: 'bg-[#c68a4c]' },
                { id: 'rose', bg: 'bg-[#b95748]' },
                { id: 'blue', bg: 'bg-[#4c76ba]' },
                { id: 'slate', bg: 'bg-[#545e6d]' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTagColor(c.id)}
                  className={`w-4 h-4 rounded-full transition-transform cursor-pointer ${c.bg} ${
                    tagColor === c.id ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons (matching screenshot styling) */}
          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !noteTitle.trim() || !moduleName.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#2f5547] hover:bg-[#254539] text-white text-xs sm:text-sm font-bold transition shadow-md shadow-[#2f5547]/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              <span>Create note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

