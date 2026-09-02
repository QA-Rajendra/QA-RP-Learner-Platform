'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Award,
  BookOpen,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
  Printer,
  ShieldCheck
} from 'lucide-react';

export default function MyLearningPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [certModal, setCertModal] = useState({ show: false, courseTitle: '', completedDate: '' });

  useEffect(() => {
    async function loadLearning() {
      try {
        setLoading(true);
        const res = await fetch('/api/enrollments?userId=user_demo_1');
        const json = await res.json();
        const list = Array.isArray(json) && json.length > 0 ? json : [
          {
            _id: 'enr-1',
            courseId: 'sample-1',
            courseTitle: '[10x] Job Ready Automation Tester Blueprint with JAVA',
            progress: 75,
            status: 'In Progress',
            lastLessonId: 'lesson-3',
            totalLessons: 4,
            completedLessons: ['lesson-1', 'lesson-2', 'lesson-3']
          },
          {
            _id: 'enr-2',
            courseId: 'sample-2',
            courseTitle: 'React & Next.js Full Stack QA Engineering',
            progress: 100,
            status: 'Completed',
            lastLessonId: 'lesson-4',
            totalLessons: 4,
            completedLessons: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4'],
            completedAt: new Date().toLocaleDateString()
          }
        ];
        setEnrollments(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadLearning();
  }, []);

  const completedCount = enrollments.filter(e => e.progress >= 100).length;
  const inProgressCount = enrollments.filter(e => e.progress < 100).length;
  const overallAvg = enrollments.length > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
    : 0;

  const openCertificate = (courseTitle, completedDate) => {
    setCertModal({
      show: true,
      courseTitle,
      completedDate: completedDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* Certificate Modal */}
      {certModal.show && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-8 max-w-2xl w-full text-center space-y-6 shadow-2xl relative">
            <button
              onClick={() => setCertModal({ show: false, courseTitle: '', completedDate: '' })}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="space-y-3 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30">
                <ShieldCheck size={36} />
              </div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                QA RP Automation Academy
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Certificate of Completion</h2>
              <p className="text-xs text-slate-300">This certifies that</p>
              <div className="text-xl sm:text-2xl font-black text-amber-300 font-serif italic">
                Alex Rivera (QA Engineer)
              </div>
              <p className="text-xs text-slate-300">has successfully completed the comprehensive training curriculum for</p>
              <div className="text-sm sm:text-base font-bold text-white max-w-lg mx-auto bg-slate-950 p-3 rounded-2xl border border-slate-800">
                {certModal.courseTitle}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-[11px] text-slate-400 px-6">
              <div>
                <div className="font-bold text-slate-200">QA RP</div>
                <div className="text-[10px] text-slate-500">Lead QA Instructor</div>
              </div>
              <div>
                <div className="font-bold text-slate-200">{certModal.completedDate}</div>
                <div className="text-[10px] text-slate-500">Date of Issuance</div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Printer size={15} /> Print / Save Certificate PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase">
              <GraduationCap size={15} /> Student Dashboard
            </div>
            <h1 className="text-3xl font-black text-white mt-1">My Learning &amp; Progress</h1>
            <p className="text-xs text-slate-400">Track course completion, resume lessons, and view certificates.</p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-950/50"
          >
            <BookOpen size={15} /> Browse More Courses
          </Link>
        </div>

        {/* Progress Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">In Progress</div>
            <div className="text-3xl font-black text-indigo-400">{inProgressCount} Courses</div>
          </div>
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Completed</div>
            <div className="text-3xl font-black text-emerald-400">{completedCount} Courses</div>
          </div>
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase">Average Progress</div>
            <div className="text-3xl font-black text-purple-400">{overallAvg}%</div>
          </div>
        </div>

        {/* Enrollments Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" /> Active Enrolled Modules ({enrollments.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((item, idx) => {
              const isDone = item.progress >= 100;
              return (
                <div
                  key={item._id || idx}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 hover:border-indigo-500/40 transition shadow-xl relative overflow-hidden"
                >
                  {isDone && (
                    <div className="absolute top-0 right-0 px-4 py-1 rounded-bl-2xl bg-gradient-to-l from-emerald-600 to-teal-600 text-white font-extrabold text-[10px] uppercase tracking-wider">
                      Certified ✓
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      QA Blueprint Track
                    </span>
                    <h3 className="text-base font-black text-white line-clamp-2">
                      {item.courseTitle}
                    </h3>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Curriculum Progress</span>
                      <span className={`font-mono font-bold ${isDone ? 'text-emerald-400' : 'text-indigo-400'}`}>
                        {item.progress || 0}%
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isDone
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                        }`}
                        style={{ width: `${item.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <Link
                      href={`/learn/${item.courseId}/${item.lastLessonId || 'intro'}`}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-950/50"
                    >
                      <Play size={14} /> {isDone ? 'Review Course' : 'Resume Lesson'}
                    </Link>

                    {isDone && (
                      <button
                        onClick={() => openCertificate(item.courseTitle, item.completedAt)}
                        className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 transition flex items-center gap-1.5"
                      >
                        <Award size={14} /> View Certificate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
