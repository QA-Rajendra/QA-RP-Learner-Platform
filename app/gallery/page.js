'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Image as ImageIcon,
  FileText,
  UploadCloud,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Download,
  ExternalLink,
  Sparkles,
  Check,
  Copy,
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Tag,
  FolderPlus,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  FileCode,
  HardDrive,
  Lock,
  ShieldCheck
} from 'lucide-react';

export default function AdminGalleryPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isAdmin = mounted && session?.user?.role === 'ADMIN';

  // ── Gallery Data State
  const [files, setFiles] = useState([]);
  const [overview, setOverview] = useState({ total: 0, images: 0, pdfs: 0, categories: [] });
  const [loading, setLoading] = useState(true);

  // ── Filters & Search State
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // ── Modals State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activePreviewFile, setActivePreviewFile] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // ── Upload Form State
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadCategory, setUploadCategory] = useState('QA Architecture');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState('Playwright, Framework, Documentation');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ── Lightbox State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load Gallery Data
  async function loadGallery() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set('q', search.trim());
      if (selectedType !== 'all') params.set('type', selectedType);
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (sortBy !== 'newest') params.set('sort', sortBy);

      const res = await fetch(`/api/gallery?${params.toString()}`);
      const data = await res.json();
      if (data && Array.isArray(data.files)) {
        setFiles(data.files);
        if (data.overview) setOverview(data.overview);
      }
    } catch (e) {
      console.error('Error fetching gallery:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGallery();
  }, [search, selectedType, selectedCategory, sortBy]);

  // Handle Drag & Drop File Selection
  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(Array.from(e.dataTransfer.files));
    }
  };

  const addFilesToQueue = (newFiles) => {
    const valid = newFiles.filter(f => {
      const ext = f.name.toLowerCase();
      return ext.match(/\.(png|jpg|jpeg|webp|svg|gif|pdf)$/i) || f.type.startsWith('image/') || f.type === 'application/pdf';
    });
    setUploadQueue(prev => [...prev, ...valid]);
  };

  // Execute Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (uploadQueue.length === 0) return;

    try {
      setUploading(true);
      const formData = new FormData();
      uploadQueue.forEach(f => formData.append('files', f));
      formData.append('category', uploadCategory);
      formData.append('description', uploadDescription);
      formData.append('tags', uploadTags);

      const res = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setUploadQueue([]);
        setUploadDescription('');
        setUploadModalOpen(false);
        await loadGallery();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Upload failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Delete File
  const handleDelete = async (file) => {
    if (!confirm(`Are you sure you want to permanently delete "${file.name}"?`)) return;
    try {
      const res = await fetch(`/api/gallery/${file._id}`, { method: 'DELETE' });
      if (res.ok) {
        setFiles(prev => prev.filter(f => f._id !== file._id));
        if (activePreviewFile?._id === file._id) setPreviewModalOpen(false);
      } else {
        alert('Failed to delete file');
      }
    } catch (e) {
      alert(e.message);
    }
  };

  // Edit Metadata Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingFile) return;

    try {
      const res = await fetch(`/api/gallery/${editingFile._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingFile.name,
          category: editingFile.category,
          description: editingFile.description,
          tags: Array.isArray(editingFile.tags) ? editingFile.tags : typeof editingFile.tags === 'string' ? editingFile.tags.split(',') : [],
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setFiles(prev => prev.map(f => f._id === updated._id ? updated : f));
        setEditModalOpen(false);
        setEditingFile(null);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Copy Link Helper
  const handleCopyLink = (file) => {
    const fullUrl = `${window.location.origin}${file.url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(file._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Preview Lightbox
  const handleOpenPreview = (file) => {
    setActivePreviewFile(file);
    setZoomLevel(1);
    setRotation(0);
    setPreviewModalOpen(true);
  };

  if (!mounted || sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs font-bold font-sans">
        <Sparkles size={18} className="animate-spin text-indigo-400 mr-2" /> Authenticating Admin Access...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
            <Lock size={30} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white">Admin Access Only</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Media &amp; PDF Gallery is a restricted administrative studio for uploading and managing cloud assets.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/signin"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-bold text-xs shadow-lg transition text-center"
            >
              Sign In with Admin Credentials &rarr;
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition text-center"
            >
              &larr; Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ════════════════════════════════════════════════════════════════════
            1. GALLERY HEADER & STATS
        ════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <HardDrive size={14} className="text-indigo-400" /> Cloud Media &amp; Document Storage
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Media &amp; PDF Gallery
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Centralized repository for architecture diagrams, test execution reports, PDF guides, and course assets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 text-white text-xs font-black transition shadow-xl shadow-indigo-950/60 flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <UploadCloud size={16} /> + Upload Files
            </button>
            <Link
              href="/settings"
              className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-2"
            >
              ⚙️ Admin Studio
            </Link>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            2. STATS OVERVIEW CARDS
        ════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-400">Total Assets</div>
            <div className="text-2xl font-black text-white">{overview.total || files.length}</div>
            <div className="text-[10px] text-slate-500">Stored in /public/uploads</div>
          </div>
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
            <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5"><ImageIcon size={14} /> Images</div>
            <div className="text-2xl font-black text-purple-400">{overview.images || files.filter(f=>f.fileType==='image').length}</div>
            <div className="text-[10px] text-purple-400/70">PNG, JPG, WebP, SVG</div>
          </div>
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-1">
            <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5"><FileText size={14} /> PDF Documents</div>
            <div className="text-2xl font-black text-rose-400">{overview.pdfs || files.filter(f=>f.fileType==='pdf').length}</div>
            <div className="text-[10px] text-rose-400/70">Study Guides &amp; Blueprints</div>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
            <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5"><Tag size={14} /> Taxonomies</div>
            <div className="text-2xl font-black text-emerald-400">{overview.categories?.length || 4}</div>
            <div className="text-[10px] text-emerald-400/70">Categorized Topics</div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            3. SEARCH, FILTER TABS & CONTROLS
        ════════════════════════════════════════════════════════════════════ */}
        <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by file name, tags, description..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">✕</button>
              )}
            </div>

            {/* Filter Tabs: All | Images | PDFs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
              {[
                { id: 'all', label: 'All Files', icon: Layers },
                { id: 'image', label: '🖼️ Images', icon: ImageIcon },
                { id: 'pdf', label: '📄 PDFs', icon: FileText },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    selectedType === tab.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/60'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dropdowns: Category & Sort */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-bold"
              >
                <option value="all">All Categories</option>
                {overview.categories?.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
                {overview.categories?.length === 0 && (
                  <>
                    <option value="QA Architecture">QA Architecture</option>
                    <option value="Playwright Specs">Playwright Specs</option>
                    <option value="Test Reports">Test Reports</option>
                    <option value="Course Assets">Course Assets</option>
                  </>
                )}
              </select>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-bold"
              >
                <option value="newest">🕒 Newest First</option>
                <option value="oldest">⏳ Oldest First</option>
                <option value="name_asc">🔤 Name (A-Z)</option>
                <option value="name_desc">🔡 Name (Z-A)</option>
                <option value="size_desc">📦 Size (Largest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            4. GALLERY GRID CARDS
        ════════════════════════════════════════════════════════════════════ */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <Sparkles size={18} className="animate-spin text-indigo-400" /> Loading gallery assets...
          </div>
        ) : files.length === 0 ? (
          <div className="py-20 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 p-8">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center text-2xl font-bold">
              📂
            </div>
            <h3 className="text-base font-black text-white">No Files Match Your Filter</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Upload images or PDF blueprints to populate your media library, or try clearing search filters.
            </p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg cursor-pointer"
            >
              + Upload First File
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {files.map(file => {
              const isPdf = file.fileType === 'pdf' || file.name.toLowerCase().endsWith('.pdf');
              return (
                <div
                  key={file._id}
                  className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-indigo-500/50 transition hover:shadow-2xl hover:shadow-indigo-950/50 group"
                >
                  {/* Thumbnail / PDF Card Top */}
                  <div
                    onClick={() => handleOpenPreview(file)}
                    className="h-44 w-full bg-slate-950 relative overflow-hidden flex items-center justify-center cursor-pointer"
                  >
                    {isPdf ? (
                      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/30 flex flex-col items-center justify-center p-4 text-center space-y-2 group-hover:scale-105 transition duration-300">
                        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg">
                          <FileText size={28} />
                        </div>
                        <span className="text-[11px] font-black text-slate-300 line-clamp-1 px-2">{file.name}</span>
                        <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                          PDF Document
                        </span>
                      </div>
                    ) : (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                      />
                    )}

                    {/* Format Badge Overlay */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md ${
                        isPdf ? 'bg-rose-600 text-white' : 'bg-purple-600 text-white'
                      }`}>
                        {isPdf ? 'PDF' : (file.mimeType?.split('/')[1] || 'IMAGE').toUpperCase()}
                      </span>
                    </div>

                    {/* Quick Preview Hover Overlay */}
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-2">
                      <span className="px-3.5 py-1.5 rounded-xl bg-white text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-xl">
                        <Eye size={14} /> Quick Preview
                      </span>
                    </div>
                  </div>

                  {/* Card Content & Details */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                        <span className="text-indigo-400 truncate max-w-[120px]">{file.category || 'General'}</span>
                        <span>{file.sizeFormatted || '1.2 MB'}</span>
                      </div>
                      
                      <h4 className="text-xs font-black text-white line-clamp-1 group-hover:text-indigo-300 transition" title={file.name}>
                        {file.name}
                      </h4>

                      {file.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {file.description}
                        </p>
                      )}

                      {/* Tags */}
                      {file.tags && file.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {file.tags.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1 text-slate-400">
                      <button
                        onClick={() => handleOpenPreview(file)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition cursor-pointer"
                        title="Preview"
                      >
                        <Eye size={14} />
                      </button>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Open in new tab"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = file.url;
                          a.download = file.originalName || file.name;
                          a.click();
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-emerald-400 transition cursor-pointer"
                        title="Download file"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleCopyLink(file)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-indigo-400 transition cursor-pointer"
                        title="Copy Public URL"
                      >
                        {copiedId === file._id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => {
                              setEditingFile({ ...file, tags: file.tags ? file.tags.join(', ') : '' });
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-amber-400 transition cursor-pointer"
                            title="Edit metadata"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(file)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition cursor-pointer"
                            title="Delete file"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            5. MODAL: UPLOAD FILES (DRAG & DROP)
        ════════════════════════════════════════════════════════════════════ */}
        {uploadModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleUploadSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <UploadCloud size={18} className="text-indigo-400" />
                    Upload Media &amp; PDF Documents
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Supports PNG, JPG, WebP, SVG, and PDF documents.</p>
                </div>
                <button type="button" onClick={() => setUploadModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800">✕</button>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-3xl bg-slate-950 border-2 border-dashed border-slate-800 hover:border-indigo-500/60 transition cursor-pointer text-center space-y-3 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*,application/pdf"
                  onChange={e => {
                    if (e.target.files) addFilesToQueue(Array.from(e.target.files));
                  }}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mx-auto flex items-center justify-center group-hover:scale-110 transition duration-200">
                  <UploadCloud size={28} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Drag &amp; drop files here or <span className="text-indigo-400 underline">Browse Files</span></div>
                  <div className="text-[10px] text-slate-500 mt-1">Supports JPG, PNG, WEBP, SVG, PDF up to 50MB per file</div>
                </div>
              </div>

              {/* Selected Files Queue */}
              {uploadQueue.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Selected Files ({uploadQueue.length})</span>
                    <button type="button" onClick={() => setUploadQueue([])} className="text-[10px] text-rose-400 hover:underline">Clear All</button>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-2xl bg-slate-950 border border-slate-800">
                    {uploadQueue.map((file, idx) => (
                      <div key={idx} className="p-2 rounded-xl bg-slate-900 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-xs">{file.type === 'application/pdf' ? '📄' : '🖼️'}</span>
                          <span className="font-bold text-slate-200 truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadQueue(uploadQueue.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-rose-400 text-xs px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category *</label>
                  <input
                    type="text"
                    required
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value)}
                    placeholder="e.g. QA Architecture, Playwright Specs"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={uploadTags}
                    onChange={e => setUploadTags(e.target.value)}
                    placeholder="Automation, Guide, Blueprint"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={uploadDescription}
                  onChange={e => setUploadDescription(e.target.value)}
                  placeholder="Optional context about what this diagram or study guide covers."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || uploadQueue.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {uploading ? <Sparkles size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                  {uploading ? 'Uploading Files...' : `Upload ${uploadQueue.length} File${uploadQueue.length > 1 ? 's' : ''} →`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            6. MODAL: INTERACTIVE PREVIEW LIGHTBOX (IMAGES & PDFS)
        ════════════════════════════════════════════════════════════════════ */}
        {previewModalOpen && activePreviewFile && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex flex-col p-4 sm:p-6 animate-in fade-in duration-200">
            {/* Lightbox Toolbar Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-3 truncate">
                <span className="text-lg">{activePreviewFile.fileType === 'pdf' ? '📄' : '🖼️'}</span>
                <div className="truncate">
                  <h3 className="text-sm font-black text-white truncate">{activePreviewFile.name}</h3>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2">
                    <span>{activePreviewFile.category || 'General'}</span>
                    <span>•</span>
                    <span>{activePreviewFile.sizeFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Lightbox Controls */}
              <div className="flex items-center gap-2">
                {activePreviewFile.fileType === 'image' && (
                  <>
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn size={15} />
                    </button>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut size={15} />
                    </button>
                    <button
                      onClick={() => setRotation(prev => (prev + 90) % 360)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                      title="Rotate"
                    >
                      <RotateCw size={15} />
                    </button>
                  </>
                )}

                <a
                  href={activePreviewFile.url}
                  download={activePreviewFile.originalName || activePreviewFile.name}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download size={13} /> Download
                </a>

                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Viewer Workspace */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 relative">
              {activePreviewFile.fileType === 'pdf' ? (
                <div className="w-full h-full max-w-5xl rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex flex-col">
                  <iframe
                    src={`${activePreviewFile.url}#toolbar=1&navpanes=0`}
                    className="w-full h-full flex-1 rounded-2xl"
                    title={activePreviewFile.name}
                  />
                </div>
              ) : (
                <div className="max-w-full max-h-full flex items-center justify-center overflow-auto p-4">
                  <img
                    src={activePreviewFile.url}
                    alt={activePreviewFile.name}
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease-in-out',
                    }}
                    className="max-h-[80vh] max-w-[85vw] object-contain rounded-2xl shadow-2xl border border-slate-800"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            7. MODAL: EDIT FILE METADATA
        ════════════════════════════════════════════════════════════════════ */}
        {editModalOpen && editingFile && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <form onSubmit={handleEditSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Edit2 size={16} className="text-amber-400" />
                  Edit File Metadata
                </h3>
                <button type="button" onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">File Title *</label>
                <input
                  type="text"
                  required
                  value={editingFile.name}
                  onChange={e => setEditingFile({ ...editingFile, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={editingFile.category}
                  onChange={e => setEditingFile({ ...editingFile, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={editingFile.tags}
                  onChange={e => setEditingFile({ ...editingFile, tags: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={editingFile.description}
                  onChange={e => setEditingFile({ ...editingFile, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 text-white text-xs font-black shadow-lg cursor-pointer"
                >
                  ✓ Save Metadata
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
