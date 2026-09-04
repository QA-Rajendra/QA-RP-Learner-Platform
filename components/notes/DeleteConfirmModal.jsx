'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  title = 'Delete Note',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemName = '',
  onConfirm,
  onClose,
  isDeleting = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-[#131b29] border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Icon & Heading */}
        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Permanent removal confirmation</p>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2">
          {message}
        </p>

        {itemName && (
          <div className="mt-3 p-3 rounded-xl bg-[#192436] border border-slate-700/60 text-xs font-semibold text-rose-300 break-words flex items-center gap-2">
            <Trash2 size={13} className="shrink-0 text-rose-400" />
            <span className="truncate">{itemName}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-rose-950/50 cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={13} />
            <span>{isDeleting ? 'Deleting...' : 'Yes, Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
