'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Eye,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Check,
  Tag,
  Clock,
  Sparkles,
  Play,
  Briefcase,
  FolderPlus,
  LayoutList,
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';
import CreateTestCaseModal from '@/components/testcases/CreateTestCaseModal';
import TestCasePreviewModal from '@/components/testcases/TestCasePreviewModal';

function TestCasesContent() {
  const searchParams = useSearchParams();
  const initialModule = searchParams.get('module') || 'All';

  const [testCases, setTestCases] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    highPriority: 0,
    positiveCount: 0,
    negativeCount: 0,
    automatedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState(initialModule);
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // View Mode: 'suite' (Hierarchical Suite/Section Cards) vs 'flat' (Flat List)
  const [viewMode, setViewMode] = useState('suite');

  // Collapsed / Expanded Suites Tracking (Set of collapsed suite names)
  const [collapsedSuites, setCollapsedSuites] = useState(new Set());

  // Modal controls
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState('suite');
  const [modalInitialSuite, setModalInitialSuite] = useState('');
  const [modalInitialModule, setModalInitialModule] = useState('Login');
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedCaseForPreview, setSelectedCaseForPreview] = useState(null);

  // Expanded individual row steps
  const [expandedId, setExpandedId] = useState(null);

  // Toast feedback
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const fetchTestCases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedModule !== 'All') params.append('module', selectedModule);
      if (selectedPriority !== 'All') params.append('priority', selectedPriority);
      if (selectedType !== 'All') params.append('type', selectedType);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      if (search.trim()) params.append('search', search.trim());
      params.append('_t', Date.now());

      const res = await fetch(`/api/test-cases?${params.toString()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
      });
      if (res.ok) {
        const data = await res.json();
        setTestCases(data.testCases || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load test cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, [selectedModule, selectedPriority, selectedType, selectedStatus]);

  // Handle Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTestCases();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Group test cases into structured Test Suites / Sections
  const suiteGroups = useMemo(() => {
    const map = new Map();

    testCases.forEach((tc) => {
      // Determine suite title: explicit suite || module suite fallback
      const suiteTitle = tc.suite?.trim() || (tc.module ? `${tc.module} Test Suite` : 'General Test Suite');
      
      if (!map.has(suiteTitle)) {
        map.set(suiteTitle, {
          title: suiteTitle,
          module: tc.module || 'General',
          cases: [],
          stats: {
            total: 0,
            highCritical: 0,
            automated: 0,
            passed: 0,
            positive: 0,
            negative: 0,
            boundary: 0,
            security: 0,
          },
        });
      }

      const group = map.get(suiteTitle);
      group.cases.push(tc);
      group.stats.total++;
      if (tc.priority === 'Critical' || tc.priority === 'High') group.stats.highCritical++;
      if (tc.status === 'Automated') group.stats.automated++;
      if (tc.status === 'Passed') group.stats.passed++;
      if (tc.type === 'Positive') group.stats.positive++;
      if (tc.type === 'Negative') group.stats.negative++;
      if (tc.type === 'Boundary') group.stats.boundary++;
      if (tc.type === 'Security') group.stats.security++;
    });

    return Array.from(map.values());
  }, [testCases]);

  // Toggle Collapse on specific Suite
  const toggleSuiteCollapse = (suiteTitle) => {
    setCollapsedSuites((prev) => {
      const next = new Set(prev);
      if (next.has(suiteTitle)) {
        next.delete(suiteTitle);
      } else {
        next.add(suiteTitle);
      }
      return next;
    });
  };

  // Expand All / Collapse All Suites
  const handleToggleAllSuites = () => {
    if (collapsedSuites.size === 0) {
      // Collapse all
      setCollapsedSuites(new Set(suiteGroups.map((g) => g.title)));
    } else {
      // Expand all
      setCollapsedSuites(new Set());
    }
  };

  // Delete test case with optimistic UI update and dual fallback
  const handleDelete = async (id, name, testCaseId) => {
    const displayName = name || testCaseId || 'this test case';
    if (!confirm(`Delete test case "${displayName}"?`)) return;

    const targetId = id || testCaseId;

    // Optimistic removal
    setTestCases(prev => prev.filter(c => c._id !== targetId && c.testCaseId !== targetId && c._id !== id));
    setStats(prev => ({ ...prev, total: Math.max(0, (prev.total || 1) - 1) }));

    try {
      let res = await fetch(`/api/test-cases/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        cache: 'no-store',
      });

      if (!res.ok) {
        res = await fetch(`/api/test-cases?id=${encodeURIComponent(targetId)}`, {
          method: 'DELETE',
          cache: 'no-store',
        });
      }

      if (res.ok) {
        showToast(`✓ Test Case "${displayName}" deleted successfully`);
        fetchTestCases();
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Failed to delete test case', 'error');
        fetchTestCases();
      }
    } catch (err) {
      showToast(err.message, 'error');
      fetchTestCases();
    }
  };

  // Toggle status (e.g. Passed / Failed / Ready / Automated) with optimistic UI update
  const handleToggleStatus = async (testCase, newStatus) => {
    const targetId = testCase._id || testCase.testCaseId;
    setTestCases(prev => prev.map(c => (c._id === targetId || c.testCaseId === targetId) ? { ...c, status: newStatus } : c));

    try {
      const res = await fetch(`/api/test-cases/${encodeURIComponent(targetId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`✓ ${testCase.testCaseId} set to "${newStatus}"`);
        fetchTestCases();
      } else {
        fetchTestCases();
      }
    } catch (err) {
      showToast(err.message, 'error');
      fetchTestCases();
    }
  };

  // Batch status update for an entire Suite
  const handleBatchSuiteStatus = async (suiteGroup, newStatus) => {
    if (!confirm(`Set all ${suiteGroup.cases.length} test cases in "${suiteGroup.title}" to "${newStatus}"?`)) return;

    try {
      await Promise.all(
        suiteGroup.cases.map(tc =>
          fetch(`/api/test-cases/${encodeURIComponent(tc._id || tc.testCaseId)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );
      showToast(`✓ All ${suiteGroup.cases.length} test cases set to "${newStatus}"`);
      fetchTestCases();
    } catch (err) {
      showToast(err.message, 'error');
      fetchTestCases();
    }
  };

  // Export to JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(testCases, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qarp-test-cases-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported test cases as JSON');
  };

  // Modules list from existing cases
  const moduleList = Array.from(new Set(['Login', 'Registration', 'Academic Master', 'Programs', 'Checkout & Payment', 'Access Control', 'Search & Filter', ...testCases.map(c => c.module).filter(Boolean)]));

  const priorityColors = {
    Critical: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    High: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    Medium: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    Low: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  };

  const typeColors = {
    Positive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    Negative: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    Boundary: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    'Edge Case': 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    Security: 'bg-red-500/20 text-red-300 border-red-500/40',
    Performance: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  };

  const statusColors = {
    Passed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    Failed: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    Automated: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    Ready: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    Draft: 'bg-slate-500/20 text-slate-400 border-slate-700',
  };

  // Render a Single Test Case Row
  const renderTestCaseRow = (tc) => {
    const isExpanded = expandedId === tc._id;
    const stepCount = tc.steps?.length || 0;

    return (
      <div key={tc._id} className="transition hover:bg-slate-850/40">
        {/* Row Header */}
        <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left Details */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-black text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-lg border border-purple-500/30">
                {tc.testCaseId}
              </span>
              {tc.scenarioId && (
                <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {tc.scenarioId}
                </span>
              )}
              <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                {tc.module}
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${priorityColors[tc.priority] || priorityColors.High}`}>
                {tc.priority}
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${typeColors[tc.type] || typeColors.Positive}`}>
                {tc.type}
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${statusColors[tc.status] || statusColors.Ready}`}>
                {tc.status || 'Ready'}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white truncate">
              {tc.name}
            </h3>

            {tc.description && (
              <p className="text-xs text-slate-400 line-clamp-1">
                {tc.description}
              </p>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Status Quick Select */}
            <select
              value={tc.status || 'Ready'}
              onChange={(e) => handleToggleStatus(tc, e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="Ready">Ready</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
              <option value="Automated">Automated</option>
              <option value="Draft">Draft</option>
            </select>

            {/* Preview */}
            <button
              onClick={() => {
                setSelectedCaseForPreview(tc);
                setPreviewModalOpen(true);
              }}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Preview Test Case Steps"
            >
              <Eye size={14} />
            </button>

            {/* Expand / Collapse Steps */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : tc._id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              title="Toggle Steps View"
            >
              <span>{stepCount} Steps</span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Delete */}
            <button
              onClick={() => handleDelete(tc._id, tc.name, tc.testCaseId)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition cursor-pointer"
              title="Delete Test Case"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Expanded Steps Table */}
        {isExpanded && (
          <div className="p-4 sm:p-5 pt-0 bg-slate-950/60 border-t border-slate-800/60 space-y-3">
            <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
              <span>Execution Steps Breakdown:</span>
              <span className="uppercase text-[10px] text-purple-400 font-mono">
                Format: {tc.format || 'structured'}
              </span>
            </div>

            {stepCount > 0 ? (
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                      <th className="py-2 px-3.5 w-14 text-center">#</th>
                      <th className="py-2 px-3.5">Action Description</th>
                      <th className="py-2 px-3.5 w-1/4">Test Data</th>
                      <th className="py-2 px-3.5 w-1/3">Expected Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {tc.steps.map((st, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3.5 text-center font-mono text-purple-400 font-bold">
                          {st.stepNumber || i + 1}
                        </td>
                        <td className="py-2 px-3.5 text-slate-200">
                          {st.action}
                        </td>
                        <td className="py-2 px-3.5 font-mono text-[11px] text-amber-300">
                          {st.testData || 'N/A'}
                        </td>
                        <td className="py-2 px-3.5 text-emerald-300">
                          {st.expectedResult}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-slate-900 rounded-xl text-xs text-slate-400">
                Raw content:
                <pre className="mt-2 p-3 rounded-lg bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap">
                  {tc.content || 'No content provided'}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Toast Feedback */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-[150] px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-fade-in ${
            toast.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          <CheckCircle2 size={16} />
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase">
              <ClipboardList size={15} /> QA Test Repository &amp; Execution Matrix
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Structured <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Test Cases Suite</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Create, organize, and execute structured Test Suites and Sections across Table, Excel, CSV, Plain Text, and BDD formats.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Download JSON Export"
            >
              <Download size={14} /> Export JSON
            </button>

            <button
              onClick={() => {
                setModalInitialTab('ai');
                setCreateModalOpen(true);
              }}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-cyan-500/20 hover:from-purple-500/35 hover:to-cyan-500/35 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Generate test cases with AI"
            >
              <Sparkles size={14} className="text-cyan-400" />
              <span>✨ AI Generator</span>
            </button>

            <button
              onClick={() => {
                setModalInitialTab('suite');
                setModalInitialSuite('');
                setModalInitialModule(selectedModule !== 'All' ? selectedModule : 'Login');
                setCreateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 transition shadow-lg shadow-purple-950/60 cursor-pointer"
              title="Create a complete Test Suite Section"
            >
              <Layers size={14} />
              <span>+ Create Test Suite</span>
            </button>

            <button
              onClick={() => {
                setModalInitialTab('manual');
                setModalInitialSuite('');
                setModalInitialModule(selectedModule !== 'All' ? selectedModule : 'Login');
                setCreateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus size={14} /> + Single Case
            </button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Total Cases</div>
            <div className="text-2xl font-black text-white mt-1">{stats.total || testCases.length}</div>
            <div className="text-[10px] text-purple-400 font-medium mt-0.5">{suiteGroups.length} Active Suites</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">High / Critical</div>
            <div className="text-2xl font-black text-amber-400 mt-1">{stats.highPriority}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">High severity coverage</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Positive Flows</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{stats.positiveCount}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Happy path validations</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Negative Flows</div>
            <div className="text-2xl font-black text-rose-400 mt-1">{stats.negativeCount}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">Boundary &amp; error states</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Automated</div>
            <div className="text-2xl font-black text-indigo-400 mt-1">{stats.automatedCount}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5">CI/CD automation ready</div>
          </div>
        </div>

        {/* Filter & View Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, Name, Action, Suite..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Filters & View Switcher */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* View Mode Toggle: Suite vs Flat */}
            <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setViewMode('suite')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'suite'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Group by Test Suite Sections"
              >
                <Layers size={13} />
                <span>Suite Sections</span>
              </button>

              <button
                onClick={() => setViewMode('flat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'flat'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Flat Matrix List"
              >
                <LayoutList size={13} />
                <span>Flat List</span>
              </button>
            </div>

            {/* Expand / Collapse All Suites (when in Suite mode) */}
            {viewMode === 'suite' && suiteGroups.length > 0 && (
              <button
                onClick={handleToggleAllSuites}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer"
                title={collapsedSuites.size === 0 ? 'Collapse All Suites' : 'Expand All Suites'}
              >
                {collapsedSuites.size === 0 ? 'Collapse All' : 'Expand All'}
              </button>
            )}

            {/* Module Filter */}
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Modules</option>
              {moduleList.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Types</option>
              <option value="Positive">Positive</option>
              <option value="Negative">Negative</option>
              <option value="Boundary">Boundary</option>
              <option value="Edge Case">Edge Case</option>
              <option value="Security">Security</option>
              <option value="Performance">Performance</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            >
              <option value="All">All Statuses</option>
              <option value="Ready">Ready</option>
              <option value="Automated">Automated</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
              <option value="Draft">Draft</option>
            </select>

            <button
              onClick={fetchTestCases}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Refresh List"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TEST CASES REPOSITORY BODY                                    */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center text-slate-400 text-xs space-y-2">
            <RefreshCw size={24} className="animate-spin mx-auto text-purple-400 mb-2" />
            <span>Loading test cases repository...</span>
          </div>
        ) : testCases.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
              <ClipboardList size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Test Cases Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No test cases match your current filters. Create a new test suite section to organize your QA matrix!
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setModalInitialTab('suite');
                  setCreateModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition cursor-pointer flex items-center gap-1.5"
              >
                <Layers size={14} /> + Create Test Suite Section
              </button>
              <button
                onClick={() => {
                  setModalInitialTab('manual');
                  setCreateModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition cursor-pointer"
              >
                + Single Test Case
              </button>
            </div>
          </div>
        ) : viewMode === 'suite' ? (
          /* ── HIERARCHICAL TEST SUITE SECTIONS VIEW ──────────────────── */
          <div className="space-y-6">
            {suiteGroups.map((suiteGroup) => {
              const isCollapsed = collapsedSuites.has(suiteGroup.title);

              return (
                <div
                  key={suiteGroup.title}
                  className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition hover:border-purple-500/30"
                >
                  {/* Suite Section Header Card */}
                  <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/20 border-b border-slate-800/90 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 shadow-sm">
                        <FolderOpen size={20} />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                            {suiteGroup.title}
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-600 text-white shadow-sm">
                            {suiteGroup.stats.total} {suiteGroup.stats.total === 1 ? 'Case' : 'Cases'}
                          </span>
                          <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">
                            {suiteGroup.module}
                          </span>
                        </div>

                        {/* Suite Mini Scorecard */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                          {suiteGroup.stats.highCritical > 0 && (
                            <span className="text-amber-300 flex items-center gap-1">
                              ⚡ {suiteGroup.stats.highCritical} High/Critical
                            </span>
                          )}
                          {suiteGroup.stats.automated > 0 && (
                            <span className="text-purple-300 flex items-center gap-1">
                              ✓ {suiteGroup.stats.automated} Automated
                            </span>
                          )}
                          {suiteGroup.stats.positive > 0 && (
                            <span className="text-emerald-400 flex items-center gap-1">
                              🟢 {suiteGroup.stats.positive} Positive
                            </span>
                          )}
                          {suiteGroup.stats.negative > 0 && (
                            <span className="text-rose-400 flex items-center gap-1">
                              🔴 {suiteGroup.stats.negative} Negative
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Suite Actions */}
                    <div className="flex items-center gap-2 shrink-0 justify-end">
                      {/* Add Case to this Suite */}
                      <button
                        onClick={() => {
                          setModalInitialTab('manual');
                          setModalInitialSuite(suiteGroup.title);
                          setModalInitialModule(suiteGroup.module);
                          setCreateModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Add Test Case to this Suite"
                      >
                        <Plus size={13} />
                        <span>Add Case</span>
                      </button>

                      {/* Quick Suite Status Batch */}
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleBatchSuiteStatus(suiteGroup, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 focus:outline-none cursor-pointer"
                        title="Batch set status for all cases in this suite"
                      >
                        <option value="" disabled>Set All Status...</option>
                        <option value="Ready">Set All Ready</option>
                        <option value="Automated">Set All Automated</option>
                        <option value="Passed">Set All Passed</option>
                        <option value="Draft">Set All Draft</option>
                      </select>

                      {/* Collapse/Expand Toggle */}
                      <button
                        onClick={() => toggleSuiteCollapse(suiteGroup.title)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        title={isCollapsed ? 'Expand Suite' : 'Collapse Suite'}
                      >
                        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Suite Cases List (when not collapsed) */}
                  {!isCollapsed && (
                    <div className="divide-y divide-slate-800/80">
                      {suiteGroup.cases.map((tc) => renderTestCaseRow(tc))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ── FLAT MATRIX VIEW ───────────────────────────────────────── */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl divide-y divide-slate-800/80">
            {testCases.map((tc) => renderTestCaseRow(tc))}
          </div>
        )}
      </div>

      {/* Create Test Case / Suite Modal */}
      <CreateTestCaseModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        initialTab={modalInitialTab}
        initialSuite={modalInitialSuite}
        initialModule={modalInitialModule}
        onSuccess={(result) => {
          const msg = result?.suiteName
            ? `✓ Created Test Suite "${result.suiteName}" with ${result.count} test cases!`
            : result?.count
            ? `✓ Saved ${result.count} test cases successfully!`
            : `✓ Test Case "${result?.testCaseId || 'Created'}" saved successfully!`;
          showToast(msg);
          fetchTestCases();
        }}
      />

      {/* Preview Modal */}
      <TestCasePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        testCaseData={selectedCaseForPreview}
      />
    </div>
  );
}

export default function TestCasesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Test Cases...</div>}>
      <TestCasesContent />
    </Suspense>
  );
}
