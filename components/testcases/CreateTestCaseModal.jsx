'use client';

import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  ArrowRight,
  Database,
  Layers,
  Wand2,
  Sliders,
  CheckCircle2,
  Shield,
  AlertTriangle,
  FileCode,
} from 'lucide-react';
import TestCasePreviewModal from './TestCasePreviewModal';

const MODULE_OPTIONS = [
  'Login',
  'Registration',
  'Academic Master',
  'Programs',
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

const QUICK_PROMPTS = [
  {
    label: '🎓 Academic Program Creation',
    module: 'Academic Master',
    prompt: 'User creates a new Academic Program with Program Name, alphanumeric Code, Credits, Department dropdown, and active status validation.',
  },
  {
    label: '🔐 User Login & MFA',
    module: 'Login',
    prompt: 'User authenticates with email and password, receives 6-digit MFA OTP on email, and gets account locked after 3 consecutive failed attempts.',
  },
  {
    label: '💳 Stripe Checkout & Webhook',
    module: 'Checkout & Payment',
    prompt: 'Learner enrolls in a paid course, enters card details via Stripe checkout, verifies 3D Secure authentication, and triggers webhook to grant course access.',
  },
  {
    label: '🔎 Search & Filter Matrix',
    module: 'Search & Filter',
    prompt: 'Search catalog with keywords, apply multiple category checkboxes and difficulty filters, and verify accurate results with pagination.',
  },
];

const TEST_TYPE_OPTIONS = ['Positive', 'Negative', 'Boundary', 'Security', 'Edge Case'];

export default function CreateTestCaseModal({
  isOpen,
  onClose,
  onSuccess,
  projectId = null,
  initialModule = 'Login',
  initialTab = 'manual',
  initialSuite = '',
}) {
  // Mode switcher: 'suite' | 'manual' | 'ai'
  const [activeTab, setActiveTab] = useState(initialTab);

  // Common Suite States
  const [suiteName, setSuiteName] = useState(initialSuite || '');

  // ── Test Suite Creator States ──────────────────────────────────────────
  const [suiteTitle, setSuiteTitle] = useState(initialSuite || `${initialModule} Test Suite`);
  const [suiteModule, setSuiteModule] = useState(initialModule);
  const [suiteCustomModule, setSuiteCustomModule] = useState('');
  const [suiteDescription, setSuiteDescription] = useState(`Comprehensive automated & manual test coverage for ${initialModule} user journeys, validation rules, and security policies.`);
  const [suiteItems, setSuiteItems] = useState([
    {
      id: 'item-1',
      name: `Verify successful submission of ${initialModule} with valid mandatory and optional fields`,
      type: 'Positive',
      priority: 'Critical',
      description: `Validate that user can fill all required ${initialModule} fields with standard valid data, trigger save action, and verify that the system persists the data and displays a success confirmation.`,
      format: 'table',
      stepsCount: 4,
      selected: true,
    },
    {
      id: 'item-2',
      name: `Verify ${initialModule} auto-formatting, field trimming, and casing normalization`,
      type: 'Positive',
      priority: 'High',
      description: `Ensure leading/trailing whitespaces in inputs are automatically trimmed before persistence, and codes are converted to uppercase.`,
      format: 'table',
      stepsCount: 2,
      selected: true,
    },
    {
      id: 'item-3',
      name: `Verify inline validation when mandatory ${initialModule} fields are left blank`,
      type: 'Negative',
      priority: 'High',
      description: `Validate that submitting an empty form triggers mandatory validation warnings on all required inputs and blocks form submission.`,
      format: 'table',
      stepsCount: 2,
      selected: true,
    },
    {
      id: 'item-4',
      name: `Verify system rejection when attempting to create duplicate ${initialModule} identifier`,
      type: 'Negative',
      priority: 'High',
      description: `Ensure the system enforces uniqueness constraint on ${initialModule} code / ID and rejects duplicate submissions with a descriptive error.`,
      format: 'table',
      stepsCount: 2,
      selected: true,
    },
    {
      id: 'item-5',
      name: `Verify boundary limit constraints for ${initialModule} name and description fields`,
      type: 'Boundary',
      priority: 'Medium',
      description: `Validate field behavior at minimum threshold (2 characters) and maximum permitted character boundary (e.g. 100/500 characters).`,
      format: 'table',
      stepsCount: 4,
      selected: true,
    },
    {
      id: 'item-6',
      name: `Verify XSS sanitization and HTML injection prevention in ${initialModule} inputs`,
      type: 'Security',
      priority: 'Critical',
      description: `Validate that user cannot inject executable JavaScript or malicious HTML payloads into ${initialModule} text fields.`,
      format: 'table',
      stepsCount: 2,
      selected: true,
    },
    {
      id: 'item-7',
      name: `Verify unauthorized role cannot access or mutate ${initialModule} operations`,
      type: 'Security',
      priority: 'High',
      description: `Ensure non-admin users or unauthenticated sessions receive 401/403 Forbidden when attempting to create, update, or delete ${initialModule}.`,
      format: 'table',
      stepsCount: 2,
      selected: true,
    },
    {
      id: 'item-8',
      name: `Verify idempotency and prevention of duplicate submission on double-clicking Submit`,
      type: 'Edge Case',
      priority: 'Medium',
      description: `Validate that rapid multiple clicks on Submit button do not trigger multiple network requests or create duplicate entries in the database.`,
      format: 'table',
      stepsCount: 2,
      selected: true,
    },
  ]);
  const [suiteSaving, setSuiteSaving] = useState(false);

  // Manual Form States
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

  // History stack for Undo / Redo in manual editor
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

  // ── AI Generator States ────────────────────────────────────────────────
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiModule, setAiModule] = useState(initialModule);
  const [aiCustomModule, setAiCustomModule] = useState('');
  const [aiTypes, setAiTypes] = useState(['Positive', 'Negative', 'Boundary', 'Security']);
  const [aiCount, setAiCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGeneratedList, setAiGeneratedList] = useState([]);
  const [aiSelectedIndices, setAiSelectedIndices] = useState(new Set());
  const [aiExpandedIndex, setAiExpandedIndex] = useState(null);
  const [aiSavingBatch, setAiSavingBatch] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  // Sync initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setAiModule(initialModule);
      setModule(initialModule);
      setSuiteModule(initialModule);
      setSuiteTitle(initialSuite || `${initialModule} Test Suite`);
      setSuiteName(initialSuite || `${initialModule} Test Suite`);
      setErrorMsg('');
      setAiSuccessMsg('');
    }
  }, [isOpen, initialTab, initialModule, initialSuite]);

  // Update suite templates whenever suiteModule changes
  useEffect(() => {
    const mod = suiteModule === 'Other' ? (suiteCustomModule || 'Module') : suiteModule;
    setSuiteTitle(initialSuite || `${mod} Test Suite`);
    setSuiteDescription(`Comprehensive automated & manual test coverage for ${mod} user journeys, validation rules, and security policies.`);
    setSuiteItems([
      {
        id: 'item-1',
        name: `Verify successful submission of ${mod} with valid mandatory and optional fields`,
        type: 'Positive',
        priority: 'Critical',
        description: `Validate that user can fill all required ${mod} fields with standard valid data, trigger save action, and verify that the system persists the data and displays a success confirmation.`,
        format: 'table',
        stepsCount: 4,
        selected: true,
      },
      {
        id: 'item-2',
        name: `Verify ${mod} auto-formatting, field trimming, and casing normalization`,
        type: 'Positive',
        priority: 'High',
        description: `Ensure leading/trailing whitespaces in inputs are automatically trimmed before persistence, and codes are converted to uppercase.`,
        format: 'table',
        stepsCount: 2,
        selected: true,
      },
      {
        id: 'item-3',
        name: `Verify inline validation when mandatory ${mod} fields are left blank`,
        type: 'Negative',
        priority: 'High',
        description: `Validate that submitting an empty form triggers mandatory validation warnings on all required inputs and blocks form submission.`,
        format: 'table',
        stepsCount: 2,
        selected: true,
      },
      {
        id: 'item-4',
        name: `Verify system rejection when attempting to create duplicate ${mod} identifier`,
        type: 'Negative',
        priority: 'High',
        description: `Ensure the system enforces uniqueness constraint on ${mod} code / ID and rejects duplicate submissions with a descriptive error.`,
        format: 'table',
        stepsCount: 2,
        selected: true,
      },
      {
        id: 'item-5',
        name: `Verify boundary limit constraints for ${mod} name and description fields`,
        type: 'Boundary',
        priority: 'Medium',
        description: `Validate field behavior at minimum threshold (2 characters) and maximum permitted character boundary (e.g. 100/500 characters).`,
        format: 'table',
        stepsCount: 4,
        selected: true,
      },
      {
        id: 'item-6',
        name: `Verify XSS sanitization and HTML injection prevention in ${mod} inputs`,
        type: 'Security',
        priority: 'Critical',
        description: `Validate that user cannot inject executable JavaScript or malicious HTML payloads into ${mod} text fields.`,
        format: 'table',
        stepsCount: 2,
        selected: true,
      },
      {
        id: 'item-7',
        name: `Verify unauthorized role cannot access or mutate ${mod} operations`,
        type: 'Security',
        priority: 'High',
        description: `Ensure non-admin users or unauthenticated sessions receive 401/403 Forbidden when attempting to create, update, or delete ${mod}.`,
        format: 'table',
        stepsCount: 2,
        selected: true,
      },
      {
        id: 'item-8',
        name: `Verify idempotency and prevention of duplicate submission on double-clicking Submit`,
        type: 'Edge Case',
        priority: 'Medium',
        description: `Validate that rapid multiple clicks on Submit button do not trigger multiple network requests or create duplicate entries in the database.`,
        format: 'table',
        stepsCount: 2,
        selected: true,
      },
    ]);
  }, [suiteModule, suiteCustomModule]);

  // Auto-generate Scenario ID and Test Case ID when module changes
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

  // Load sample content
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
      const fallback = `| Step | Action Description | Test Data / Input | Expected Result |\n|---|---|---|---|\n| 1 | Navigate to ${module} Screen | /${module.toLowerCase()} | Page loaded with form controls visible |\n| 2 | Enter credentials | testuser@qarp.io | Input validates according to policy |\n| 3 | Trigger action | Click Submit | Process executes and returns positive feedback |`;
      handleContentChange(fallback);
    } finally {
      setLoadingSample(false);
    }
  };

  // ─── SAVE TEST SUITE / SECTION ─────────────────────────────────────────
  const handleSaveTestSuite = async () => {
    const selected = suiteItems.filter(i => i.selected);
    if (selected.length === 0) {
      setErrorMsg('Please select at least one test case to include in this Test Suite.');
      return;
    }

    try {
      setSuiteSaving(true);
      setErrorMsg('');

      const targetMod = suiteModule === 'Other' ? (suiteCustomModule || 'General') : suiteModule;
      const cleanMod = targetMod.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'GEN';
      const finalSuiteName = suiteTitle.trim() || `${targetMod} Test Suite`;

      const payload = selected.map((item, idx) => {
        const numStr = String(idx + 1).padStart(3, '0');
        const tcId = `TC-${cleanMod}-${numStr}`;
        const tsId = `TS-${cleanMod}-${numStr}`;

        return {
          module: targetMod,
          suite: finalSuiteName,
          scenarioId: tsId,
          testCaseId: tcId,
          name: item.name,
          priority: item.priority,
          type: item.type,
          description: item.description,
          format: item.format || 'table',
          content: `| Step | Action Description | Test Data / Input | Expected Result |\n|---|---|---|---|\n| 1 | Navigate to ${targetMod} interface | /${targetMod.toLowerCase().replace(/[^a-z0-9]/g, '-')} | Interface renders with required form elements |\n| 2 | Perform ${item.type} action for: ${item.name} | Standard Input Data | System evaluates business rules accurately |\n| 3 | Verify outcome and confirmation | Expected Response | Result matches criteria without system errors |`,
          projectId: projectId || null,
          status: 'Ready',
        };
      });

      const res = await fetch('/api/test-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        if (onSuccess) onSuccess({ ...data, suiteName: finalSuiteName, count: selected.length });
        onClose();
      } else {
        setErrorMsg(data.error || 'Failed to save Test Suite');
      }
    } catch (err) {
      console.error('Error creating test suite:', err);
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setSuiteSaving(false);
    }
  };

  // Manual Form submission
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
      const finalSuite = suiteName.trim() || (effectiveModule ? `${effectiveModule} Test Suite` : 'General Test Suite');

      const payload = {
        module: effectiveModule,
        suite: finalSuite,
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

  // ─── AI GENERATOR ACTIONS ──────────────────────────────────────────────
  const toggleAiType = (t) => {
    setAiTypes((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      setErrorMsg('Please enter a feature description or select a prompt template.');
      return;
    }

    try {
      setAiLoading(true);
      setErrorMsg('');
      setAiSuccessMsg('');
      const targetMod = aiModule === 'Other' ? (aiCustomModule || 'Custom') : aiModule;

      const res = await fetch('/api/test-cases/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          module: targetMod,
          types: aiTypes.length > 0 ? aiTypes : ['Positive', 'Negative'],
          count: aiCount,
          projectId: projectId || null,
        }),
      });

      const data = await res.json();

      if (res.ok && Array.isArray(data.testCases)) {
        setAiGeneratedList(data.testCases);
        setAiSelectedIndices(new Set(data.testCases.map((_, i) => i)));
        setAiExpandedIndex(0);
        setAiSuccessMsg(`✨ Successfully generated ${data.testCases.length} test cases!`);
      } else {
        setErrorMsg(data.error || 'Failed to generate test cases.');
      }
    } catch (err) {
      console.error('AI Generation Error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during AI generation.');
    } finally {
      setAiLoading(false);
    }
  };

  const toggleSelectIndex = (idx) => {
    setAiSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (aiSelectedIndices.size === aiGeneratedList.length) {
      setAiSelectedIndices(new Set());
    } else {
      setAiSelectedIndices(new Set(aiGeneratedList.map((_, i) => i)));
    }
  };

  const handleUseInManualEditor = (tc) => {
    setName(tc.name);
    setModule(tc.module);
    setScenarioId(tc.scenarioId);
    setTestCaseId(tc.testCaseId);
    setPriority(tc.priority);
    setType(tc.type);
    setDescription(tc.description);
    setContent(tc.content);
    setActiveFormat('table');
    setActiveTab('manual');
    setErrorMsg('');
  };

  const handleSaveBatchToDatabase = async () => {
    const selectedCases = aiGeneratedList.filter((_, idx) => aiSelectedIndices.has(idx));
    if (selectedCases.length === 0) {
      setErrorMsg('Please select at least one test case to save.');
      return;
    }

    try {
      setAiSavingBatch(true);
      setErrorMsg('');

      const res = await fetch('/api/test-cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testCases: selectedCases.map((c) => ({
            ...c,
            projectId: projectId || null,
            status: 'Ready',
          })),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setAiSuccessMsg(`✓ Saved ${data.count || selectedCases.length} test cases to matrix!`);
        setTimeout(() => {
          if (onSuccess) onSuccess(data);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Failed to save test cases');
      }
    } catch (err) {
      console.error('Batch Save Error:', err);
      setErrorMsg(err.message || 'Failed to save test cases');
    } finally {
      setAiSavingBatch(false);
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
          <div className="p-5 sm:p-6 pb-4 border-b border-slate-800/80 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center text-white shadow-lg shadow-purple-950/60 shrink-0">
                {activeTab === 'suite' ? <Layers size={22} /> : activeTab === 'ai' ? <Wand2 size={22} /> : <ClipboardList size={22} />}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  {activeTab === 'suite' ? 'Create Complete Test Suite' : activeTab === 'ai' ? 'AI Test Case Generator' : 'Create New Test Case'}
                  {activeTab === 'suite' && (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Section Suite
                    </span>
                  )}
                  {activeTab === 'ai' && (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-sm">
                      Smart AI
                    </span>
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  {activeTab === 'suite'
                    ? 'Create, configure, and batch-save a complete structured Test Suite Section with full QA coverage.'
                    : activeTab === 'ai'
                    ? 'Synthesize positive, negative, boundary, and security test cases instantly from requirements.'
                    : 'Fill in the details or paste structured test steps to create a test case.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer border border-slate-700/60"
                title="Close (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* ── TAB SWITCHER ────────────────────────────────────────────── */}
          <div className="px-6 pt-3 pb-1 border-b border-slate-800/60 bg-[#090d1a] flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('suite')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'suite'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/60'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Layers size={13} />
                <span>📦 Create Test Suite</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'manual'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-950/60'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <FileCode size={13} />
                <span>✍️ Single Case</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'ai'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/60'
                    : 'bg-purple-500/10 text-purple-300 hover:text-white border border-purple-500/30'
                }`}
              >
                <Sparkles size={13} className="text-cyan-400" />
                <span>✨ AI Suite Generator</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold border border-cyan-500/30">
                  NEW
                </span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 hidden sm:block">
              {activeTab === 'suite'
                ? 'Cohesive multi-case Suite Section'
                : activeTab === 'ai'
                ? 'Multi-scenario requirement synthesis'
                : 'Custom single test case'}
            </div>
          </div>

          {/* ── MESSAGES BAR ────────────────────────────────────────────── */}
          {errorMsg && (
            <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {aiSuccessMsg && (
            <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
              <span>{aiSuccessMsg}</span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* TAB 0: CREATE TEST SUITE SECTION                               */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'suite' ? (
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    Test Suite / Section Title <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={suiteTitle}
                    onChange={(e) => setSuiteTitle(e.target.value)}
                    placeholder="e.g. Academic Master Management Suite"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    Target Module <span className="text-purple-400">*</span>
                  </label>
                  <select
                    value={suiteModule}
                    onChange={(e) => setSuiteModule(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  >
                    {MODULE_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="Other">Custom Module...</option>
                  </select>
                </div>
              </div>

              {suiteModule === 'Other' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-200">
                    Custom Module Name
                  </label>
                  <input
                    type="text"
                    value={suiteCustomModule}
                    onChange={(e) => setSuiteCustomModule(e.target.value)}
                    placeholder="e.g. Fee Master / Batch Processing"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
                  Suite Scope &amp; Description
                </label>
                <textarea
                  rows={2}
                  value={suiteDescription}
                  onChange={(e) => setSuiteDescription(e.target.value)}
                  placeholder="Describe the coverage goals, preconditions, or domain area for this suite..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Suite Case Templates Checklist */}
              <div className="space-y-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Included Test Cases in this Suite Section</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {suiteItems.filter(i => i.selected).length} Selected
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Standard enterprise QA matrix cases auto-generated for this suite. Check/uncheck to customize.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const allSelected = suiteItems.every(i => i.selected);
                      setSuiteItems(suiteItems.map(i => ({ ...i, selected: !allSelected })));
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                  >
                    {suiteItems.every(i => i.selected) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {suiteItems.map((item, idx) => {
                    const typeColor =
                      item.type === 'Positive'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : item.type === 'Negative'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        : item.type === 'Security'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-purple-500/15 text-purple-300 border-purple-500/30';

                    return (
                      <div
                        key={item.id || idx}
                        onClick={() => {
                          setSuiteItems(suiteItems.map((it, i) => i === idx ? { ...it, selected: !it.selected } : it));
                        }}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                          item.selected
                            ? 'bg-slate-900/90 border-purple-500/40 shadow-sm'
                            : 'bg-slate-950/50 border-slate-800/60 opacity-60'
                        }`}
                      >
                        <div className="mt-0.5 text-purple-400 shrink-0">
                          {item.selected ? <CheckSquare size={18} /> : <Square size={18} />}
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              #{idx + 1}
                            </span>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${typeColor}`}>
                              {item.type}
                            </span>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                              {item.priority}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {item.stepsCount || 3} Steps
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white leading-snug">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : activeTab === 'ai' ? (
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Requirement / Feature Prompt Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200">
                    Feature Description / User Story <span className="text-purple-400">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Be as descriptive as you like</span>
                </div>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. User creates a new Academic Program with program name, alphanumeric code, department dropdown, total credits, and active status validation..."
                  className="w-full p-3.5 rounded-2xl bg-slate-950/90 border border-purple-500/40 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-500/50 transition leading-relaxed"
                />
              </div>

              {/* Quick Template Chips */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-purple-400" /> Quick Scenario Templates:
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((qp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAiPrompt(qp.prompt);
                        setAiModule(qp.module);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-[11px] font-medium text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <span>{qp.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Configuration Row: Module, Scenario Types, Count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* Module */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Target Module</label>
                  <select
                    value={aiModule}
                    onChange={(e) => setAiModule(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
                  >
                    {MODULE_OPTIONS.map((m) => (
                      <option key={m} value={m} className="bg-slate-900 text-white">
                        {m}
                      </option>
                    ))}
                    <option value="Other" className="bg-slate-900 text-purple-300">
                      + Custom Module...
                    </option>
                  </select>
                  {aiModule === 'Other' && (
                    <input
                      type="text"
                      placeholder="Enter custom module"
                      value={aiCustomModule}
                      onChange={(e) => setAiCustomModule(e.target.value)}
                      className="w-full mt-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-purple-500/40 text-xs text-white"
                    />
                  )}
                </div>

                {/* Scenario Types (Pills) */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">Test Types to Cover</label>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {TEST_TYPE_OPTIONS.map((t) => {
                      const isSelected = aiTypes.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleAiType(t)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                            isSelected
                              ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {isSelected ? <Check size={12} className="text-purple-400" /> : <div className="w-3 h-3 rounded-full border border-slate-700" />}
                          <span>{t}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quantity & Generate Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-900 to-indigo-950/30 border border-purple-500/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">Generate:</span>
                  {[3, 5, 8].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAiCount(c)}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                        aiCount === c
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-950/50'
                          : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {c} Cases
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={aiLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-black flex items-center justify-center gap-2 transition shadow-lg shadow-purple-950/60 cursor-pointer disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Synthesizing Test Suite...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={15} />
                      <span>✨ Generate Test Cases</span>
                    </>
                  )}
                </button>
              </div>

              {/* ── GENERATED TEST CASES RESULTS ──────────────────────────── */}
              {aiGeneratedList.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        Generated Test Cases ({aiGeneratedList.length})
                      </span>
                      <span className="text-[11px] text-purple-400 font-semibold">
                        ({aiSelectedIndices.size} selected)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-xs text-purple-400 hover:text-purple-300 font-bold underline cursor-pointer"
                    >
                      {aiSelectedIndices.size === aiGeneratedList.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {aiGeneratedList.map((tc, idx) => {
                      const isSelected = aiSelectedIndices.has(idx);
                      const isExpanded = aiExpandedIndex === idx;

                      const typeColor =
                        tc.type === 'Positive'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : tc.type === 'Negative'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : tc.type === 'Security'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';

                      return (
                        <div
                          key={idx}
                          className={`rounded-2xl border transition ${
                            isSelected
                              ? 'bg-slate-900/90 border-purple-500/40 shadow-md'
                              : 'bg-slate-950/60 border-slate-800/70 opacity-70'
                          }`}
                        >
                          {/* Card Summary Header */}
                          <div className="p-3.5 flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => toggleSelectIndex(idx)}
                                className="mt-0.5 text-purple-400 hover:text-purple-300 transition cursor-pointer shrink-0"
                              >
                                {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                              </button>

                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold text-slate-400">
                                    {tc.testCaseId}
                                  </span>
                                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${typeColor}`}>
                                    {tc.type}
                                  </span>
                                  <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                    {tc.priority}
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-white leading-snug">
                                  {tc.name}
                                </h4>
                                <p className="text-[11px] text-slate-400 line-clamp-1">
                                  {tc.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleUseInManualEditor(tc)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1"
                                title="Load into manual editor"
                              >
                                <span>Edit in Form</span>
                                <ArrowRight size={11} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setAiExpandedIndex(isExpanded ? null : idx)}
                                className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                              </button>
                            </div>
                          </div>

                          {/* Expanded Step Table Preview */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 space-y-2">
                              <div className="text-[11px] font-bold text-slate-400">
                                Test Steps &amp; Expected Results:
                              </div>
                              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                                    <tr>
                                      <th className="py-1.5 px-3 w-10 text-center">#</th>
                                      <th className="py-1.5 px-3">Action Description</th>
                                      <th className="py-1.5 px-3">Test Data</th>
                                      <th className="py-1.5 px-3">Expected Result</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800/60 font-sans">
                                    {tc.steps?.map((st) => (
                                      <tr key={st.stepNumber} className="hover:bg-slate-900/40">
                                        <td className="py-2 px-3 text-center text-slate-500 font-bold">
                                          {st.stepNumber}
                                        </td>
                                        <td className="py-2 px-3 text-slate-200">{st.action}</td>
                                        <td className="py-2 px-3 text-purple-300 font-mono text-[10px]">
                                          {st.testData}
                                        </td>
                                        <td className="py-2 px-3 text-emerald-300/90">{st.expectedResult}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ══════════════════════════════════════════════════════════════ */
            /* TAB 2: MANUAL AUTHORING FORM                                   */
            /* ══════════════════════════════════════════════════════════════ */
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
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
                      {MODULE_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                      <option value="Other">Custom Module...</option>
                    </select>
                    <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      ▼
                    </div>
                  </div>

                  {module === 'Other' && (
                    <input
                      type="text"
                      value={customModule}
                      onChange={(e) => setCustomModule(e.target.value)}
                      placeholder="Enter custom module name..."
                      className="mt-2 w-full px-3.5 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Test Suite / Section Name
                  </label>
                  <input
                    type="text"
                    value={suiteName}
                    onChange={(e) => setSuiteName(e.target.value)}
                    placeholder="e.g. Login Authentication Suite"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {/* Row 2: Scenario ID & Test Case ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              {/* Row 3: Test Case Name * */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Test Case Name <span className="text-purple-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ai')}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={12} /> Auto-generate with AI →
                  </button>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Verify Login with valid Email ID and invalid password"
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
                  placeholder="Briefly describe the test objective and preconditions..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition resize-y"
                />
              </div>

              {/* ── TEST CASE CONTENT CARD ───────────────────────────────── */}
              <div className="rounded-2xl border border-purple-500/35 bg-gradient-to-b from-[#11172a] to-[#0d1322] p-4 sm:p-5 space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <ClipboardList size={14} />
                    </div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      Test Case Content
                    </h3>
                  </div>

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
          )}

          {/* ── MODAL FOOTER ────────────────────────────────────────────── */}
          <div className="p-5 sm:p-6 pt-4 border-t border-slate-800/80 bg-[#0c1120] flex flex-col sm:flex-row items-center justify-between gap-3">
            {activeTab === 'suite' ? (
              /* Suite Section Footer Actions */
              <>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Layers size={14} className="text-purple-400" />
                  <span>
                    {suiteItems.filter(i => i.selected).length} test cases ready in &quot;{suiteTitle || 'Test Suite'}&quot;
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={suiteSaving}
                    className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700/60 transition cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveTestSuite}
                    disabled={suiteSaving || suiteItems.filter(i => i.selected).length === 0}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-purple-950/60 cursor-pointer disabled:opacity-50"
                  >
                    {suiteSaving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Creating Test Suite...</span>
                      </>
                    ) : (
                      <>
                        <Layers size={14} />
                        <span>Create &amp; Save Suite ({suiteItems.filter(i => i.selected).length} Cases)</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : activeTab === 'ai' ? (
              /* AI Footer Actions */
              <>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-400" />
                  <span>
                    {aiGeneratedList.length > 0
                      ? `${aiSelectedIndices.size} of ${aiGeneratedList.length} test cases selected`
                      : 'Describe requirement above to generate test cases'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700/60 transition cursor-pointer"
                  >
                    Close
                  </button>

                  {aiGeneratedList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSaveBatchToDatabase}
                      disabled={aiSavingBatch || aiSelectedIndices.size === 0}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/60 cursor-pointer disabled:opacity-50"
                    >
                      {aiSavingBatch ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Saving to Matrix...</span>
                        </>
                      ) : (
                        <>
                          <Database size={14} />
                          <span>Save {aiSelectedIndices.size} Selected to Matrix</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            ) : (
              /* Manual Footer Actions */
              <>
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
              </>
            )}
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
