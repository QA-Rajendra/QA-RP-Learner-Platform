'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Edit3,
  Save,
  Copy,
  Check,
  FileText,
  RefreshCw,
  Shield,
  ShieldAlert,
  Lock,
  ChevronDown,
  ChevronRight,
  FolderPlus,
  Menu,
  X,
  PlusCircle,
  AlertCircle,
  Sparkles,
  Pin,
  Download,
  Printer,
  CopyPlus,
  Columns,
  Eye,
  Clock,
  Bold,
  Italic,
  List,
  Code,
  Quote
} from 'lucide-react';
import NewMeetingNoteModal from '@/components/notes/NewMeetingNoteModal';
import DeleteConfirmModal from '@/components/notes/DeleteConfirmModal';

const TAG_COLOR_MAP = {
  amber: {
    name: 'Amber',
    bg: 'bg-[#c68a4c]',
    border: 'border-[#c68a4c]',
    indicator: 'bg-[#c68a4c]',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  emerald: {
    name: 'Emerald',
    bg: 'bg-[#204938]',
    border: 'border-[#204938]',
    indicator: 'bg-[#204938]',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  rose: {
    name: 'Rose',
    bg: 'bg-[#b95748]',
    border: 'border-[#b95748]',
    indicator: 'bg-[#b95748]',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    dot: 'bg-rose-400',
  },
  blue: {
    name: 'Blue',
    bg: 'bg-[#4c76ba]',
    border: 'border-[#4c76ba]',
    indicator: 'bg-[#4c76ba]',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    dot: 'bg-blue-400',
  },
  slate: {
    name: 'Slate',
    bg: 'bg-[#545e6d]',
    border: 'border-[#545e6d]',
    indicator: 'bg-[#545e6d]',
    badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    dot: 'bg-slate-400',
  },
};

const COLOR_KEYS = ['amber', 'emerald', 'rose', 'blue', 'slate'];

const SECTION_TEMPLATES = [
  { title: 'Risks & Blockers', type: 'callout', placeholder: 'Identify high-risk modules, third-party dependencies, or test blockers...' },
  { title: 'Test Environment & URLs', type: 'text', placeholder: 'Staging URL, Swagger API docs, and credential access requirements...' },
  { title: 'Acceptance Criteria', type: 'bullets', placeholder: 'Enter 1 criterion per line:\n- Must pass on Chrome and Safari\n- Performance < 200ms latency' },
  { title: 'Test Data & Seed Requirements', type: 'text', placeholder: 'User roles required, mock tokens, and database seed states...' },
  { title: 'Sign-off & Approvals', type: 'bullets', placeholder: 'Enter approval stakeholders per line:\n- QA Lead sign-off\n- Engineering Lead review' },
];

function NotesContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const initialModuleParam = searchParams.get('module') || 'All';

  const [mounted, setMounted] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedModule] = useState(initialModuleParam);
  const [tagColorFilter, setTagColorFilter] = useState('All');

  // Pinned Notes (Initialized from localStorage)
  const [pinnedNoteIds, setPinnedNoteIds] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('qarp_pinned_notes');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return new Set(parsed);
        }
      } catch {
        // ignore
      }
    }
    return new Set();
  });

  // Responsive Mobile Drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Collapsible tracking per module
  const [collapsedModules, setCollapsedModules] = useState(new Set());
  const [pinnedCollapsed, setPinnedCollapsed] = useState(false);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialModule, setModalInitialModule] = useState('Main module 1');

  // Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: 'note',
    noteId: null,
    noteTitle: '',
    sectionId: null,
    sectionTitle: '',
  });

  // Edit Mode & View Mode State ('view' | 'edit' | 'split')
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState('view');
  const [editForm, setEditForm] = useState({
    title: '',
    purpose: '',
    coverageGoalsText: '',
    toolingDecision: '',
    nextStep: '',
    customSections: [],
  });

  // Focused element for formatting toolbar insertion
  const activeInputRef = useRef(null);

  // New Dynamic Section Form State
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState('text');
  const [newSectionContent, setNewSectionContent] = useState('');

  const [copied, setCopied] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  }, []);

  const [prevNoteId, setPrevNoteId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const isAdmin = mounted && session?.user?.role === 'ADMIN';

  // Fetch meeting notes callback
  const fetchNotes = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedModule !== 'All') params.append('module', selectedModule);
      if (tagColorFilter !== 'All') params.append('tagColor', tagColorFilter);
      params.append('_t', Date.now());

      const res = await fetch(`/api/meeting-notes?${params.toString()}`, {
        cache: 'no-store',
      });

      if (res.ok) {
        const data = await res.json();
        const list = data.notes || [];
        setNotes(list);
        if (list.length > 0 && (!selectedNoteId || !list.some((n) => n._id === selectedNoteId))) {
          setSelectedNoteId(list[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load meeting notes:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedModule, tagColorFilter, selectedNoteId]);

  useEffect(() => {
    if (!isAdmin) return;
    const timer = setTimeout(() => {
      fetchNotes();
    }, 280);
    return () => clearTimeout(timer);
  }, [isAdmin, fetchNotes]);

  // Selected note object
  const activeNote = useMemo(() => {
    return notes.find((n) => n._id === selectedNoteId) || notes[0] || null;
  }, [notes, selectedNoteId]);

  // Sync edit form when active note changes (React documentation: Storing information from previous renders)
  if (activeNote && activeNote._id !== prevNoteId) {
    setPrevNoteId(activeNote._id);
    setEditForm({
      title: activeNote.title || '',
      purpose: activeNote.summary?.purpose || '',
      coverageGoalsText: (activeNote.summary?.coverageGoals || []).join('\n'),
      toolingDecision: activeNote.summary?.toolingDecision || '',
      nextStep: activeNote.summary?.nextStep || '',
      customSections: activeNote.summary?.customSections || [],
    });
    setIsEditing(false);
    setViewMode('view');
    setShowAddSection(false);
  }


  // Handle Save Edited Summary (declared before keyboard shortcuts)
  const handleSaveSummary = useCallback(async (customSecsToSave = null) => {
    if (!activeNote) return;

    try {
      const goalsArray = editForm.coverageGoalsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

      const sectionsToPersist = customSecsToSave !== null ? customSecsToSave : editForm.customSections;

      const updatedPayload = {
        title: editForm.title.trim() || activeNote.title,
        summary: {
          purpose: editForm.purpose.trim(),
          coverageGoals: goalsArray,
          toolingDecision: editForm.toolingDecision.trim(),
          nextStep: editForm.nextStep.trim(),
          customSections: sectionsToPersist,
        },
      };

      const res = await fetch(`/api/meeting-notes/${activeNote._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });

      if (res.ok) {
        const data = await res.json();
        setNotes((prev) =>
          prev.map((n) => (n._id === activeNote._id ? data.note : n))
        );
        setIsEditing(false);
        setViewMode('view');
        showToast('✓ Note saved successfully! (Ctrl+S)');
      }
    } catch (err) {
      console.error('Failed to save note:', err);
      showToast('Failed to save note', 'error');
    }
  }, [activeNote, editForm, showToast]);

  // Keyboard Shortcuts: Ctrl+S to save, Esc to cancel editing
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isEditing || viewMode === 'split' || viewMode === 'edit') {
          handleSaveSummary();
        }
      } else if (e.key === 'Escape') {
        if (deleteModal.isOpen) {
          setDeleteModal({ isOpen: false, type: 'note', noteId: null, noteTitle: '', sectionId: null, sectionTitle: '' });
        } else if (modalOpen) {
          setModalOpen(false);
        } else if (showAddSection) {
          setShowAddSection(false);
        } else if (isEditing) {
          setIsEditing(false);
          setViewMode('view');
          showToast('Cancelled editing');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, viewMode, deleteModal, modalOpen, showAddSection, handleSaveSummary, showToast]);

  // Save Pinned Notes to localStorage
  const togglePinNote = (noteId, e) => {
    if (e) e.stopPropagation();
    setPinnedNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
        showToast('Unpinned note');
      } else {
        next.add(noteId);
        showToast('Pinned note to top ⭐');
      }
      try {
        localStorage.setItem('qarp_pinned_notes', JSON.stringify(Array.from(next)));
      } catch (err) {
        console.error('Failed to persist pinned notes', err);
      }
      return next;
    });
  };

  // Filtered Notes list by search & tagColor
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      if (tagColorFilter !== 'All' && n.tagColor !== tagColorFilter) return false;
      return true;
    });
  }, [notes, tagColorFilter]);

  // Pinned Notes list
  const pinnedNotes = useMemo(() => {
    return filteredNotes.filter((n) => pinnedNoteIds.has(n._id));
  }, [filteredNotes, pinnedNoteIds]);

  // Group notes into multiple dynamic module sections
  const moduleSections = useMemo(() => {
    const map = new Map();

    filteredNotes.forEach((note) => {
      const modName = note.module?.trim() || note.topic?.trim() || 'Main module 1';
      if (!map.has(modName)) {
        map.set(modName, {
          name: modName,
          notes: [],
        });
      }
      map.get(modName).notes.push(note);
    });

    return Array.from(map.values());
  }, [filteredNotes]);

  // Word & Character count calculation
  const noteStats = useMemo(() => {
    const current = isEditing ? editForm : {
      title: activeNote?.title || '',
      purpose: activeNote?.summary?.purpose || '',
      coverageGoalsText: (activeNote?.summary?.coverageGoals || []).join(' '),
      toolingDecision: activeNote?.summary?.toolingDecision || '',
      nextStep: activeNote?.summary?.nextStep || '',
      customSections: activeNote?.summary?.customSections || [],
    };

    let text = `${current.title} ${current.purpose} ${current.coverageGoalsText} ${current.toolingDecision} ${current.nextStep}`;
    if (current.customSections && Array.isArray(current.customSections)) {
      current.customSections.forEach((s) => {
        text += ` ${s.title} ${s.content || ''}`;
      });
    }

    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = trimmed.length;

    return { words, chars };
  }, [activeNote, isEditing, editForm]);

  // Toggle Module Section Collapse
  const toggleModuleCollapse = (modName) => {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      if (next.has(modName)) {
        next.delete(modName);
      } else {
        next.add(modName);
      }
      return next;
    });
  };

  // If loading session
  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0d141e] text-slate-400 flex items-center justify-center gap-2 font-sans">
        <RefreshCw size={18} className="animate-spin text-emerald-400" />
        <span>Authenticating QA-Notes Studio...</span>
      </div>
    );
  }

  // If not Admin user -> Show access restricted screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0d141e] text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 sm:p-9 rounded-3xl bg-[#0f1723] border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <Lock size={30} />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              <ShieldAlert size={12} /> Admin Only Studio
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Admin Access Required
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              QA-Notes Studio is strictly restricted to platform administrators for architectural and sprint planning.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/signin?callbackUrl=/notes"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold transition shadow-lg shadow-amber-950/50 cursor-pointer"
            >
              <Shield size={14} />
              <span>Sign In as Admin</span>
            </Link>

            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 font-semibold transition"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle Tag Color Change
  const handleTagColorChange = async (newColor) => {
    if (!activeNote) return;

    setNotes((prev) =>
      prev.map((n) => (n._id === activeNote._id ? { ...n, tagColor: newColor } : n))
    );

    try {
      await fetch(`/api/meeting-notes/${activeNote._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagColor: newColor }),
      });
      showToast(`Updated note tag color to ${TAG_COLOR_MAP[newColor]?.name || newColor}`);
    } catch (err) {
      console.error('Failed to update tag color:', err);
    }
  };

  // Add Dynamic Section to Active Note
  const handleAddNewDynamicSection = async () => {
    if (!newSectionTitle.trim()) {
      showToast('Please enter a section title', 'error');
      return;
    }

    const newSec = {
      id: Math.random().toString(36).substring(2, 9),
      title: newSectionTitle.trim(),
      type: newSectionType,
      content: newSectionContent.trim(),
    };

    const updatedSections = [...(editForm.customSections || []), newSec];
    setEditForm((prev) => ({ ...prev, customSections: updatedSections }));

    setNewSectionTitle('');
    setNewSectionContent('');
    setShowAddSection(false);

    await handleSaveSummary(updatedSections);
    showToast(`✓ Added dynamic section: "${newSec.title}"`);
  };

  // Trigger Delete Modal for Section
  const promptDeleteSection = (secId, secTitle) => {
    setDeleteModal({
      isOpen: true,
      type: 'section',
      noteId: null,
      noteTitle: '',
      sectionId: secId,
      sectionTitle: secTitle,
    });
  };

  // Trigger Delete Modal for Note
  const promptDeleteNote = (noteId, noteTitle, e) => {
    if (e) e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      type: 'note',
      noteId,
      noteTitle,
      sectionId: null,
      sectionTitle: '',
    });
  };

  // Confirm and Execute Deletion from Modal
  const executeDelete = async () => {
    if (deleteModal.type === 'section') {
      const updatedSections = (editForm.customSections || []).filter(
        (s) => s.id !== deleteModal.sectionId
      );
      setEditForm((prev) => ({ ...prev, customSections: updatedSections }));
      await handleSaveSummary(updatedSections);
      showToast(`✓ Removed section "${deleteModal.sectionTitle}"`);
      setDeleteModal({ isOpen: false, type: 'note', noteId: null, noteTitle: '', sectionId: null, sectionTitle: '' });
    } else if (deleteModal.type === 'note') {
      const { noteId, noteTitle } = deleteModal;
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      if (selectedNoteId === noteId) {
        const remaining = notes.filter((n) => n._id !== noteId);
        setSelectedNoteId(remaining[0]?._id || null);
      }
      setDeleteModal({ isOpen: false, type: 'note', noteId: null, noteTitle: '', sectionId: null, sectionTitle: '' });

      try {
        await fetch(`/api/meeting-notes/${noteId}`, { method: 'DELETE' });
        showToast(`✓ Deleted "${noteTitle}"`);
        fetchNotes();
      } catch (err) {
        console.error('Failed to delete note:', err);
        showToast('Failed to delete note', 'error');
      }
    }
  };

  // Duplicate / Clone Note
  const handleDuplicateNote = async (noteToDuplicate, e) => {
    if (e) e.stopPropagation();
    const source = noteToDuplicate || activeNote;
    if (!source) return;

    try {
      showToast('Duplicating note...', 'info');
      const payload = {
        title: `${source.title} (Copy)`,
        module: source.module || 'Main module 1',
        topic: source.topic || source.module || 'Main module 1',
        topicDescription: source.topicDescription || '',
        tagColor: source.tagColor || 'emerald',
        summary: {
          purpose: source.summary?.purpose || '',
          coverageGoals: source.summary?.coverageGoals || [],
          toolingDecision: source.summary?.toolingDecision || '',
          nextStep: source.summary?.nextStep || '',
          customSections: source.summary?.customSections || [],
        },
      };

      const res = await fetch('/api/meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setNotes((prev) => [data.note, ...prev]);
        setSelectedNoteId(data.note._id);
        showToast(`✓ Duplicated: "${data.note.title}"`);
      } else {
        showToast('Failed to duplicate note', 'error');
      }
    } catch (err) {
      console.error('Error duplicating note:', err);
      showToast('Error duplicating note', 'error');
    }
  };

  // Generate Markdown Text
  const generateMarkdownString = () => {
    if (!activeNote) return '';
    let text = `# ${activeNote.title}\n\n`;
    text += `**Module:** ${activeNote.module || activeNote.topic}  \n`;
    text += `**Author:** ${activeNote.author?.name || 'You'}  \n`;
    text += `**Date:** ${activeNote.dateDisplay || new Date(activeNote.createdAt || Date.now()).toLocaleDateString()}  \n\n`;
    text += `---\n\n`;

    text += `## Purpose\n${activeNote.summary?.purpose || 'N/A'}\n\n`;

    text += `## Coverage Goals\n`;
    if (activeNote.summary?.coverageGoals?.length) {
      activeNote.summary.coverageGoals.forEach((g, i) => {
        text += `${i + 1}. ${g}\n`;
      });
    } else {
      text += `None specified.\n`;
    }
    text += `\n`;

    text += `## Tooling Decision\n${activeNote.summary?.toolingDecision || 'N/A'}\n\n`;
    text += `## Next Step\n${activeNote.summary?.nextStep || 'N/A'}\n\n`;

    if (activeNote.summary?.customSections?.length > 0) {
      activeNote.summary.customSections.forEach((sec) => {
        text += `## ${sec.title}\n${sec.content || ''}\n\n`;
      });
    }

    return text;
  };

  // Copy Summary text to clipboard
  const handleCopySummary = () => {
    if (!activeNote) return;
    const text = generateMarkdownString();
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('✓ Copied Markdown to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Markdown file (.md)
  const handleDownloadMarkdown = () => {
    if (!activeNote) return;
    const text = generateMarkdownString();
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (activeNote.title || 'note').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    link.href = url;
    link.setAttribute('download', `${safeName}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`✓ Downloaded ${safeName}.md`);
  };

  // Print Note (Print-to-PDF)
  const handlePrintNote = () => {
    window.print();
  };

  // Quick text formatting injection for editor textareas
  const insertFormatting = (prefix, suffix = '') => {
    if (!activeInputRef.current) return;
    const el = activeInputRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = el.value;
    const selected = val.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newVal = val.substring(0, start) + replacement + val.substring(end);

    const fieldName = el.getAttribute('name');
    if (fieldName && editForm[fieldName] !== undefined) {
      setEditForm((prev) => ({ ...prev, [fieldName]: newVal }));
    }

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 0);
  };

  // Render Tooling Decision text with highlighted code tags
  const renderHighlightedDecision = (text = '') => {
    if (!text) return null;
    const parts = text.split(/(Selenium|Playwright|Cypress|Appium|Postman|Jest)/g);
    return (
      <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
        {parts.map((part, i) => {
          if (['Selenium', 'Playwright', 'Cypress', 'Appium', 'Postman', 'Jest'].includes(part)) {
            return (
              <span
                key={i}
                className="inline-block px-2.5 py-0.5 mx-1 rounded-md bg-[#edf2ee] border border-[#d6e2d9] text-xs font-mono font-bold text-[#2a4d3f]"
              >
                {part}
              </span>
            );
          }
          return part;
        })}
      </p>
    );
  };

  // Helper to render individual Note Card
  const renderNoteCard = (note, isPinnedCard = false) => {
    const isSelected = activeNote?._id === note._id;
    const tagColorObj = TAG_COLOR_MAP[note.tagColor] || TAG_COLOR_MAP.emerald;
    const isPinned = pinnedNoteIds.has(note._id);

    return (
      <div
        key={`${isPinnedCard ? 'pin-' : ''}${note._id}`}
        onClick={() => {
          setSelectedNoteId(note._id);
          setMobileSidebarOpen(false);
        }}
        className={`group relative w-full min-w-0 p-3 rounded-2xl transition-all cursor-pointer flex flex-col justify-between gap-1.5 overflow-hidden ${
          isSelected
            ? 'bg-[#182637] border border-slate-600/80 shadow-md ring-1 ring-white/10'
            : 'hover:bg-[#141f2e] border border-slate-800/40'
        }`}
      >
        <div
          className={`absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full transition-all ${
            isSelected
              ? tagColorObj.indicator
              : 'opacity-40 group-hover:opacity-100 ' + tagColorObj.indicator
          }`}
        />

        <div className="flex items-start justify-between gap-2 pl-2 w-full min-w-0">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {isPinned && (
              <Pin size={11} className="text-amber-400 shrink-0 fill-amber-400/30" />
            )}
            <h4
              className={`text-xs font-bold leading-snug line-clamp-2 break-words ${
                isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
              }`}
            >
              {note.title}
            </h4>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
            <button
              type="button"
              onClick={(e) => togglePinNote(note._id, e)}
              className={`p-1 rounded-md transition cursor-pointer ${
                isPinned ? 'text-amber-400 hover:text-amber-300' : 'text-slate-400 hover:text-white'
              }`}
              title={isPinned ? 'Unpin note' : 'Pin note to top'}
            >
              <Pin size={11} className={isPinned ? 'fill-amber-400/40' : ''} />
            </button>

            <button
              type="button"
              onClick={(e) => handleDuplicateNote(note, e)}
              className="p-1 rounded-md text-slate-400 hover:text-emerald-400 transition cursor-pointer"
              title="Duplicate note"
            >
              <CopyPlus size={11} />
            </button>

            <button
              type="button"
              onClick={(e) => promptDeleteNote(note._id, note.title, e)}
              className="p-1 rounded-md text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="Delete note"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pl-2 pt-0.5 text-[10px] text-slate-400 w-full min-w-0 gap-2">
          <span className="flex items-center gap-1 font-medium truncate min-w-0">
            <Clock size={10} className="text-slate-500 shrink-0" />
            <span className="truncate">{note.dateDisplay || 'Recent'}</span>
          </span>
          <span className={`px-2 py-0.5 rounded font-semibold text-[9px] shrink-0 ${tagColorObj.badge}`}>
            {tagColorObj.name}
          </span>
        </div>
      </div>
    );
  };

  // Helper to render Sidebar Content
  const renderSidebar = () => (
    <div className="flex flex-col h-full w-full min-w-0 overflow-hidden bg-[#0f1723] text-slate-100 font-sans select-none no-print">
      <div className="p-4 pb-3 flex items-center justify-between border-b border-slate-800/80 shrink-0 bg-[#0c131d]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#c68a4c] to-amber-700 shadow-sm flex items-center justify-center text-[10px] font-black text-white tracking-wider ring-1 ring-white/20">
            QA
          </div>
          <div>
            <span className="text-sm font-serif font-black tracking-tight text-white block leading-none">
              QA-Notes
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Sprint Architecture</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 font-semibold border border-slate-700/50">
            {filteredNotes.length}
          </span>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer ml-1"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="p-3 pb-2 shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search notes, tools, modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-7 py-2 rounded-xl bg-[#172232] border border-slate-700/70 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-500 transition shadow-inner"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="px-3 pb-2.5 pt-0.5 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none border-b border-slate-800/40 w-full min-w-0">
        <button
          type="button"
          onClick={() => setTagColorFilter('All')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer shrink-0 ${
            tagColorFilter === 'All'
              ? 'bg-slate-200 text-slate-900 shadow-xs'
              : 'bg-[#172232] text-slate-400 hover:text-white hover:bg-[#1f2d42]'
          }`}
        >
          All
        </button>
        {COLOR_KEYS.map((k) => {
          const c = TAG_COLOR_MAP[k];
          const isSelected = tagColorFilter === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setTagColorFilter(isSelected ? 'All' : k)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer shrink-0 border ${
                isSelected
                  ? `${c.bg} text-white border-white/40 shadow-xs`
                  : 'bg-[#172232] border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin text-emerald-400" />
            <span>Loading module sections...</span>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs space-y-3">
            <p>No notes found matching your filter.</p>
            <button
              type="button"
              onClick={() => {
                setModalInitialModule('Main module 1');
                setModalOpen(true);
                setMobileSidebarOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#365749] text-white text-xs font-bold hover:bg-[#2e4d3f] transition cursor-pointer"
            >
              + Add first note
            </button>
          </div>
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <div className="space-y-1.5 pb-2 border-b border-slate-800/60">
                <div
                  onClick={() => setPinnedCollapsed(!pinnedCollapsed)}
                  className="px-2 py-1 rounded-xl hover:bg-[#141f2e] transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-1.5">
                    <Pin size={12} className="text-amber-400 fill-amber-400/40" />
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                      Pinned Notes
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                    {pinnedNotes.length}
                  </span>
                </div>

                {!pinnedCollapsed && (
                  <div className="space-y-1.5 pt-0.5">
                    {pinnedNotes.map((note) => renderNoteCard(note, true))}
                  </div>
                )}
              </div>
            )}

            {moduleSections.map((section) => {
              const isCollapsed = collapsedModules.has(section.name);

              return (
                <div key={section.name} className="space-y-1.5">
                  <div
                    onClick={() => toggleModuleCollapse(section.name)}
                    className="px-2 py-1.5 rounded-xl hover:bg-[#141f2e] transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-400 group-hover:text-white transition">
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      </span>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                        {section.name}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 font-bold px-1.5 py-0.2 rounded bg-[#172232]">
                      {section.notes.length}
                    </span>
                  </div>

                  {!isCollapsed && (
                    <div className="px-1">
                      <button
                        type="button"
                        onClick={() => {
                          setModalInitialModule(section.name);
                          setModalOpen(true);
                          setMobileSidebarOpen(false);
                        }}
                        className="w-full py-1.5 px-3 rounded-xl bg-[#1a2738] hover:bg-[#23354c] active:scale-[0.98] text-slate-300 hover:text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700/50"
                      >
                        <Plus size={13} />
                        <span>Add note</span>
                      </button>
                    </div>
                  )}

                  {!isCollapsed && (
                    <div className="space-y-1 pt-1">
                      {section.notes.map((note) => renderNoteCard(note, false))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      <div className="p-3 border-t border-slate-800/80 bg-[#0c131d] shrink-0">
        <button
          type="button"
          onClick={() => {
            setModalInitialModule(`Main module ${moduleSections.length + 1}`);
            setModalOpen(true);
            setMobileSidebarOpen(false);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-[#204938] hover:bg-[#1a3d2e] text-emerald-100 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <FolderPlus size={14} />
          <span>+ Add New Module Note</span>
        </button>
      </div>
    </div>
  );

  // Helper to render Document Content
  const renderDocument = () => {
    if (!activeNote) return null;

    return (
      <div className="space-y-7 print-area font-sans">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-900 tracking-tight leading-tight">
          {activeNote.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#c68a4c] text-white text-xs font-bold flex items-center justify-center shadow-xs">
              {activeNote.author?.initials || 'Y'}
            </div>
            <span className="text-xs sm:text-sm text-slate-700 font-semibold">
              {activeNote.author?.name || 'You'}
            </span>
          </div>

          <span className="text-xs text-slate-400 font-normal">
            • {activeNote.module || activeNote.topic}
          </span>

          <span className="text-xs text-slate-400 font-normal flex items-center gap-1">
            <Clock size={11} />
            {activeNote.dateDisplay || 'Recently updated'}
          </span>

          {pinnedNoteIds.has(activeNote._id) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Pin size={10} className="fill-amber-600" /> Pinned
            </span>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Purpose
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
            {activeNote.summary?.purpose || 'Add a purpose for this meeting.'}
          </p>
        </div>

        <div className="space-y-2.5">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Coverage goals
          </h2>
          {activeNote.summary?.coverageGoals?.length > 0 ? (
            <ol className="list-decimal list-outside pl-5 space-y-2 text-slate-700 text-sm sm:text-base leading-relaxed">
              {activeNote.summary.coverageGoals.map((goal, idx) => (
                <li key={idx} className="pl-1">
                  {goal}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-slate-400 text-sm italic">No coverage goals specified.</p>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Tooling decision
          </h2>
          {renderHighlightedDecision(activeNote.summary?.toolingDecision || 'Covered by Playwright — parallel run across Chromium, Firefox and WebKit.')}
        </div>

        <div className="space-y-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            Next step
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
            {activeNote.summary?.nextStep || 'Add a next step.'}
          </p>
        </div>

        {activeNote.summary?.customSections?.map((sec) => (
          <div
            key={sec.id}
            className={`space-y-2 transition relative group ${
              sec.type === 'callout'
                ? 'p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30'
                : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                {sec.type === 'callout' && <AlertCircle size={15} className="text-amber-600 shrink-0" />}
                <span>{sec.title}</span>
              </h2>

              <button
                type="button"
                onClick={() => promptDeleteSection(sec.id, sec.title)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer no-print"
                title="Delete this section"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {sec.type === 'bullets' ? (
              <ul className="list-disc list-outside pl-5 space-y-1 text-slate-700 text-sm sm:text-base leading-relaxed">
                {sec.content
                  ?.split('\n')
                  .filter(Boolean)
                  .map((bullet, bIdx) => (
                    <li key={bIdx} className="pl-1">
                      {bullet.replace(/^[-*•]\s*/, '')}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                {sec.content || 'No content added yet.'}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Helper to render Editor Form
  const renderEditor = () => (
    <div className="space-y-6 font-sans">
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-white border border-slate-300/80 shadow-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
          Format:
        </span>
        <button
          type="button"
          onClick={() => insertFormatting('**', '**')}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 cursor-pointer font-bold text-xs flex items-center gap-1"
          title="Bold"
        >
          <Bold size={13} />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('*', '*')}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 cursor-pointer text-xs flex items-center gap-1"
          title="Italic"
        >
          <Italic size={13} />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('- ')}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 cursor-pointer text-xs flex items-center gap-1"
          title="Bullet item"
        >
          <List size={13} />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('`', '`')}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 cursor-pointer text-xs flex items-center gap-1 font-mono"
          title="Inline Code"
        >
          <Code size={13} />
        </button>
        <button
          type="button"
          onClick={() => insertFormatting('> ')}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-slate-900 cursor-pointer text-xs flex items-center gap-1"
          title="Blockquote"
        >
          <Quote size={13} />
        </button>

        <div className="ml-auto text-[10px] text-slate-400 pr-2 hidden sm:block">
          Press <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[9px]">Ctrl+S</kbd> to save
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Note Title</label>
        <input
          type="text"
          name="title"
          ref={activeInputRef}
          value={editForm.title}
          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          className="w-full text-xl sm:text-2xl font-serif font-bold text-slate-900 bg-white border border-slate-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[#2f5547] shadow-xs"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Purpose</label>
        <textarea
          rows={3}
          name="purpose"
          ref={activeInputRef}
          value={editForm.purpose}
          onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
          className="w-full text-xs sm:text-sm text-slate-800 bg-white border border-slate-300 rounded-2xl p-3.5 focus:outline-none focus:border-[#2f5547] shadow-xs leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700">Coverage goals</label>
          <span className="text-[10px] text-slate-400">1 goal per line</span>
        </div>
        <textarea
          rows={4}
          name="coverageGoalsText"
          ref={activeInputRef}
          value={editForm.coverageGoalsText}
          onChange={(e) => setEditForm({ ...editForm, coverageGoalsText: e.target.value })}
          placeholder="Enter 1 goal per line..."
          className="w-full text-xs sm:text-sm font-mono text-slate-800 bg-white border border-slate-300 rounded-2xl p-3.5 focus:outline-none focus:border-[#2f5547] shadow-xs"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Tooling decision</label>
        <textarea
          rows={3}
          name="toolingDecision"
          ref={activeInputRef}
          value={editForm.toolingDecision}
          onChange={(e) => setEditForm({ ...editForm, toolingDecision: e.target.value })}
          className="w-full text-xs sm:text-sm text-slate-800 bg-white border border-slate-300 rounded-2xl p-3.5 focus:outline-none focus:border-[#2f5547] shadow-xs leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">Next step</label>
        <textarea
          rows={2}
          name="nextStep"
          ref={activeInputRef}
          value={editForm.nextStep}
          onChange={(e) => setEditForm({ ...editForm, nextStep: e.target.value })}
          className="w-full text-xs sm:text-sm text-slate-800 bg-white border border-slate-300 rounded-2xl p-3.5 focus:outline-none focus:border-[#2f5547] shadow-xs"
        />
      </div>

      {editForm.customSections?.map((sec) => (
        <div key={sec.id} className="p-4 rounded-2xl bg-white border border-slate-300 space-y-3 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={sec.title}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditForm((prev) => ({
                    ...prev,
                    customSections: prev.customSections.map((s) =>
                      s.id === sec.id ? { ...s, title: val } : s
                    ),
                  }));
                }}
                className="font-bold text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#2f5547]"
              />
              <select
                value={sec.type}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditForm((prev) => ({
                    ...prev,
                    customSections: prev.customSections.map((s) =>
                      s.id === sec.id ? { ...s, type: val } : s
                    ),
                  }));
                }}
                className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-700"
              >
                <option value="text">Paragraph</option>
                <option value="bullets">Bullets</option>
                <option value="callout">Callout</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => promptDeleteSection(sec.id, sec.title)}
              className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
              title="Remove section"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <textarea
            rows={3}
            value={sec.content}
            onChange={(e) => {
              const val = e.target.value;
              setEditForm((prev) => ({
                ...prev,
                customSections: prev.customSections.map((s) =>
                  s.id === sec.id ? { ...s, content: val } : s
                ),
              }));
            }}
            placeholder="Enter content..."
            className="w-full text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-[#2f5547] leading-relaxed"
          />
        </div>
      ))}

      <div className="pt-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setViewMode('view');
          }}
          className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => handleSaveSummary()}
          className="px-6 py-2.5 rounded-xl bg-[#2f5547] hover:bg-[#234237] active:scale-[0.98] text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-1.5"
        >
          <Save size={14} />
          <span>Save Changes (Ctrl+S)</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d141e] text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-[180] px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-fade-in ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-[#204938] text-emerald-100 border border-emerald-500/40'
          }`}
        >
          <CheckCircle2 size={16} />
          {toast.message}
        </div>
      )}

      {/* Mobile Top Navigation Header */}
      <div className="md:hidden flex items-center justify-between p-3.5 bg-[#0f1723] border-b border-slate-800 text-white shrink-0 sticky top-16 z-30 shadow-md no-print">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#172232] border border-slate-700 text-xs font-bold cursor-pointer hover:bg-[#1e2c40] transition"
        >
          <Menu size={14} />
          <span>QA-Notes ({filteredNotes.length})</span>
        </button>

        <span className="text-xs font-serif font-bold truncate max-w-[140px] text-slate-300">
          {activeNote ? activeNote.title : 'QA-Notes'}
        </span>

        <button
          type="button"
          onClick={() => {
            setModalInitialModule('Main module 1');
            setModalOpen(true);
          }}
          className="p-2 rounded-xl bg-[#204938] hover:bg-[#1a3d2e] text-white cursor-pointer transition shadow-xs"
          title="Add Note"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Mobile Off-Canvas Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex no-print">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderSidebar()}
          </div>
        </div>
      )}

      {/* Main Studio Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[calc(100vh-10rem)] bg-[#0f1723]">
          {/* DESKTOP LEFT SIDEBAR */}
          <div className="hidden md:flex w-80 lg:w-88 xl:w-96 border-r border-slate-800/80 shrink-0 bg-[#0f1723] no-print overflow-hidden min-w-0">
            {renderSidebar()}
          </div>

          {/* RIGHT WORKSPACE DOCUMENT STUDIO */}
          {activeNote ? (
            <div className="flex-1 bg-[#faf8f5] text-slate-900 flex flex-col min-w-0 overflow-hidden">
              {/* Workspace Top Action Bar */}
              <div className="border-b border-slate-200/90 bg-[#faf8f5] sticky top-0 z-20 shadow-xs no-print">
                <div className="px-4 sm:px-8 lg:px-10 py-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
                      <FileText size={14} className="text-[#204938]" />
                      <span>{viewMode === 'edit' ? 'Editing' : viewMode === 'split' ? 'Split View' : 'Document'}</span>
                    </div>

                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                      • {activeNote.module || activeNote.topic}
                    </span>

                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-slate-200/70 text-slate-600 text-[11px] font-mono font-medium">
                      <span>{noteStats.words} words</span>
                      <span>•</span>
                      <span>{noteStats.chars} chars</span>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    <div className="flex items-center p-0.5 rounded-xl bg-slate-200/70 border border-slate-300/80">
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode('view');
                          setIsEditing(false);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          viewMode === 'view'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Rendered Document View"
                      >
                        <Eye size={12} />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setViewMode('split');
                          setIsEditing(true);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          viewMode === 'split'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Side-by-side Edit and Live Preview"
                      >
                        <Columns size={12} />
                        <span className="hidden sm:inline">Split</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setViewMode('edit');
                          setIsEditing(true);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                          viewMode === 'edit'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Full Editor"
                      >
                        <Edit3 size={12} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => togglePinNote(activeNote._id, e)}
                      className={`p-1.5 px-2.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        pinnedNoteIds.has(activeNote._id)
                          ? 'border-amber-400 bg-amber-50 text-amber-800'
                          : 'border-slate-200 hover:bg-slate-100 text-slate-600 bg-white'
                      }`}
                      title={pinnedNoteIds.has(activeNote._id) ? 'Unpin note' : 'Pin note'}
                    >
                      <Pin size={13} className={pinnedNoteIds.has(activeNote._id) ? 'fill-amber-600 text-amber-600' : ''} />
                      <span className="hidden lg:inline">{pinnedNoteIds.has(activeNote._id) ? 'Pinned' : 'Pin'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowAddSection(!showAddSection)}
                      className="px-3 py-1.5 rounded-xl border border-[#2f5547]/40 bg-[#edf5f1] hover:bg-[#e0ece5] text-[#2f5547] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Add dynamic section"
                    >
                      <PlusCircle size={14} />
                      <span className="hidden sm:inline">+ Section</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="p-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition cursor-pointer shadow-xs bg-white"
                        title="Copy Markdown"
                      >
                        {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadMarkdown}
                        className="p-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition cursor-pointer shadow-xs bg-white"
                        title="Download Markdown file (.md)"
                      >
                        <Download size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={handlePrintNote}
                        className="p-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition cursor-pointer shadow-xs bg-white"
                        title="Print / Save as PDF"
                      >
                        <Printer size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDuplicateNote(activeNote, e)}
                        className="p-1.5 px-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition cursor-pointer shadow-xs bg-white"
                        title="Duplicate Note"
                      >
                        <CopyPlus size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (isEditing || viewMode !== 'view') {
                          handleSaveSummary();
                        } else {
                          setIsEditing(true);
                          setViewMode('edit');
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isEditing || viewMode !== 'view'
                          ? 'bg-[#204938] hover:bg-[#1a3d2e] text-white shadow-sm'
                          : 'border border-slate-200 hover:bg-slate-100 text-slate-700 bg-white'
                      }`}
                    >
                      {isEditing || viewMode !== 'view' ? <Save size={13} /> : <Edit3 size={13} />}
                      <span>{isEditing || viewMode !== 'view' ? 'Save Changes' : 'Edit Note'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {showAddSection && (
                <div className="mx-4 sm:mx-8 lg:mx-10 mt-4 p-5 rounded-3xl bg-white border-2 border-[#204938]/30 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 no-print">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-[#204938]" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Add New Dynamic Section
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddSection(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Templates:
                    </span>
                    {SECTION_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.title}
                        type="button"
                        onClick={() => {
                          setNewSectionTitle(tmpl.title);
                          setNewSectionType(tmpl.type);
                          setNewSectionContent(tmpl.placeholder);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer border border-slate-200"
                      >
                        {tmpl.title}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700">Section Title *</label>
                      <input
                        type="text"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        placeholder="e.g. Risk Analysis, Acceptance Criteria..."
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#204938]"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Section Type</label>
                      <select
                        value={newSectionType}
                        onChange={(e) => setNewSectionType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#204938]"
                      >
                        <option value="text">Paragraph Text</option>
                        <option value="bullets">Bullet List</option>
                        <option value="callout">Highlight Callout</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Content</label>
                    <textarea
                      rows={3}
                      value={newSectionContent}
                      onChange={(e) => setNewSectionContent(e.target.value)}
                      placeholder="Enter section content or notes..."
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#204938] leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddSection(false)}
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNewDynamicSection}
                      className="px-5 py-2 rounded-xl bg-[#204938] hover:bg-[#1a3d2e] text-white text-xs font-bold cursor-pointer transition shadow-sm"
                    >
                      + Add to Note
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
                {viewMode === 'split' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
                      <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                        <span>Editor</span>
                        <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
                      </h3>
                      {renderEditor()}
                    </div>

                    <div className="p-4 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-sm sticky top-4">
                      <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                        <span>Live Preview</span>
                        <span className="text-[10px] text-emerald-700 font-bold">Rendered Output</span>
                      </h3>
                      {renderDocument()}
                    </div>
                  </div>
                ) : viewMode === 'edit' ? (
                  <div className="max-w-3xl mx-auto p-4 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
                    {renderEditor()}
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    {renderDocument()}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200/90 bg-[#faf8f5] mt-auto no-print">
                <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-10 py-3.5 flex flex-wrap items-center justify-between gap-3 overflow-x-auto">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500 shrink-0">
                      Card Tag Color:
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      {COLOR_KEYS.map((colorKey) => {
                        const colorObj = TAG_COLOR_MAP[colorKey];
                        const isSelected = activeNote.tagColor === colorKey;

                        return (
                          <button
                            key={colorKey}
                            type="button"
                            onClick={() => handleTagColorChange(colorKey)}
                            className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${colorObj.bg} ${
                              isSelected ? 'ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-xs' : 'hover:scale-110 opacity-80'
                            }`}
                            title={`Set tag to ${colorObj.name}`}
                          >
                            {isSelected && (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Shortcuts:</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">Ctrl+S Save</kbd>
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono text-[10px]">Esc Cancel</kbd>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-[#faf8f5] flex flex-col items-center justify-center p-8 text-center text-slate-400 text-sm space-y-3">
              <FileText size={36} className="text-slate-300" />
              <p>Select a meeting note from the sidebar or click &quot;+ Add note&quot; to create one.</p>
              <button
                type="button"
                onClick={() => {
                  setModalInitialModule('Main module 1');
                  setModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#204938] text-white text-xs font-bold hover:bg-[#1a3d2e] transition cursor-pointer"
              >
                + Create Note
              </button>
            </div>
          )}
        </div>
      </div>

      <NewMeetingNoteModal
        isOpen={modalOpen}
        initialModule={modalInitialModule}
        onClose={() => setModalOpen(false)}
        onSuccess={(created) => {
          showToast(`✓ Created new note: "${created.title}"`);
          fetchNotes();
          setSelectedNoteId(created._id);
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.type === 'section' ? 'Delete Section' : 'Delete Meeting Note'}
        message={
          deleteModal.type === 'section'
            ? `Are you sure you want to remove the section "${deleteModal.sectionTitle}" from this note?`
            : `Are you sure you want to permanently remove "${deleteModal.noteTitle}"? All recorded summaries and custom sections will be lost.`
        }
        itemName={deleteModal.type === 'section' ? deleteModal.sectionTitle : deleteModal.noteTitle}
        onConfirm={executeDelete}
        onClose={() => setDeleteModal({ isOpen: false, type: 'note', noteId: null, noteTitle: '', sectionId: null, sectionTitle: '' })}
      />
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1723] text-slate-400 flex items-center justify-center">Loading QA-Notes...</div>}>
      <NotesContent />
    </Suspense>
  );
}
