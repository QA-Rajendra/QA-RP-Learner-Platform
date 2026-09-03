'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  Briefcase
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

  // Modal controls
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedCaseForPreview, setSelectedCaseForPreview] = useState(null);

  // Expanded rows
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

      const res = await fetch(`/api/test-cases?${params.toString()}`);
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

  // Delete test case
  const handleDelete = async (id, name) => {
    if (!confirm(`Delete test case "${name}"?`)) return;
    try {
      const res = await fetch(`/api/test-cases/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`✓ Test Case "${name}" deleted`);
        fetchTestCases();
      } else {
        showToast('Failed to delete test case', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Toggle status (e.g. Passed / Failed / Ready)
  const handleToggleStatus = async (testCase, newStatus) => {
    try {
      const res = await fetch(`/api/test-cases/${testCase._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`✓ ${testCase.testCaseId} set to "${newStatus}"`);
        fetchTestCases();
      }
    } catch (err) {
      showToast(err.message, 'error');
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
  const moduleList = Array.from(new Set(['Login', 'Registration', 'Checkout', 'Cart', 'API Auth', ...testCases.map(c => c.module).filter(Boolean)]));

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Toast */}
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
              Create, parse, organize, and execute structured test cases across Table, Excel, CSV, Plain Text, and BDD formats. Link directly to automated test suites and portfolio projects.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportJSON}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="Download JSON Export"
            >
              <Download size={14} /> Export JSON
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-2 transition shadow-xl shadow-purple-950/60 cursor-pointer"
            >
              <Plus size={16} /> + Create Test Case
            </button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Total Cases</div>
            <div className="text-2xl font-black text-white mt-1">{stats.total || testCases.length}</div>
            <div className="text-[10px] text-purple-400 font-medium mt-0.5">Across all modules</div>
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

        {/* Filter & Search Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, Name, Action, Module..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
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
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Test Cases Table / List */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-16 text-center text-slate-400 text-xs space-y-2">
              <RefreshCw size={24} className="animate-spin mx-auto text-purple-400 mb-2" />
              <span>Loading test cases...</span>
            </div>
          ) : testCases.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                <ClipboardList size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Test Cases Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  No test cases match your filters or search. Click below to create your first structured test case!
                </p>
              </div>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
              >
                + Create New Test Case
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {testCases.map((tc) => {
                const isExpanded = expandedId === tc._id;
                const stepCount = tc.steps?.length || 0;

                return (
                  <div key={tc._id} className="transition hover:bg-slate-850/40">
                    {/* Row Header */}
                    <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                          onClick={() => handleDelete(tc._id, tc.name)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          title="Delete Test Case"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Steps Table */}
                    {isExpanded && (
                      <div className="p-5 sm:p-6 pt-0 bg-slate-950/60 border-t border-slate-800/60 space-y-3">
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
                                  <th className="py-2.5 px-3.5 w-14 text-center">#</th>
                                  <th className="py-2.5 px-3.5">Action</th>
                                  <th className="py-2.5 px-3.5 w-1/4">Test Data</th>
                                  <th className="py-2.5 px-3.5 w-1/3">Expected Result</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {tc.steps.map((st, i) => (
                                  <tr key={i} className="hover:bg-slate-900/40">
                                    <td className="py-2.5 px-3.5 text-center font-mono text-purple-400 font-bold">
                                      {st.stepNumber || i + 1}
                                    </td>
                                    <td className="py-2.5 px-3.5 text-slate-200">
                                      {st.action}
                                    </td>
                                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-amber-300">
                                      {st.testData || 'N/A'}
                                    </td>
                                    <td className="py-2.5 px-3.5 text-emerald-300">
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
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Test Case Modal */}
      <CreateTestCaseModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(newCase) => {
          showToast(`✓ Test Case "${newCase.testCaseId}" created successfully!`);
          fetchTestCases();
        }}
        initialModule={selectedModule !== 'All' ? selectedModule : 'Login'}
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
