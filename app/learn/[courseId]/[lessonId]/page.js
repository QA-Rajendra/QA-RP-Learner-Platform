'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Play,
  CheckCircle2,
  Check,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Download,
  Code2,
  ExternalLink,
  Sparkles,
  Award,
  Video,
  Layers,
  ArrowLeft,
  GraduationCap,
  Copy,
  Clock,
  Lock,
  ShieldCheck,
  CreditCard,
  QrCode,
  Terminal,
  Briefcase,
  Zap,
  Tag,
  Settings,
  ArrowRight
} from 'lucide-react';
import PaidContentFeeModal from '@/components/payment/PaidContentFeeModal';

export default function LessonPlayerPage({ params }) {
  const unwrappedParams = use(params);
  const { courseId, lessonId } = unwrappedParams;

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [savingProgress, setSavingProgress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Cross-Module Data
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [relatedVideos, setRelatedVideos] = useState([]);

  // Lesson Learning Studio UI State
  const [activeLessonTab, setActiveLessonTab] = useState('notes');
  const [completedLessonObjectives, setCompletedLessonObjectives] = useState([0]);
  const [quizAnswers, setQuizAnswers] = useState({ q1: null, q2: null });

  // Paid Content & Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    paymentEnabled: true,
    commonFeeAmount: 499,
    currency: 'INR',
    currencySymbol: '₹',
  });
  const [unlockedLessonIds, setUnlockedLessonIds] = useState([]);

  // Load Unlocked State from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`qarp_unlocked_${courseId}`);
      if (saved) {
        setUnlockedLessonIds(JSON.parse(saved));
      }
    } catch (e) {}
  }, [courseId]);

  // Load Course, Lessons, Payment Settings, Projects & Videos
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cRes, lRes, pRes, projRes, vidRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`).then(r => r.json()).catch(() => null),
          fetch(`/api/courses/${courseId}/lessons`).then(r => r.json()).catch(() => []),
          fetch('/api/payments').then(r => r.json()).catch(() => ({})),
          fetch('/api/portfolio-projects?limit=3').then(r => r.json()).catch(() => []),
          fetch('/api/youtube?limit=2').then(r => r.json()).catch(() => []),
        ]);

        if (pRes?.paymentSettings) {
          setPaymentSettings(pRes.paymentSettings);
        }

        if (Array.isArray(projRes)) {
          setRelatedProjects(projRes);
        }
        if (Array.isArray(vidRes)) {
          setRelatedVideos(vidRes);
        }

        setCourse(cRes);
        const lessonList = Array.isArray(lRes) && lRes.length > 0 ? lRes : [
          {
            _id: 'lesson-1',
            title: '1. Introduction to QA Framework Architecture',
            sectionTitle: 'Section 1: Introduction',
            duration: '12:30',
            accessType: 'FREE',
            isPaid: false,
            notes: 'In this introductory lesson, we examine the foundational architectural principles of modern test automation suites.',
            codeSnippet: 'import { test, expect } from "@playwright/test";\n\ntest("Basic Smoke Test", async ({ page }) => {\n  await page.goto("https://example.com");\n  await expect(page).toHaveTitle(/Example/);\n});',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            attachments: [{ name: 'Architecture_Blueprint.pdf', size: '1.4 MB' }]
          },
          {
            _id: 'lesson-2',
            title: '2. Setting up Page Object Models (POM)',
            sectionTitle: 'Section 1: Introduction',
            duration: '15:45',
            accessType: 'FREE',
            isPaid: false,
            notes: 'Encapsulate page elements and user actions within dedicated class representations to prevent test fragility.',
            codeSnippet: 'export class LoginPage {\n  constructor(page) {\n    this.page = page;\n    this.userInput = page.locator("#username");\n    this.passInput = page.locator("#password");\n    this.loginBtn = page.locator("button[type=submit]");\n  }\n}',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            attachments: [{ name: 'POM_Template.zip', size: '2.1 MB' }]
          },
          {
            _id: 'lesson-3',
            title: '3. API Testing & Mocking Interceptions',
            sectionTitle: 'Section 2: Automation & Advanced Testing',
            duration: '18:20',
            accessType: 'PAID',
            isPaid: true,
            notes: 'Learn how to intercept HTTP requests and validate status codes, JSON response schemas, and authentication headers.',
            codeSnippet: 'await page.route("**/api/users", async route => {\n  await route.fulfill({ status: 200, json: [{ id: 1, name: "Test User" }] });\n});',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            attachments: [{ name: 'API_Spec.json', size: '12 KB' }]
          },
          {
            _id: 'lesson-4',
            title: '4. GitHub Actions CI/CD Sharded Pipeline',
            sectionTitle: 'Section 2: Automation & Advanced Testing',
            duration: '22:10',
            accessType: 'PAID',
            isPaid: true,
            notes: 'Run tests concurrently across 4 shards in GitHub Actions to achieve sub-3-minute total execution times.',
            codeSnippet: 'jobs:\n  test:\n    strategy:\n      matrix:\n        shard: [1/4, 2/4, 3/4, 4/4]\n    steps:\n    - run: npx playwright test --shard=${{ matrix.shard }}',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            attachments: [{ name: 'ci_pipeline.yml', size: '4 KB' }]
          }
        ];

        setLessons(lessonList);

        // Active Lesson
        const active = lessonList.find(l => l._id === lessonId) || lessonList[0];
        setCurrentLesson(active);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (courseId) loadData();
  }, [courseId, lessonId]);

  // Current lesson navigation index
  const currentIdx = lessons.findIndex(l => l._id === currentLesson?._id);
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson = currentIdx >= 0 && currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  // Is current lesson locked?
  const isLessonPaid = currentLesson?.accessType === 'PAID' || currentLesson?.isPaid === true || currentLesson?.freePreview === false;
  const isLessonUnlocked = unlockedLessonIds.includes(currentLesson?._id) || !isLessonPaid;

  // Handle Payment Success
  const handlePaymentSuccess = (receipt) => {
    if (currentLesson?._id) {
      const updated = Array.from(new Set([...unlockedLessonIds, currentLesson._id]));
      setUnlockedLessonIds(updated);
      try {
        localStorage.setItem(`qarp_unlocked_${courseId}`, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  // Mark Lesson as Complete & Record in MongoDB
  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    try {
      setSavingProgress(true);
      const res = await fetch(`/api/lessons/${currentLesson._id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'user_demo_1',
          courseId,
          completed: true,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsCompleted(true);
        setCourseProgress(data.courseProgress || 100);
        setCompletedLessonIds(prev => Array.from(new Set([...prev, currentLesson._id])));

        if (data.courseProgress >= 100) {
          setShowCelebration(true);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleCopyCode = (snippet) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Group lessons by sections
  const sections = lessons.reduce((acc, lesson) => {
    const sec = lesson.sectionTitle || 'Section 1: Introduction';
    if (!acc[sec]) acc[sec] = [];
    acc[sec].push(lesson);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Sparkles size={24} className="text-indigo-400 animate-spin mr-2" />
        Loading lesson workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Paid Content Fee Modal */}
      <PaidContentFeeModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        item={currentLesson}
        commonFee={paymentSettings.commonFeeAmount || 499}
        currency={paymentSettings.currency || 'INR'}
        currencySymbol={paymentSettings.currencySymbol || '₹'}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
              <Award size={40} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Course Completed! 🎉</h2>
              <p className="text-xs text-slate-300">
                Congratulations! You have completed all lessons in <span className="text-white font-bold">{course?.title || 'this course'}</span>.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              Your official Certificate of Completion is now unlocked in your Student Dashboard.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCelebration(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Continue Reviewing
              </button>
              <Link
                href="/my-learning"
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950/50"
              >
                View Dashboard <Award size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TOP COMPACT BAR */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${courseId}`}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={14} /> Course Overview
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-bold text-white line-clamp-1 max-w-xs sm:max-w-md">
            {course?.title || 'QA Automation Blueprint'}
          </span>
        </div>

        {/* Course Progress Indicator */}
        <div className="flex items-center gap-3 text-xs">
          <span className="hidden sm:inline text-slate-400 font-medium">Completion:</span>
          <div className="w-28 sm:w-36 h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${courseProgress || (completedLessonIds.length / (lessons.length || 1)) * 100}%` }}
            />
          </div>
          <span className="font-mono text-emerald-400 font-bold text-xs">
            {Math.round(courseProgress || (completedLessonIds.length / (lessons.length || 1)) * 100)}%
          </span>
        </div>
      </header>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* SYLLABUS SIDEBAR WITH SECTIONS */}
        <aside className="w-full lg:w-84 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-900/40 p-4 overflow-y-auto shrink-0 flex flex-col gap-4">
          <div className="text-xs font-bold text-slate-400 px-2 py-1 uppercase tracking-wider flex items-center justify-between border-b border-slate-800/60 pb-2">
            <span>Course Curriculum</span>
            <span className="text-indigo-400 font-mono text-[10px]">{lessons.length} Lessons</span>
          </div>

          <div className="space-y-4">
            {Object.entries(sections).map(([sectionName, sectionLessons], sIdx) => (
              <div key={sectionName} className="space-y-2">
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1.5">
                  <Layers size={13} className="text-indigo-400" />
                  <span>{sectionName}</span>
                </div>

                <div className="space-y-1.5">
                  {sectionLessons.map((lesson, idx) => {
                    const isActive = lesson._id === currentLesson?._id;
                    const isDone = completedLessonIds.includes(lesson._id);
                    const isPaid = lesson.accessType === 'PAID' || lesson.isPaid === true || lesson.freePreview === false;
                    const isUnlocked = unlockedLessonIds.includes(lesson._id) || !isPaid;

                    return (
                      <Link
                        key={lesson._id || idx}
                        href={`/learn/${courseId}/${lesson._id}`}
                        className={`flex items-start gap-2.5 p-2.5 rounded-2xl text-xs transition border ${
                          isActive
                            ? 'bg-indigo-600/20 border-indigo-500/40 text-white font-bold shadow-sm'
                            : 'bg-slate-900/50 border-slate-800/60 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isDone
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : isActive
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isDone ? <Check size={12} strokeWidth={3} /> : idx + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="truncate text-xs">{lesson.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <Clock size={10} /> {lesson.duration || '15 mins'}
                            </span>

                            {/* FREE vs PAID Badge */}
                            {isPaid ? (
                              isUnlocked ? (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded font-bold text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  ✓ UNLOCKED
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded font-bold text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/30">
                                  <Lock size={9} /> PAID ({paymentSettings.currencySymbol}{paymentSettings.commonFeeAmount})
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded font-bold text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                FREE
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MAIN LESSON CONTENT AREA */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 max-w-5xl mx-auto">
          {/* FREE / PAID CHECK & GATEWAY */}
          {!isLessonUnlocked ? (
            /* PAID CONTENT LOCKED BANNER */
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-amber-500/40 shadow-2xl text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10 animate-bounce">
                <Lock size={36} />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  🔒 Premium Paid Content
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white pt-2">
                  Unlock {currentLesson?.title || 'This Lesson Module'}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  This lesson is part of the premium curriculum. Complete a simple one-time payment to unlock instant lifetime access to the video, notes, downloadable files, and code repository.
                </p>
              </div>

              {/* Pricing Box */}
              <div className="max-w-xs mx-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xs text-slate-400">One-Time Fee</div>
                  <div className="text-xs text-emerald-400 font-bold">Lifetime Access</div>
                </div>
                <div className="text-2xl font-black text-white">
                  {paymentSettings.currencySymbol}{paymentSettings.commonFeeAmount}
                </div>
              </div>

              {/* Pay Now Button Trigger */}
              <button
                onClick={() => setPaymentModalOpen(true)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-950/60 inline-flex items-center gap-2 transition cursor-pointer active:scale-95"
              >
                <CreditCard size={18} /> Pay Now ({paymentSettings.currencySymbol}{paymentSettings.commonFeeAmount}) to Unlock &rarr;
              </button>
            </div>
          ) : (
            /* UNLOCKED / FREE LESSON CONTENT */
            <>
              {/* Video Player Container */}
              <div className="aspect-video w-full rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl relative flex items-center justify-center">
                {currentLesson?.videoUrl ? (
                  <iframe
                    src={currentLesson.videoUrl}
                    title={currentLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center space-y-3 p-8">
                    <div className="w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
                      <Play size={28} />
                    </div>
                    <div className="font-bold text-sm text-white">Video Player Ready</div>
                    <p className="text-xs text-slate-400 max-w-md">Live execution recording and interactive video tutorial player.</p>
                  </div>
                )}
              </div>

              {/* Lesson Header & Mark Complete */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      {currentLesson?.sectionTitle || 'Section 1: Introduction'}
                    </span>
                    <span className="text-slate-600">&bull;</span>
                    {isLessonPaid ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        PAID (UNLOCKED)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        FREE CONTENT
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-black text-white">{currentLesson?.title}</h2>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>Duration: {currentLesson?.duration || '12 min'}</span>
                    <span>&bull;</span>
                    <span className="text-slate-300">{course?.title || 'QA Automation Blueprint'}</span>
                  </div>
                </div>

                <button
                  onClick={handleMarkComplete}
                  disabled={savingProgress || isCompleted}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-extrabold transition shadow-lg active:scale-95 cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  {savingProgress ? 'Saving...' : isCompleted ? 'Completed! ✓' : 'Mark as Complete'}
                </button>
              </div>

              {/* ════════════════════════════════════════════════════════════════════
                  RICH LESSON LEARNING STUDIO & KEY CONCEPTS HUB
              ════════════════════════════════════════════════════════════════════ */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
                {/* Studio Header & Tab Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      <Sparkles size={16} />
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-white">Lesson Notes, Blueprint &amp; QA Concepts</h3>
                      <p className="text-[11px] text-slate-400">Interactive curriculum walkthrough, execution blueprints, and knowledge check.</p>
                    </div>
                  </div>

                  {/* Sub-Tabs */}
                  <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
                    {[
                      { id: 'notes', label: 'Notes & Breakdown', icon: <FileText size={13} /> },
                      { id: 'code', label: 'Code & Terminal', icon: <Code2 size={13} /> },
                      { id: 'objectives', label: 'Objectives', icon: <CheckCircle2 size={13} /> },
                      { id: 'quiz', label: 'Knowledge Check', icon: <Sparkles size={13} /> },
                      { id: 'files', label: `Files (${currentLesson?.attachments?.length || 1})`, icon: <Download size={13} /> },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveLessonTab(tab.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          activeLessonTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/60'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── TAB 1: NOTES & CORE CONCEPTS ── */}
                {activeLessonTab === 'notes' && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {/* Main Overview */}
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-400 uppercase tracking-wider">
                        <BookOpen size={14} /> Lesson Architecture Overview
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-normal">
                        {currentLesson?.notes && currentLesson.notes.length > 20
                          ? currentLesson.notes
                          : `In this hands-on lesson on "${currentLesson?.title || 'QA Automation'}", we dive into robust testing patterns, resilient locators, and automated execution strategies. Study the architecture breakdown below to master this topic.`}
                      </p>
                    </div>

                    {/* 3 Pillar Concept Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">1</div>
                        <h4 className="text-xs font-black text-white">Resilient Locators</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Prioritize user-facing roles (<code className="text-indigo-300">getByRole</code>, <code className="text-indigo-300">getByTestId</code>) over volatile CSS paths.
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">2</div>
                        <h4 className="text-xs font-black text-white">Dynamic Auto-Waiting</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Eliminate flaky tests with smart assertion retry polling instead of arbitrary hardcoded sleeps.
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</div>
                        <h4 className="text-xs font-black text-white">CI/CD Pipeline Ready</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Headless execution, sharded parallel matrices, and HTML trace viewer artifacts on failure.
                        </p>
                      </div>
                    </div>

                    {/* Pro-Tips vs Common Pitfalls Callout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                        <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 size={14} /> Recommended Best Practices
                        </div>
                        <ul className="text-[11px] text-slate-300 space-y-1.5">
                          <li className="flex items-start gap-1.5">• Encapsulate UI state inside clean Page Object Models.</li>
                          <li className="flex items-start gap-1.5">• Isolate test data using factories and randomized fixtures.</li>
                          <li className="flex items-start gap-1.5">• Run smoke tests on every pull request before merging.</li>
                        </ul>
                      </div>
                      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                        <div className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                          <Lock size={14} /> Common QA Pitfalls to Avoid
                        </div>
                        <ul className="text-[11px] text-slate-300 space-y-1.5">
                          <li className="flex items-start gap-1.5">• Never use hardcoded sleeps like <code className="text-rose-300 font-mono">Thread.sleep(5000)</code>.</li>
                          <li className="flex items-start gap-1.5">• Avoid tightly coupled tests where Test 2 depends on Test 1.</li>
                          <li className="flex items-start gap-1.5">• Do not commit unmasked secret credentials or auth tokens.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: CODE BLUEPRINT & TERMINAL RUNNER ── */}
                {activeLessonTab === 'code' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Code block */}
                    <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-xl">
                      <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                          <span className="text-[11px] font-mono font-bold text-slate-400 ml-2">
                            {currentLesson?.title ? currentLesson.title.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'automation-spec'}.spec.ts
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(currentLesson?.codeSnippet || `import { test, expect } from '@playwright/test';\n\ntest('${currentLesson?.title || 'E2E Scenario'}', async ({ page }) => {\n  await page.goto('https://example.com');\n  await page.locator('input[type="text"]').fill('QA RP Tester');\n  await page.locator('button[type="submit"]').click();\n  await expect(page.locator('.welcome-banner')).toBeVisible();\n});`)}
                          className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
                        >
                          {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          {copiedCode ? 'Copied!' : 'Copy Code'}
                        </button>
                      </div>
                      <pre className="p-5 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed max-h-80 overflow-y-auto">
                        {currentLesson?.codeSnippet || `import { test, expect } from '@playwright/test';\n\ntest('${currentLesson?.title || 'E2E Scenario'}', async ({ page }) => {\n  // 1. Navigate to target application endpoint\n  await page.goto('https://example.com/login');\n\n  // 2. Perform resilient UI interactions with auto-waiting\n  await page.locator('input[name="email"]').fill('qarajendra4893@gmail.com');\n  await page.locator('input[name="password"]').fill('Patil@321');\n  await page.locator('button[type="submit"]').click();\n\n  // 3. Assertions & state verification\n  await expect(page.locator('.dashboard-header')).toBeVisible();\n  await expect(page).toHaveURL(/.*dashboard/);\n});`}
                      </pre>
                    </div>

                    {/* Terminal CLI Command */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                          <Terminal size={14} className="text-cyan-400" /> Terminal Run Command
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(currentLesson?.terminalCommand || `npx playwright test --grep="${(currentLesson?.title || 'test').split(' ')[0]}" --headed`)}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                        >
                          Copy Command
                        </button>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-cyan-300 flex items-center justify-between">
                        <code>$ {currentLesson?.terminalCommand || `npx playwright test --grep="${(currentLesson?.title || 'test').split(' ')[0]}" --headed`}</code>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: INTERACTIVE OBJECTIVES CHECKLIST ── */}
                {activeLessonTab === 'objectives' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                      🎯 <strong>Learning Checklist:</strong> Click each item below as you follow along to track your hands-on mastery.
                    </div>

                    <div className="space-y-2.5">
                      {(currentLesson?.objectives && currentLesson.objectives.length > 0 ? currentLesson.objectives : [
                        `Master the architectural principles behind "${currentLesson?.title || 'this lesson'}"`,
                        `Build and execute resilient test automation scripts without hardcoded sleeps`,
                        `Configure parameter assertions and JSON Schema validation checks`,
                        `Verify continuous testing execution within GitHub Actions pipeline`,
                      ]).map((obj, oIdx) => {
                        const isDone = completedLessonObjectives.includes(oIdx);
                        return (
                          <div
                            key={oIdx}
                            onClick={() => {
                              if (isDone) {
                                setCompletedLessonObjectives(completedLessonObjectives.filter(i => i !== oIdx));
                              } else {
                                setCompletedLessonObjectives([...completedLessonObjectives, oIdx]);
                              }
                            }}
                            className={`p-4 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
                              isDone
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                              isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {isDone ? '✓' : oIdx + 1}
                            </div>
                            <span className={`text-xs font-semibold flex-1 ${isDone ? 'line-through opacity-80' : ''}`}>{obj}</span>
                            <span className="text-[10px] font-bold text-slate-500">{isDone ? 'Mastered' : 'Click to check'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── TAB 4: INSTANT QA KNOWLEDGE QUIZ ── */}
                {activeLessonTab === 'quiz' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                      ⚡ <strong>Instant Knowledge Check:</strong> Test your understanding of this lesson's key concepts.
                    </div>

                    {/* Render Custom Quiz Questions if defined in DB, else fallback */}
                    {(currentLesson?.quiz && currentLesson.quiz.length > 0 ? currentLesson.quiz : [
                      {
                        question: `What is the most resilient locator strategy for "${currentLesson?.title || 'this lesson'}"?`,
                        options: ['Role & Accessible Name (e.g. getByRole, getByTestId)', 'Absolute full XPath chains like /html/body/div[2]/span', 'Hardcoded dynamic element indexes without labels'],
                        correctAnswerIndex: 0,
                        explanation: 'Role-based locators remain stable across DOM refactors.',
                      },
                      {
                        question: 'How should test suites handle dynamic asynchronous page loading?',
                        options: ['Hardcoded 10-second sleeps between every step', 'Built-in auto-waiting assertions and state polling', 'Disabling assertions altogether in CI/CD'],
                        correctAnswerIndex: 1,
                        explanation: 'Auto-waiting retry assertions prevent flaky pipeline runs.',
                      }
                    ]).map((qItem, qIdx) => {
                      const selectedAnswer = quizAnswers[`q${qIdx}`];
                      return (
                        <div key={qIdx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                          <div className="text-xs font-black text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                              {qIdx + 1}
                            </span>
                            {qItem.question}
                          </div>
                          <div className="space-y-2">
                            {qItem.options.map((opt, optIdx) => {
                              const isSelected = selectedAnswer === optIdx;
                              const isCorrect = optIdx === qItem.correctAnswerIndex;
                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  onClick={() => setQuizAnswers({ ...quizAnswers, [`q${qIdx}`]: optIdx })}
                                  className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                                    isSelected
                                      ? isCorrect
                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                                        : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isSelected && (
                                    <span className="text-[11px] font-bold">
                                      {isCorrect ? '🎉 Correct!' : '❌ Try again'}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                          {selectedAnswer !== undefined && selectedAnswer !== null && qItem.explanation && (
                            <div className="p-2.5 rounded-xl bg-slate-900 text-[11px] text-slate-400 border border-slate-800">
                              💡 <strong>Explanation:</strong> {qItem.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ── TAB 5: DOWNLOADABLE RESOURCES & FILES ── */}
                {activeLessonTab === 'files' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 flex items-center justify-between">
                      <span>📦 <strong>Lesson Attachments &amp; Study Materials:</strong> Download or preview PDFs, images, configurations, and starter code.</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(currentLesson?.attachments && currentLesson.attachments.length > 0 ? currentLesson.attachments : [
                        { name: 'playwright.config.ts', size: '2.4 KB', fileType: 'typescript', url: '#' },
                        { name: 'pom-starter-template.zip', size: '4.8 MB', fileType: 'zip', url: '#' },
                      ]).map((att, aIdx) => {
                        const isPdf = att.name?.toLowerCase().endsWith('.pdf') || att.fileType === 'pdf';
                        const isImg = att.name?.toLowerCase().match(/\.(png|jpg|jpeg|webp|svg)$/i) || att.fileType === 'image';
                        return (
                          <div
                            key={aIdx}
                            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3 text-xs shadow-lg hover:border-slate-700 transition"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 truncate">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                                  isPdf ? 'bg-rose-500/20 text-rose-400' : isImg ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/20 text-indigo-400'
                                }`}>
                                  {isPdf ? 'PDF' : isImg ? 'IMG' : 'DOC'}
                                </div>
                                <div className="truncate">
                                  <div className="font-bold text-slate-200 truncate">{att.name}</div>
                                  <div className="text-[10px] text-slate-500">{att.size || '1.2 MB'} • {isPdf ? 'PDF Document' : isImg ? 'Image Asset' : (att.fileType || 'Attachment')}</div>
                                </div>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                isPdf ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : isImg ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}>
                                {isPdf ? 'PDF' : isImg ? 'IMAGE' : 'DOWNLOAD'}
                              </span>
                            </div>

                            {/* Image Preview thumbnail if image */}
                            {isImg && att.url && att.url !== '#' && (
                              <div className="w-full h-32 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                                <img src={att.url} alt={att.name} className="w-full h-full object-cover cursor-pointer hover:scale-105 transition" onClick={() => window.open(att.url, '_blank')} />
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
                              {isPdf && att.url && att.url !== '#' && (
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-[11px] text-center border border-rose-500/20 transition"
                                >
                                  📄 Open / Preview PDF
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  if (att.url && att.url !== '#') {
                                    const link = document.createElement('a');
                                    link.href = att.url;
                                    link.download = att.name;
                                    link.click();
                                  } else {
                                    alert(`✓ Downloading resource package: ${att.name}`);
                                  }
                                }}
                                className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] border border-slate-700 transition cursor-pointer text-center"
                              >
                                ⬇ Download {isPdf ? 'PDF' : 'File'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ════════════════════════════════════════════════════════════════════
                  PREVIOUS / NEXT LESSON NAVIGATION CONTROLLER
              ════════════════════════════════════════════════════════════════════ */}
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                {prevLesson ? (
                  <Link
                    href={`/learn/${courseId}/${prevLesson._id}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition border border-slate-700 cursor-pointer"
                  >
                    <ChevronLeft size={16} /> Previous: {prevLesson.title.split('.')[1] || prevLesson.title}
                  </Link>
                ) : (
                  <div className="text-xs text-slate-500 font-bold px-3 py-2">
                    🎯 First Lesson in Curriculum
                  </div>
                )}

                <div className="text-xs text-slate-400 font-mono text-center">
                  Lesson <span className="text-indigo-400 font-black">{currentIdx + 1}</span> of <span className="text-white font-black">{lessons.length}</span>
                </div>

                {nextLesson ? (
                  <Link
                    href={`/learn/${courseId}/${nextLesson._id}`}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white text-xs font-black transition shadow-lg shadow-indigo-950/60 cursor-pointer"
                  >
                    Next: {nextLesson.title.split('.')[1] || nextLesson.title} <ChevronRight size={16} />
                  </Link>
                ) : (
                  <button
                    onClick={handleMarkComplete}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-black shadow-lg cursor-pointer"
                  >
                    <Award size={16} /> Finish Course & Claim Certificate
                  </button>
                )}
              </div>

              {/* ════════════════════════════════════════════════════════════════════
                  CROSS-MODULE: CONNECTED QA PORTFOLIO PROJECTS
              ════════════════════════════════════════════════════════════════════ */}
              {relatedProjects.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-emerald-400" />
                      <h3 className="text-sm font-black text-white">Hands-On QA Portfolio Projects</h3>
                    </div>
                    <Link href="/projects" className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1">
                      View All Projects <ExternalLink size={11} />
                    </Link>
                  </div>
                  <p className="text-xs text-slate-400">
                    Apply the test automation concepts from this lesson to production-grade enterprise case studies:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {relatedProjects.slice(0, 3).map(p => (
                      <div key={p._id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3 shadow-md hover:border-emerald-500/40 transition">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {p.category || 'QA Automation'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-bold">
                              {p.automationCoverage || 95}% Cov
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-white line-clamp-1">{p.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{p.description || p.clientName || 'Automated regression test framework architecture.'}</p>
                          {/* Technology Badges */}
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {(Array.isArray(p.technologies) ? p.technologies.slice(0, 3) : ['Playwright', 'TypeScript']).map((tech, i) => (
                              <span key={i} className="px-1.5 py-0.2 rounded bg-slate-900 text-slate-300 text-[9px] font-mono border border-slate-800">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Links */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                          {p.links?.github && (
                            <a
                              href={p.links.github}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-bold text-center border border-slate-800 transition"
                            >
                              GitHub Code
                            </a>
                          )}
                          {p.links?.live && (
                            <a
                              href={p.links.live}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-[10px] font-bold text-center border border-emerald-500/30 transition"
                            >
                              Live Report
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════════════
                  CROSS-MODULE: CONNECTED YOUTUBE MASTERCLASSES
              ════════════════════════════════════════════════════════════════════ */}
              {relatedVideos.length > 0 && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Video size={16} className="text-rose-400" />
                      <h3 className="text-sm font-black text-white">Related Video Masterclasses</h3>
                    </div>
                    <Link href="/youtube" className="text-[11px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1">
                      Browse Video Hub <ExternalLink size={11} />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedVideos.slice(0, 2).map(v => (
                      <div key={v._id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex gap-3 items-center hover:border-rose-500/40 transition">
                        <div className="w-24 h-16 rounded-xl bg-slate-900 overflow-hidden shrink-0 relative flex items-center justify-center border border-slate-800">
                          {v.thumbnailUrl ? (
                            <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                          ) : (
                            <Play size={18} className="text-rose-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-200 truncate">{v.title}</h4>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{v.category || 'QA Automation'}</p>
                          <a
                            href={v.youtubeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold inline-flex items-center gap-1 mt-1"
                          >
                            Watch Video <ExternalLink size={9} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
