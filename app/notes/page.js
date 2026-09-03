'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
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
  ListOrdered,
  AlignLeft,
  Sparkles
} from 'lucide-react';
import NewMeetingNoteModal from '@/components/notes/NewMeetingNoteModal';

const TAG_COLOR_MAP = {
  amber: {
    name: 'Amber',
    bg: 'bg-[#c68a4c]',
    border: 'border-[#c68a4c]',
    indicator: 'bg-[#c68a4c]',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  emerald: {
    name: 'Emerald',
    bg: 'bg-[#204938]',
    border: 'border-[#204938]',
    indicator: 'bg-[#204938]',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  rose: {
    name: 'Rose',
    bg: 'bg-[#b95748]',
    border: 'border-[#b95748]',
    indicator: 'bg-[#b95748]',
    badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
  blue: {
    name: 'Blue',
    bg: 'bg-[#4c76ba]',
    border: 'border-[#4c76ba]',
    indicator: 'bg-[#4c76ba]',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  slate: {
    name: 'Slate',
    bg: 'bg-[#545e6d]',
    border: 'border-[#545e6d]',
    indicator: 'bg-[#545e6d]',
    badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
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
  const [selectedModule, setSelectedModule] = useState(initialModuleParam);

  // Responsive Mobile Drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Collapsible tracking per module
  const [collapsedModules, setCollapsedModules] = useState(new Set());

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialModule, setModalInitialModule] = useState('Main module 1');

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    purpose: '',
    coverageGoalsText: '',
    toolingDecision: '',
    nextStep: '',
    customSections: [],
  });

  // New Dynamic Section Form State
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionType, setNewSectionType] = useState('text'); // 'text' | 'bullets' | 'callout'
  const [newSectionContent, setNewSectionContent] = useState('');

  const [copied, setCopied] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = mounted && session?.user?.role === 'ADMIN';

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedModule !== 'All') params.append('module', selectedModule);
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
  };

  useEffect(() => {
    if (isAdmin) {
      fetchNotes();
    }
  }, [selectedModule, isAdmin]);

  // Search debounce
  useEffect(() => {
    if (!isAdmin) return;
    const timer = setTimeout(() => {
      fetchNotes();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, isAdmin]);

  // Group notes into multiple dynamic module sections
  const moduleSections = useMemo(() => {
    const map = new Map();

    notes.forEach((note) => {
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
  }, [notes]);

  // Selected note object
  const activeNote = notes.find((n) => n._id === selectedNoteId) || notes[0] || null;

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

  // Sync edit form when active note changes
  useEffect(() => {
    if (activeNote) {
      setEditForm({
        title: activeNote.title || '',
        purpose: activeNote.summary?.purpose || '',
        coverageGoalsText: (activeNote.summary?.coverageGoals || []).join('\n'),
        toolingDecision: activeNote.summary?.toolingDecision || '',
        nextStep: activeNote.summary?.nextStep || '',
        customSections: activeNote.summary?.customSections || [],
      });
      setIsEditing(false);
      setShowAddSection(false);
    }
  }, [activeNote?._id]);

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

    // Optimistic UI update
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

  // Handle Save Edited Summary
  const handleSaveSummary = async (customSecsToSave = null) => {
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
        showToast('✓ Note summary saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save note:', err);
      showToast('Failed to save note', 'error');
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

    // Reset create state
    setNewSectionTitle('');
    setNewSectionContent('');
    setShowAddSection(false);

    // Save directly
    await handleSaveSummary(updatedSections);
    showToast(`✓ Added dynamic section: "${newSec.title}"`);
  };

  // Delete a Dynamic Section
  const handleDeleteDynamicSection = async (secId, secTitle) => {
    if (!confirm(`Delete section "${secTitle}"?`)) return;

    const updatedSections = (editForm.customSections || []).filter((s) => s.id !== secId);
    setEditForm((prev) => ({ ...prev, customSections: updatedSections }));
    await handleSaveSummary(updatedSections);
    showToast(`✓ Removed section "${secTitle}"`);
  };

  // Update Dynamic Section field while editing
  const handleUpdateDynamicSection = (secId, field, val) => {
    setEditForm((prev) => ({
      ...prev,
      customSections: prev.customSections.map((s) =>
        s.id === secId ? { ...s, [field]: val } : s
      ),
    }));
  };

  // Handle Delete Note
  const handleDeleteNote = async (noteId, noteTitle) => {
    if (!confirm(`Delete meeting note "${noteTitle}"?`)) return;

    setNotes((prev) => prev.filter((n) => n._id !== noteId));
    if (selectedNoteId === noteId) {
      const remaining = notes.filter((n) => n._id !== noteId);
      setSelectedNoteId(remaining[0]?._id || null);
    }

    try {
      await fetch(`/api/meeting-notes/${noteId}`, { method: 'DELETE' });
      showToast(`✓ Deleted "${noteTitle}"`);
      fetchNotes();
    } catch (err) {
      console.error('Failed to delete note:', err);
      showToast('Failed to delete note', 'error');
    }
  };

  // Copy Summary text to clipboard (including all dynamic custom sections)
  const handleCopySummary = () => {
    if (!activeNote) return;
    let text = `# ${activeNote.title}\nModule: ${activeNote.module || activeNote.topic}\n\n## Purpose\n${activeNote.summary?.purpose}\n\n## Coverage goals\n${activeNote.summary?.coverageGoals?.map((g, i) => `${i + 1}. ${g}`).join('\n')}\n\n## Tooling decision\n${activeNote.summary?.toolingDecision}\n\n## Next step\n${activeNote.summary?.nextStep}`;

    // Append dynamic custom sections
    if (activeNote.summary?.customSections?.length > 0) {
      activeNote.summary.customSections.forEach((sec) => {
        text += `\n\n## ${sec.title}\n${sec.content}`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Copied summary markdown to clipboard');
    setTimeout(() => setCopied(false), 2000);
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

  // Sidebar Content Component (Reusable for Desktop & Mobile Off-Canvas)
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0f1723] text-slate-100 font-sans select-none">
      {/* Header matching user screenshot */}
      <div className="p-4 pb-3 flex items-center justify-between border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-[#c68a4c] shadow-xs flex items-center justify-center text-[10px] font-bold text-white">
            QA
          </div>
          <span className="text-sm font-serif font-black tracking-tight text-white">
            QA-Notes
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </span>
          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 pb-3 shrink-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#172232] border border-slate-700/60 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-slate-500 transition"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Dynamic Module Sections List */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin text-emerald-400" />
            <span>Loading module sections...</span>
          </div>
        ) : moduleSections.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs space-y-3">
            <p>No notes or modules found.</p>
            <button
              type="button"
              onClick={() => {
                setModalInitialModule('Main module 1');
                setModalOpen(true);
                setMobileSidebarOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#365749] text-white text-xs font-bold hover:bg-[#2e4d3f] transition"
            >
              + Add first note
            </button>
          </div>
        ) : (
          moduleSections.map((section) => {
            const isCollapsed = collapsedModules.has(section.name);

            return (
              <div key={section.name} className="space-y-1.5">
                {/* Module Section Header */}
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

                {/* Section "+ Add note" Button */}
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

                {/* Section Notes List */}
                {!isCollapsed && (
                  <div className="space-y-1 pt-1">
                    {section.notes.map((note) => {
                      const isSelected = activeNote?._id === note._id;
                      const tagColorObj = TAG_COLOR_MAP[note.tagColor] || TAG_COLOR_MAP.emerald;

                      return (
                        <div
                          key={note._id}
                          onClick={() => {
                            setSelectedNoteId(note._id);
                            setMobileSidebarOpen(false);
                          }}
                          className={`group relative p-2.5 rounded-2xl transition cursor-pointer flex flex-col justify-between gap-1 ${
                            isSelected
                              ? 'bg-[#182637] border border-slate-700/80 shadow-md'
                              : 'hover:bg-[#141f2e] border border-transparent'
                          }`}
                        >
                          {/* Left Color Indicator Bar */}
                          <div
                            className={`absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full ${
                              isSelected
                                ? tagColorObj.indicator
                                : 'opacity-0 group-hover:opacity-40 bg-slate-600'
                            }`}
                          />

                          <div className="flex items-start justify-between gap-2 pl-2">
                            <h4
                              className={`text-xs font-bold leading-snug line-clamp-2 ${
                                isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                              }`}
                            >
                              {note.title}
                            </h4>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note._id, note.title);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer shrink-0"
                              title="Delete note"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between pl-2 pt-0.5">
                            <span className="text-[10px] text-slate-400 font-medium">
                              {note.dateDisplay || 'Just now'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Button: "+ New Module Note" */}
      <div className="p-3 border-t border-slate-800/60 bg-[#0c131d] shrink-0">
        <button
          type="button"
          onClick={() => {
            setModalInitialModule(`Main module ${moduleSections.length + 1}`);
            setModalOpen(true);
            setMobileSidebarOpen(false);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-[#365749] hover:bg-[#2d493d] text-emerald-100 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <FolderPlus size={14} />
          <span>+ Add New Module Note</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d141e] text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-[150] px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-fade-in ${
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
      <div className="md:hidden flex items-center justify-between p-3.5 bg-[#0f1723] border-b border-slate-800 text-white shrink-0 sticky top-16 z-30 shadow-md">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#172232] border border-slate-700 text-xs font-bold cursor-pointer hover:bg-[#1e2c40] transition"
        >
          <Menu size={14} />
          <span>QA-Notes ({notes.length})</span>
        </button>

        <span className="text-xs font-serif font-bold truncate max-w-[150px] text-slate-300">
          {activeNote ? activeNote.title : 'QA-Notes'}
        </span>

        <button
          type="button"
          onClick={() => {
            setModalInitialModule('Main module 1');
            setModalOpen(true);
          }}
          className="p-1.5 rounded-xl bg-[#365749] hover:bg-[#2e4d3f] text-white cursor-pointer transition shadow-xs"
          title="Add Note"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Mobile Off-Canvas Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Studio Container: Aligned with header max-w-7xl mx-auto */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[calc(100vh-10rem)] bg-[#0f1723]">
          {/* ════════════════════════════════════════════════════════════════ */}
          {/* DESKTOP LEFT SIDEBAR: ALIGNED WITH HEADER LOGO                   */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <div className="hidden md:flex w-72 lg:w-80 border-r border-slate-800/80 shrink-0 bg-[#0f1723]">
            <SidebarContent />
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* RIGHT WORKSPACE DOCUMENT STUDIO: SUMMARY FOCUS WITH DYNAMIC SECTIONS */}
          {/* ════════════════════════════════════════════════════════════════ */}
          {activeNote ? (
            <div className="flex-1 bg-[#faf8f5] text-slate-900 flex flex-col min-w-0">
              {/* Top Workspace Header Bar (Summary Dedicated) */}
              <div className="border-b border-slate-200/90 bg-[#faf8f5] sticky top-0 z-20 shadow-xs">
                <div className="px-4 sm:px-8 lg:px-10 py-3 flex items-center justify-between">
                  {/* Left: Summary Document Indicator */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
                      <FileText size={14} className="text-[#2f5547]" />
                      <span>Summary</span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                      • {activeNote.module || activeNote.topic}
                    </span>
                  </div>

                  {/* Right Header Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Add New Dynamic Section Button */}
                    <button
                      type="button"
                      onClick={() => setShowAddSection(!showAddSection)}
                      className="px-3 py-1.5 rounded-xl border border-[#2f5547]/40 bg-[#edf5f1] hover:bg-[#e0ece5] text-[#2f5547] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Add a new custom section dynamically"
                    >
                      <PlusCircle size={14} />
                      <span className="hidden sm:inline">+ Add Section</span>
                      <span className="sm:hidden">Section</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="p-1.5 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Copy Summary Markdown"
                    >
                      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span className="hidden sm:inline">Copy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (isEditing) {
                          handleSaveSummary();
                        } else {
                          setIsEditing(true);
                        }
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isEditing
                          ? 'bg-[#2f5547] text-white shadow-sm'
                          : 'border border-slate-200 hover:bg-slate-100 text-slate-700 bg-white'
                      }`}
                    >
                      {isEditing ? <Save size={13} /> : <Edit3 size={13} />}
                      <span>{isEditing ? 'Save Changes' : 'Edit Note'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Document Centered Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 space-y-7">
                {/* Dynamic Section Creator Panel (Collapsible) */}
                {showAddSection && (
                  <div className="p-5 rounded-3xl bg-white border-2 border-[#2f5547]/30 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-[#2f5547]" />
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

                    {/* Quick Template Chips */}
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
                      {/* Section Title Input */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">Section Title *</label>
                        <input
                          type="text"
                          value={newSectionTitle}
                          onChange={(e) => setNewSectionTitle(e.target.value)}
                          placeholder="e.g. Risk Analysis, Acceptance Criteria..."
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#2f5547]"
                          autoFocus
                        />
                      </div>

                      {/* Section Type Selector */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Section Type</label>
                        <select
                          value={newSectionType}
                          onChange={(e) => setNewSectionType(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#2f5547]"
                        >
                          <option value="text">Paragraph Text</option>
                          <option value="bullets">Bullet List</option>
                          <option value="callout">Highlight Callout</option>
                        </select>
                      </div>
                    </div>

                    {/* Section Initial Content */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Content</label>
                      <textarea
                        rows={3}
                        value={newSectionContent}
                        onChange={(e) => setNewSectionContent(e.target.value)}
                        placeholder="Enter section content or notes..."
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-[#2f5547] leading-relaxed"
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
                        className="px-5 py-2 rounded-xl bg-[#2f5547] hover:bg-[#254539] text-white text-xs font-bold cursor-pointer transition shadow-sm"
                      >
                        + Add to Note
                      </button>
                    </div>
                  </div>
                )}

                {/* Main Note Summary Document */}
                <div className="space-y-7 animate-fade-in">
                  {/* Note Title */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-slate-900 bg-white border border-slate-300 rounded-2xl px-4 py-2.5 focus:outline-none focus:border-[#2f5547] shadow-xs"
                    />
                  ) : (
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-slate-900 tracking-tight leading-tight">
                      {activeNote.title}
                    </h1>
                  )}

                  {/* Author Header */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#c68a4c] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                      {activeNote.author?.initials || 'Y'}
                    </div>
                    <span className="text-xs sm:text-sm text-slate-600 font-medium">
                      {activeNote.author?.name || 'You'}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">
                      • {activeNote.module || activeNote.topic}
                    </span>
                  </div>

                  {/* Section 1: Purpose */}
                  <div className="space-y-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      Purpose
                    </h2>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={editForm.purpose}
                        onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
                        className="w-full text-xs sm:text-sm text-slate-800 bg-white border border-slate-300 rounded-2xl p-3.5 focus:outline-none focus:border-[#2f5547] shadow-xs leading-relaxed"
                      />
                    ) : (
                      <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                        {activeNote.summary?.purpose || 'Add a purpose for this meeting.'}
                      </p>
                    )}
                  </div>

                  {/* Section 2: Coverage goals */}
                  <div className="space-y-2.5">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      Coverage goals
                    </h2>
                    {isEditing ? (
                      <textarea
                        rows={4}
                        value={editForm.coverageGoalsText}
                        onChange={(e) => setEditForm({ ...editForm, coverageGoalsText: e.target.value })}
                        placeholder="Enter 1 goal per line..."
                        className="w-full text-xs sm:text-sm font-mono text-slate-800 bg-white border border-slate-300 rounded-2xl p-3.5 focus:outline-none focus:border-[#2f5547] shadow-xs"
                      />
                    ) : (
                      <ol className="list-decimal list-outside pl-5 space-y-2 text-slate-700 text-sm sm:text-base leading-relaxed">
                        {activeNote.summary?.coverageGoals?.map((goal, idx) => (
                          <li key={idx} className="pl-1">
                            {goal}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>

                  {/* Section 3: Tooling decision */}
                  <div className="space-y-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      Tooling decision
                    </h2>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={editForm.toolingDecision}
                        onChange={(e) => setEditForm({ ...editForm, toolingDecision: e.target.value })}
                        className="w-full text-xs sm:text-sm text-slate-800 bg-white border border-slate-300 rounded-2xl p-3.5 focus:outline-none focus:border-[#2f5547] shadow-xs leading-relaxed"
                      />
                    ) : (
                      renderHighlightedDecision(activeNote.summary?.toolingDecision || 'Covered by Playwright — parallel run across Chromium, Firefox and WebKit.')
                    )}
                  </div>

                  {/* Section 4: Next step */}
                  <div className="space-y-2">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      Next step
                    </h2>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={editForm.nextStep}
                        onChange={(e) => setEditForm({ ...editForm, nextStep: e.target.value })}
                        className="w-full text-xs sm:text-sm text-slate-800 bg-white border border-slate-300 rounded-2xl p-3.5 focus:outline-none focus:border-[#2f5547] shadow-xs"
                      />
                    ) : (
                      <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                        {activeNote.summary?.nextStep || 'Add a next step.'}
                      </p>
                    )}
                  </div>

                  {/* ──────────────────────────────────────────────────────────── */}
                  {/* DYNAMIC CUSTOM SECTIONS LIST (ANY NEW TYPE/SECTION SIDE)     */}
                  {/* ──────────────────────────────────────────────────────────── */}
                  {(isEditing ? editForm.customSections : activeNote.summary?.customSections)?.map((sec) => (
                    <div
                      key={sec.id}
                      className={`space-y-2 transition relative group ${
                        sec.type === 'callout'
                          ? 'p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={sec.title}
                              onChange={(e) => handleUpdateDynamicSection(sec.id, 'title', e.target.value)}
                              className="font-bold text-sm sm:text-base text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#2f5547]"
                            />
                            <select
                              value={sec.type}
                              onChange={(e) => handleUpdateDynamicSection(sec.id, 'type', e.target.value)}
                              className="text-xs bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700"
                            >
                              <option value="text">Paragraph</option>
                              <option value="bullets">Bullets</option>
                              <option value="callout">Callout</option>
                            </select>
                          </div>
                        ) : (
                          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                            {sec.type === 'callout' && <AlertCircle size={15} className="text-amber-600 shrink-0" />}
                            <span>{sec.title}</span>
                          </h2>
                        )}

                        {/* Delete Section Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteDynamicSection(sec.id, sec.title)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          title="Delete this section"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Section Content Display / Edit */}
                      {isEditing ? (
                        <textarea
                          rows={3}
                          value={sec.content}
                          onChange={(e) => handleUpdateDynamicSection(sec.id, 'content', e.target.value)}
                          placeholder="Enter content..."
                          className="w-full text-xs sm:text-sm text-slate-800 bg-white border border-slate-300 rounded-2xl p-3.5 focus:outline-none focus:border-[#2f5547] shadow-xs leading-relaxed"
                        />
                      ) : sec.type === 'bullets' ? (
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

                  {/* Add New Section Inline Trigger */}
                  {!showAddSection && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddSection(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-slate-300 hover:border-[#2f5547] text-slate-600 hover:text-[#2f5547] text-xs font-bold transition cursor-pointer hover:bg-[#edf5f1]/50"
                      >
                        <PlusCircle size={15} />
                        <span>+ Add New Section to Summary</span>
                      </button>
                    </div>
                  )}

                  {/* Edit Mode Save Button */}
                  {isEditing && (
                    <div className="pt-4 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleSaveSummary()}
                        className="px-6 py-2.5 rounded-xl bg-[#2f5547] hover:bg-[#234237] text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Save size={14} />
                        <span>Save Note Summary</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ════════════════════════════════════════════════════════════ */}
              {/* BOTTOM FOOTER: TAG COLOR PICKER                             */}
              {/* ════════════════════════════════════════════════════════════ */}
              <div className="border-t border-slate-200/90 bg-[#faf8f5] mt-auto">
                <div className="max-w-4xl xl:max-w-5xl mx-auto px-4 sm:px-8 lg:px-10 py-4 flex items-center gap-3 overflow-x-auto">
                  <span className="text-xs font-semibold text-slate-500 shrink-0">
                    Tag color
                  </span>

                  <div className="flex items-center gap-2.5 shrink-0">
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
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-[#faf8f5] flex items-center justify-center p-8 text-center text-slate-400 text-sm">
              Select a meeting note from the sidebar or click &quot;+ Add note&quot; to create one.
            </div>
          )}
        </div>
      </div>

      {/* New Meeting Note Modal */}
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
