'use client';

import React from 'react';
import { X, Eye, CheckCircle2, AlertCircle, FileText, Layers, Tag } from 'lucide-react';
import { parseTestCaseContent } from '@/lib/testCaseParser';

export default function TestCasePreviewModal({ isOpen, onClose, testCaseData }) {
  if (!isOpen) return null;

  const {
    module = 'General',
    scenarioId = 'TS-GEN-001',
    testCaseId = 'TC-GEN-001',
    name = 'Untitled Test Case',
    priority = 'High',
    type = 'Positive',
    description = '',
    content = '',
    format = 'structured',
    steps: existingSteps = [],
  } = testCaseData || {};

  // Parse if raw content is available and steps aren't explicitly passed
  const parsedResult = (!existingSteps || existingSteps.length === 0)
    ? parseTestCaseContent(content, format)
    : { steps: existingSteps, format };

  const steps = parsedResult.steps || [];

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

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Eye size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-purple-400 tracking-wider">
                  Test Case Live Preview
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {testCaseId}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">{name || 'Test Case Preview'}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-semibold">Module:</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                {module}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-semibold">Scenario:</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-mono">
                {scenarioId}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-semibold">Priority:</span>
              <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${priorityColors[priority] || priorityColors.High}`}>
                {priority}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-400 font-semibold">Type:</span>
              <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-bold ${typeColors[type] || typeColors.Positive}`}>
                {type}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs ml-auto">
              <span className="text-slate-400 font-semibold">Detected Format:</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase text-[10px] font-extrabold">
                {parsedResult.format || format}
              </span>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Objective &amp; Description
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
            </div>
          )}

          {/* Step Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers size={16} className="text-purple-400" />
                Parsed Test Steps ({steps.length})
              </h4>
              <span className="text-xs text-slate-400">
                Live structured breakdown of actions &amp; expected results
              </span>
            </div>

            {steps.length > 0 ? (
              <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold">
                      <th className="py-3 px-4 w-16 text-center">Step #</th>
                      <th className="py-3 px-4">Action / Test Objective</th>
                      <th className="py-3 px-4 w-1/4">Test Data / Input</th>
                      <th className="py-3 px-4 w-1/3">Expected Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                    {steps.map((step, idx) => (
                      <tr key={idx} className="hover:bg-purple-950/10 transition">
                        <td className="py-3 px-4 text-center font-mono font-bold text-purple-400">
                          {step.stepNumber || idx + 1}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200">
                          {step.action || '—'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-amber-300/90 bg-slate-950/40">
                          {step.testData || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-emerald-300/90">
                          {step.expectedResult || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                No structured steps found. Paste test case content or click "Load Sample".
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
