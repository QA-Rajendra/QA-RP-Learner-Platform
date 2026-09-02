'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Filter,
  Users,
  Star,
  Play,
  Clock,
  Sparkles,
  CheckCircle,
  GraduationCap,
  Tag
} from 'lucide-react';

function CoursesContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('category') || 'All';

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  useEffect(() => {
    if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category'));
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cRes, catRes] = await Promise.all([
          fetch('/api/courses').then(r => r.json()).catch(() => []),
          fetch('/api/categories').then(r => r.json()).catch(() => []),
        ]);
        if (Array.isArray(cRes)) setCourses(cRes);
        if (Array.isArray(catRes)) setCategories(catRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredCourses = courses.filter((c) => {
    if (selectedCategory !== 'All' && c.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (selectedDifficulty !== 'All' && c.level !== selectedDifficulty) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase">
            <GraduationCap size={15} /> All Automation Courses
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Learn QA Automation Step-by-Step
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Browse our complete course catalog. Enroll in blueprints covering Playwright, Selenium, Java, RestAssured, and Framework Design.
          </p>
        </div>

        {/* Dynamic Category Pill Chips */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/60'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🌟 All ({courses.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id || cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/60'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{cat.icon || '🏷️'}</span>
                <span>{cat.name}</span>
                {cat.coursesCount !== undefined && (
                  <span className="text-[10px] opacity-70">({cat.coursesCount})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id || cat.name} value={cat.name}>
                  {cat.icon || '📚'} {cat.name}
                </option>
              ))}
              {categories.length === 0 && (
                <>
                  <option value="Development">Development</option>
                  <option value="QA Automation">QA Automation</option>
                  <option value="Photography">Photography</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Design">Design</option>
                </>
              )}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert / Advanced</option>
              <option value="All levels">All Levels</option>
            </select>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-indigo-500/40 transition hover:shadow-2xl hover:shadow-indigo-950/40 group">
              <div>
                <div className="h-48 w-full bg-slate-800 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold">Course Image</div>
                  )}
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-md">
                    {course.category || 'Development'}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/80 backdrop-blur text-slate-200">
                    {course.duration || '16 Weeks'}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <h2 className="font-extrabold text-base text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition">
                    {course.title}
                  </h2>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {course.shortDescription || course.description || 'Master complete test automation with real-world scenarios.'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Users size={14} className="text-indigo-400" /> {course.studentsCount || 156} learners
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star size={14} className="fill-amber-400" /> {course.rating || 5}.0 ({course.reviewsCount || 890})
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-2">
                <Link
                  href={`/courses/${course._id}`}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-950/50"
                >
                  <Play size={14} /> Start Course
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && !loading && (
          <div className="py-20 text-center text-slate-500 text-sm">
            No courses match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading courses...</div>}>
      <CoursesContent />
    </Suspense>
  );
}
