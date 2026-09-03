'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ClipboardList,
  X,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  FileText,
  Eye,
  Check,
  Sparkles,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import TestCasePreviewModal from './TestCasePreviewModal';

const MODULE_OPTIONS = [
  'Login',
  'Registration',
  'Checkout & Payment',
  'Dashboard & Analytics',
  'Search & Filter',
  'API Authentication',
  'User Profile & Settings',
  'Course Catalog',
  'Role-Based Access Control',
  'CI/CD Pipeline',
];

const FORMAT_OPTIONS = [
  { key: 'table', label: 'Table' },
  { key: 'excel', label: 'Excel' },
  { key: 'csv', label: 'CSV' },
  { key: 'plain_text', label: 'Plain Text' },
  { key: 'structured', label: 'Structured Format' },
];

export default function CreateTestCaseModal({
  isOpen,
  onClose,
  onSuccess,
  projectId = null,
  initialModule = 'Login',
}) {
  const [module, setModule] = useState(initialModule);
  const [customModule, setCustomModule] = useState('');
  const [scenarioId, setScenarioId] = useState('TS-LOGIN-002');
  const [testCaseId, setTestCaseId] = useState('TC-LOGIN-002');
  const [isManualId, setIsManualId] = useState(false);
  const [name, setName] = useState('');
  const [priority, setPriority] = useState('High');
  const [type, setType] = useState('Positive');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [activeFormat, setActiveFormat] = useState('structured');

  // History stack for Undo / Redo in the editor
  const [history, setHistory] = useState(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Fullscreen expansion mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);

  // Submission state
  const [loading, setLoading] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-generate Scenario ID and Test Case ID when module changes (if not manually overridden)
  useEffect(() => {
    if (!isOpen) return;
    const currentMod = module === 'Other' ? (customModule || 'GEN') : module;
    const cleanMod = currentMod.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7) || 'MOD';

    if (!isManualId) {
      setScenarioId(`TS-${cleanMod}-002`);
      setTestCaseId(`TC-${cleanMod}-002`);
    }
  }, [module, customModule, isOpen, isManualId]);

  // Handle content change with undo/redo history tracking
  const handleContentChange = (newVal) => {
    setContent(newVal);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newVal);
    // Keep last 30 history items
    if (newHistory.length > 30) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  // Load sample content from the API or local fallback
  const handleLoadSample = async (formatToLoad = activeFormat) => {
    try {
      setLoadingSample(true);
      setErrorMsg('');
      const targetMod = module === 'Other' ? (customModule || 'General') : module;
      const res = await fetch(
        `/api/test-cases/sample?format=${encodeURIComponent(formatToLoad)}&module=${encodeURIComponent(targetMod)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.sampleContent) {
          handleContentChange(data.sampleContent);
          setActiveFormat(formatToLoad);
          if (!name) {
            setName(`${targetMod}: Verify valid authentication and error handling`);
          }
          if (!description) {
            setDescription(`Automated end-to-end verification of ${targetMod} user flows and validation responses.`);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load sample:', err);
      // Fallback sample
      const fallback = `| Step | Action Description | Test Data / Input | Expected Result |
|---|---|---|---|
| 1 | Navigate to ${module} Screen | /${module.toLowerCase()} | Page loaded with form controls visible |
| 2 | Enter credentials | testuser@qarp.io | Input validates according to policy |
| 3 | Trigger action | Click Submit | Process executes and returns positive feedback |`;
      handleContentChange(fallback);
    } finally {
      setLoadingSample(false);
    }
  };

  // Form submission to API
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a Test Case Name.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const effectiveModule = module === 'Other' ? (customModule || 'General') : module;

      const payload = {
        module: effectiveModule,
        scenarioId: scenarioId.trim() || `TS-${effectiveModule.toUpperCase()}-001`,
        testCaseId: testCaseId.trim() || `TC-${effectiveModule.toUpperCase()}-001`,
        name: name.trim(),
        priority,
        type,
        description: description.trim(),
        content: content.trim(),
        format: activeFormat,
        projectId: projectId || null,
        status: 'Ready',
      };

      const res = await fetch('/api/test-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (onSuccess) onSuccess(data);
        onClose();
        // Reset form
        setName('');
        setDescription('');
        setContent('');
        setHistory(['']);
        setHistoryIndex(0);
        setIsManualId(false);
      } else {
        setErrorMsg(data.error || 'Failed to create test case');
      }
    } catch (err) {
      console.error('Error creating test case:', err);
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
        <div
          className={`relative w-full bg-[#0c1120] text-slate-100 border border-purple-500/30 rounded-3xl shadow-2xl transition-all duration-300 flex flex-col my-auto ${
            isFullscreen
              ? 'max-w-[98vw] h-[95vh]'
              : 'max-w-3xl max-h-[92vh]'
          }`}
        >
          {/* ── MODAL HEADER ────────────────────────────────────────────── */}
          <div className="p-6 pb-4 border-b border-slate-800/80 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center text-white shadow-lg shadow-purple-950/60 shrink-0">
                <ClipboardList size={22} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  Create New Test Case
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Fill in the details to create a structured test case.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer border border-slate-700/60"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── MODAL BODY ──────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Row 1: Module * & Scenario ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Module <span className="text-purple-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={module}
                    onChange={(e) => setModule(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition appearance-none cursor-pointer"
                  >
                    {MODULE_OPTIONS.map((mod) => (
                      <option key={mod} value={mod} className="bg-slate-900 text-white">
                        {mod}
                      </option>
                    ))}
                    <option value="Other" className="bg-slate-900 text-purple-300">
                      + Custom Module...
                    </option>
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
                {module === 'Other' && (
                  <input
                    type="text"
                    placeholder="Enter Custom Module Name"
                    value={customModule}
                    onChange={(e) => setCustomModule(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2 rounded-xl bg-slate-950 border border-purple-500/50 text-xs text-white focus:outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Scenario ID
                </label>
                <input
                  type="text"
                  value={scenarioId}
                  onChange={(e) => {
                    setScenarioId(e.target.value);
                    setIsManualId(true);
                  }}
                  placeholder="TS-LOGIN-002"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-purple-500 transition"
                />
              </div>
            </div>

            {/* Row 2: Test Case ID (Auto-generated) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Test Case ID <span className="text-slate-400 font-normal">(Auto-generated)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={testCaseId}
                  onChange={(e) => {
                    setTestCaseId(e.target.value);
                    setIsManualId(true);
                  }}
                  placeholder="TC-LOGIN-002"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-purple-500 transition"
                />
                {isManualId && (
                  <button
                    type="button"
                    onClick={() => setIsManualId(false)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                  >
                    Reset Auto
                  </button>
                )}
              </div>
            </div>

            {/* Row 3: Test Case Name * */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Test Case Name <span className="text-purple-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Login with valid Email ID and invalid password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
                required
              />
            </div>

            {/* Row 4: Priority & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Priority</label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition appearance-none cursor-pointer"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Type</label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition appearance-none cursor-pointer"
                  >
                    <option value="Positive">Positive</option>
                    <option value="Negative">Negative</option>
                    <option value="Boundary">Boundary</option>
                    <option value="Edge Case">Edge Case</option>
                    <option value="Security">Security</option>
                    <option value="Performance">Performance</option>
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {/* Row 5: Description */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the test objective..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition resize-y"
              />
            </div>

            {/* ── TEST CASE CONTENT CARD (EXACT AS SCREENSHOT) ─────────── */}
            <div className="rounded-2xl border border-purple-500/35 bg-gradient-to-b from-[#11172a] to-[#0d1322] p-4 sm:p-5 space-y-3.5 shadow-lg">
              {/* Content Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <ClipboardList size={14} />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Test Case Content
                  </h3>
                </div>

                {/* Undo, Redo, Fullscreen Action Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className={`p-1.5 rounded-lg border text-slate-300 transition ${
                      historyIndex <= 0
                        ? 'opacity-30 border-transparent cursor-not-allowed'
                        : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 cursor-pointer'
                    }`}
                    title="Undo"
                  >
                    <RotateCcw size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className={`p-1.5 rounded-lg border text-slate-300 transition ${
                      historyIndex >= history.length - 1
                        ? 'opacity-30 border-transparent cursor-not-allowed'
                        : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 cursor-pointer'
                    }`}
                    title="Redo"
                  >
                    <RotateCw size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer"
                    title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
                  >
                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                </div>
              </div>

              {/* Paste Instructions & Format Pills */}
              <div>
                <div className="text-xs text-slate-400 font-medium">
                  Paste test cases in any format
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-purple-300 font-medium mt-1">
                  {FORMAT_OPTIONS.map((f, idx) => (
                    <React.Fragment key={f.key}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFormat(f.key);
                          handleLoadSample(f.key);
                        }}
                        className={`hover:underline cursor-pointer transition ${
                          activeFormat === f.key
                            ? 'text-purple-300 font-bold underline'
                            : 'text-purple-400/80 hover:text-purple-200'
                        }`}
                        title={`Click to load ${f.label} template`}
                      >
                        {f.label}
                      </button>
                      {idx < FORMAT_OPTIONS.length - 1 && (
                        <span className="text-slate-600">/</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Content Textarea */}
              <div className="relative">
                <textarea
                  rows={isFullscreen ? 16 : 6}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={`Paste your test case content here...\n\nYou can edit, update, or format the pasted content.`}
                  className="w-full p-4 rounded-xl bg-[#090d19] border border-purple-500/40 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-500/50 transition leading-relaxed"
                />
              </div>
            </div>
          </form>

          {/* ── MODAL FOOTER ────────────────────────────────────────────── */}
          <div className="p-6 pt-4 border-t border-slate-800/80 bg-[#0c1120] flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleLoadSample(activeFormat)}
                disabled={loadingSample}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loadingSample ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <FileText size={14} />
                )}
                <span>Load Sample</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition cursor-pointer shadow-sm"
              >
                <Eye size={14} />
                <span>Preview</span>
              </button>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700/60 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-[0.98] text-white text-xs font-bold transition shadow-lg shadow-purple-950/60 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Check size={15} />
                    <span>Create Test Case</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      <TestCasePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        testCaseData={{
          module: module === 'Other' ? (customModule || 'General') : module,
          scenarioId,
          testCaseId,
          name: name || 'Test Case Live Preview',
          priority,
          type,
          description,
          content,
          format: activeFormat,
        }}
      />
    </>
  );
}
