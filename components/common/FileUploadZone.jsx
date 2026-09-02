'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, X, Download } from 'lucide-react';

/**
 * FileUploadZone component for Images (PNG, JPG, SVG, WebP) and PDFs / Documents
 * @param {Object} props
 * @param {string} [props.accept="image/*,.pdf,.zip,.ts,.doc,.docx"] - Accepted MIME / extensions
 * @param {string} [props.label="Upload Image or PDF"] - Display title
 * @param {string} [props.hint="Supports PNG, JPG, WebP, SVG, PDF, ZIP (Max 50MB)"] - Hint caption
 * @param {string} [props.value=""] - Current file URL (if any)
 * @param {string} [props.fileType="auto"] - 'image' | 'pdf' | 'document' | 'auto'
 * @param {Function} props.onUploadSuccess - Callback (data: { url, name, size, fileType }) => void
 * @param {Function} [props.onRemove] - Callback when user removes current file
 * @param {string} [props.className=""] - Custom classes
 */
export default function FileUploadZone({
  accept = "image/*,.pdf,.zip,.ts,.doc,.docx",
  label = "Upload Image or PDF Document",
  hint = "Supports PNG, JPG, WebP, SVG, PDF, ZIP (Max 50MB)",
  value = "",
  fileType = "auto",
  onUploadSuccess,
  onRemove,
  className = "",
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedMeta, setUploadedMeta] = useState(null);
  const inputRef = useRef(null);

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload file');
      }

      setUploadedMeta(data);
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const isCurrentValueImage = value && (value.match(/\.(jpeg|jpg|png|webp|svg|gif)($|\?)/i) || (uploadedMeta?.fileType === 'image'));
  const isCurrentValuePdf = value && (value.match(/\.pdf($|\?)/i) || (uploadedMeta?.fileType === 'pdf'));

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition text-center cursor-pointer flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? 'border-purple-500 bg-purple-500/10'
            : value
            ? 'border-indigo-500/50 bg-indigo-950/20 hover:border-indigo-400'
            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="py-3 flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="text-xs font-bold text-slate-300">Uploading file to server...</span>
          </div>
        ) : value ? (
          <div className="w-full flex items-center justify-between gap-3 p-2 bg-slate-900/90 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 truncate text-left">
              {isCurrentValueImage ? (
                <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                  <img src={value} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : isCurrentValuePdf ? (
                <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
              )}
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">
                  {uploadedMeta?.name || value.split('/').pop() || 'Uploaded File'}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-2">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle size={10} /> Uploaded
                  </span>
                  {uploadedMeta?.size && <span>• {uploadedMeta.size}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 hover:text-white transition flex items-center gap-1"
              >
                <Download size={11} /> View
              </a>
              {onRemove && (
                <button
                  type="button"
                  onClick={() => {
                    setUploadedMeta(null);
                    onRemove();
                  }}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 flex items-center justify-center transition cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-2 flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <UploadCloud size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">
                <span className="text-purple-400 underline decoration-purple-500">Click to upload</span> or drag & drop
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{hint}</div>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl">
          <AlertCircle size={12} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
