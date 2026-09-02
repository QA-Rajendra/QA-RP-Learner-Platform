'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  Briefcase,
  Video,
  CheckCircle2,
  Terminal,
  ArrowRight,
  Play,
  Layers,
  Code2,
  Zap,
  Mail,
  Send,
  ExternalLink,
  Shield,
  Star,
  Users,
  Award,
  Crown
} from 'lucide-react';

const TECH_STACK = [
  { name: 'Playwright', icon: '🎭', category: 'E2E & API' },
  { name: 'Selenium', icon: '🌐', category: 'Web Automation' },
  { name: 'RestAssured', icon: '⚡', category: 'API Testing' },
  { name: 'Cypress', icon: '🌲', category: 'Frontend Testing' },
  { name: 'Postman', icon: '🚀', category: 'API Testing' },
  { name: 'JMeter', icon: '📊', category: 'Performance' },
  { name: 'Docker', icon: '🐳', category: 'DevOps & CI/CD' },
  { name: 'Jenkins', icon: '⚙️', category: 'CI/CD Pipelines' },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ courses: 0, projects: 0, students: 1248 });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    // Fetch live data from MongoDB
    async function loadData() {
      try {
        const [crsRes, prjRes, vidRes, catRes] = await Promise.all([
          fetch('/api/courses').then(r => r.json()).catch(() => []),
          fetch('/api/portfolio-projects').then(r => r.json()).catch(() => []),
          fetch('/api/youtube').then(r => r.json()).catch(() => []),
          fetch('/api/categories').then(r => r.json()).catch(() => []),
        ]);

        const crsList = Array.isArray(crsRes) ? crsRes : [];
        const prjList = Array.isArray(prjRes) ? prjRes : [];
        const vidList = Array.isArray(vidRes) ? vidRes : [];
        const catList = Array.isArray(catRes) ? catRes : [];

        setCourses(crsList.slice(0, 6));
        setProjects(prjList.slice(0, 4));
        setVideos(vidList.slice(0, 4));
        setCategories(catList);
        setStats({
          courses: crsList.length || 12,
          projects: prjList.length || 24,
          students: 1248
        });
      } catch (e) {
        console.error('Home data error:', e);
      }
    }
    loadData();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMsg) return;
    setContactSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject || 'QA Platform Inquiry',
          message: contactMsg
        })
      });
      if (res.ok) {
        setContactSent(true);
        setContactName('');
        setContactEmail('');
        setContactSubject('');
        setContactMsg('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setContactSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans" suppressHydrationWarning>
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-24 border-b border-slate-800/80 bg-radial from-indigo-950/40 via-slate-950 to-slate-950" suppressHydrationWarning>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" suppressHydrationWarning>
          <div className="text-center max-w-3xl mx-auto space-y-6" suppressHydrationWarning>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider animate-pulse">
              <Sparkles size={14} className="text-indigo-400" /> QA Engineer Portfolio &amp; Learning Platform
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Master QA Automation &amp; Showcase <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Enterprise Quality</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Explore enterprise-grade automation frameworks, comprehensive test blueprints, hands-on tutorials, and full curriculum courses in Playwright, Selenium, Java, and REST APIs.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/courses"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition shadow-xl shadow-indigo-950/60 hover:scale-105"
              >
                <BookOpen size={17} /> Explore All Courses
              </Link>
              <Link
                href="/projects"
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-sm transition hover:scale-105"
              >
                <Briefcase size={17} /> View QA Projects
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-slate-800/60 max-w-4xl mx-auto" suppressHydrationWarning>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800" suppressHydrationWarning>
                <div className="text-2xl sm:text-3xl font-black text-indigo-400" suppressHydrationWarning>{stats.projects}</div>
                <div className="text-xs font-semibold text-slate-400 mt-1">QA Projects</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800" suppressHydrationWarning>
                <div className="text-2xl sm:text-3xl font-black text-purple-400" suppressHydrationWarning>{stats.courses}</div>
                <div className="text-xs font-semibold text-slate-400 mt-1">Video Courses</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800" suppressHydrationWarning>
                <div className="text-2xl sm:text-3xl font-black text-orange-400" suppressHydrationWarning>{categories.length || 6}</div>
                <div className="text-xs font-semibold text-slate-400 mt-1">Taxonomy Tracks</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800" suppressHydrationWarning>
                <div className="text-2xl sm:text-3xl font-black text-pink-400" suppressHydrationWarning>{stats.students.toLocaleString()}+</div>
                <div className="text-xs font-semibold text-slate-400 mt-1">Active Learners</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TECH STACK SHOWCASE */}
      <section className="py-12 border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Automation Stack &amp; Tools Covered</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {TECH_STACK.map((tech, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1 hover:border-indigo-500/50 transition hover:scale-105">
                <div className="text-2xl">{tech.icon}</div>
                <div className="font-bold text-xs text-white">{tech.name}</div>
                <div className="text-[10px] text-slate-400">{tech.category}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. BROWSE BY CATEGORY SECTION */}
      {categories.length > 0 && (
        <section className="py-16 border-b border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">Learning Taxonomy</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Browse by Specialization</h2>
              </div>
              <Link href="/categories" className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1">
                View All Categories ({categories.length}) &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat._id || cat.name}
                  href={`/courses?category=${encodeURIComponent(cat.name)}`}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2 hover:border-orange-500/50 transition hover:scale-105 hover:shadow-xl hover:shadow-orange-950/40 group flex flex-col items-center justify-center cursor-pointer"
                >
                  <span className="text-3xl inline-block group-hover:scale-110 transition duration-200">
                    {cat.icon || '🏷️'}
                  </span>
                  <div className="font-bold text-xs text-white group-hover:text-orange-300 transition line-clamp-1">
                    {cat.name}
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Explore Track &rarr;
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. FEATURED COURSES SECTION */}
      <section className="py-16 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Top Curriculum</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Featured Automation Courses</h2>
            </div>
            <Link href="/courses" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View All Courses ({courses.length}) &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden flex flex-col justify-between hover:border-indigo-500/40 transition hover:shadow-xl hover:shadow-indigo-950/40 group">
                <div>
                  <div className="h-44 w-full bg-slate-800 relative overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold">QA Course</div>
                    )}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-md">
                      {course.category || 'Development'}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-950/80 backdrop-blur text-slate-200">
                      {course.duration || '16 Weeks'}
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-sm text-white line-clamp-2 leading-snug group-hover:text-indigo-300 transition">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {course.shortDescription || course.description || 'Master complete test automation with real-world scenarios.'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-indigo-400" /> {course.studentsCount || 156} learners
                      </span>
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star size={13} className="fill-amber-400" /> {course.rating || 5}.0
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/courses/${course._id}`}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-indigo-950/50"
                  >
                    <Play size={13} /> View Curriculum &amp; Start
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. QA PORTFOLIO PROJECTS SHOWCASE */}
      <section className="py-16 border-b border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Enterprise Experience</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Featured QA Projects</h2>
            </div>
            <Link href="/projects" className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1">
              View All Projects &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div key={proj._id} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-purple-500/40 transition flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {proj.category || 'Automation'}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={14} /> {proj.automationCoverage || 85}% Coverage
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white">{proj.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {proj.shortDescription || proj.description || 'Complete test automation framework with CI/CD integration.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {proj.technologies?.slice(0, 4).map((tech, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-[10px] font-semibold text-slate-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                  <Link
                    href={`/projects#${proj._id}`}
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs text-center transition"
                  >
                    View Project Case Study
                  </Link>
                  {proj.links?.github && (
                    <a
                      href={proj.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="GitHub Repository"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CONTACT SECTION */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Get In Touch</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Have a Project or Question?</h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Send a direct inquiry for automation consulting, course access, or enterprise testing services.
              </p>
            </div>

            {contactSent ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400 animate-bounce" />
                <h3 className="font-bold text-white text-sm">Message Sent Successfully!</h3>
                <p className="text-xs text-slate-300">Thank you. Your inquiry has been stored and will be reviewed shortly.</p>
                <button
                  onClick={() => setContactSent(false)}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                  <input
                    type="text"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="e.g. Automation Training / Project Consultation"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Message *</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMsg}
                    onChange={(e) => setContactMsg(e.target.value)}
                    placeholder="Describe your inquiry..."
                    className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSending}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-xl shadow-indigo-950/60"
                >
                  <Send size={15} /> {contactSending ? 'Sending Message...' : 'Send Message to Admin'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}