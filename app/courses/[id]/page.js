'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Play,
  Users,
  Star,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  Award,
  Sparkles,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

export default function CourseDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.id;

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentSettings, setPaymentSettings] = useState({ currencySymbol: '₹', commonFeeAmount: 499 });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cRes, lRes, pRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`).then(r => r.json()),
          fetch(`/api/courses/${courseId}/lessons`).then(r => r.json()).catch(() => []),
          fetch('/api/payments').then(r => r.json()).catch(() => ({})),
        ]);
        setCourse(cRes);
        setLessons(Array.isArray(lRes) ? lRes : []);
        if (pRes?.paymentSettings) {
          setPaymentSettings(pRes.paymentSettings);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (courseId) loadData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm">
        <Sparkles size={24} className="text-indigo-400 animate-spin mr-2" /> Loading course details...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-center p-6">
        <div>
          <h2 className="text-xl font-bold">Course Not Found</h2>
          <Link href="/courses" className="mt-4 inline-block px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold">
            &larr; Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const firstLessonId = lessons[0]?._id || 'intro';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Course Header Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {course.category || 'Development'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                {course.level || 'All Levels'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              {course.title}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              {course.fullDescription || course.description || 'Master this QA automation framework with hands-on live code exercises and test architecture.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star size={15} className="fill-amber-400" /> {course.rating || 5}.0 ({course.reviewsCount || 1025} ratings)
              </div>
              <div className="flex items-center gap-1">
                <Users size={15} className="text-indigo-400" /> {course.studentsCount || 1420} students enrolled
              </div>
              <div className="flex items-center gap-1">
                <Clock size={15} className="text-purple-400" /> {course.duration || '16 Weeks'}
              </div>
              <div className="flex items-center gap-1">
                <GraduationCap size={15} className="text-emerald-400" /> Instructor: {course.instructor || 'QA RP'}
              </div>
            </div>
          </div>

          {/* Right Card: Video Preview & Start Learning */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl shadow-indigo-950/60 sticky top-24">
            <div className="h-44 rounded-2xl bg-slate-800 relative overflow-hidden">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">Thumbnail</div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-black text-emerald-400">
                  {course.isFree ? '100% Free' : `${paymentSettings.currencySymbol || '₹'}${course.price || paymentSettings.commonFeeAmount || 499}`}
                </div>
                {course.originalPrice > 0 && (
                  <div className="text-xs text-slate-500 line-through">
                    {paymentSettings.currencySymbol || '₹'}{course.originalPrice}
                  </div>
                )}
              </div>

              <Link
                href={`/learn/${course._id}/${firstLessonId}`}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-indigo-950/80 hover:scale-105"
              >
                <Play size={16} /> Start Learning Now
              </Link>
            </div>
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <CheckCircle2 size={20} className="text-emerald-400" /> What You Will Learn
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(course.objectives?.length ? course.objectives : [
              'Core framework architecture and object-oriented test design',
              'Page Object Model (POM) and modular reusable utilities',
              'API request automation and JSON schema validations',
              'Git, GitHub Actions CI/CD matrix and parallel execution',
              'Reporting with Allure / HTML summaries and defect tracking'
            ]).map((obj, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Course Curriculum & Lessons */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white">Course Curriculum &amp; Lessons</h3>
              <p className="text-xs text-slate-400 mt-1">
                {lessons.length || 5} lessons available in this training module.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson._id || idx}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between hover:border-indigo-500/40 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-white">{lesson.title}</h4>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1"><Video size={10} /> {lesson.duration || '10:00'}</span>
                      {lesson.freePreview && <span className="text-emerald-400 font-bold">Free Preview</span>}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/learn/${course._id}/${lesson._id}`}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 text-xs font-bold border border-slate-800 transition"
                >
                  Open Lesson &rarr;
                </Link>
              </div>
            ))}

            {lessons.length === 0 && (
              <div className="space-y-2">
                {[
                  '1. Introduction to Test Automation Architecture',
                  '2. Setting up Java & Node.js Runtime Environments',
                  '3. Locator Strategies & Resilient Selectors',
                  '4. Page Object Model Design Patterns',
                  '5. CI/CD Integration with GitHub Actions'
                ].map((title, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">{i + 1}</span>
                      <span className="font-bold text-xs text-white">{title}</span>
                    </div>
                    <Link
                      href={`/learn/${course._id}/sample-${i + 1}`}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                    >
                      Start Lesson
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
