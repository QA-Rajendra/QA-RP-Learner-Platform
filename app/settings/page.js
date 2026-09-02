'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import ClientOnly from '@/components/common/ClientOnly';
import FileUploadZone from '@/components/common/FileUploadZone';
import {
  Settings, User, ShieldCheck, Users, Sliders, Bell, Lock, Check, X,
  Sparkles, Save, Crown, CreditCard, Palette, GraduationCap, Briefcase,
  Trash2, Plus, RefreshCw, Globe, Mail, Smartphone, MapPin, CheckCircle2,
  AlertCircle, BookOpen, Video, Play, FileText, Code2, Eye, ExternalLink,
  Layers, Terminal, Zap, ArrowRight, ArrowLeft, Search, Filter, CheckCircle,
  HelpCircle, Award, Copy, Download, Laptop, Monitor, CheckCheck, Wand2,
  Tag, FolderPlus, Share2, FileCode, CheckSquare, ListPlus, Flame, Layout,
  FileJson, Clock, BarChart2, Star, Edit2, Database, Activity, TrendingUp, Info,
  UploadCloud, Image as ImageIcon
} from 'lucide-react';

// ─── CONSTANTS & TEMPLATES ─────────────────────────────────────────────────
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];


const PERMISSIONS_DATA = [
  { module: 'Courses & Curriculum', permissions: [
    { action: 'Browse & Search Courses', admin: true, user: true, instructor: true, desc: 'View published course catalog' },
    { action: 'Create New Course', admin: true, user: false, instructor: true, desc: 'Create courses with metadata and pricing' },
    { action: 'Edit Any Course', admin: true, user: false, instructor: false, desc: 'Modify details and publishing status' },
    { action: 'Delete Course', admin: true, user: false, instructor: false, desc: 'Permanently remove courses' },
  ]},
  { module: 'QA Portfolio Projects', permissions: [
    { action: 'Browse Projects', admin: true, user: true, instructor: true, desc: 'Inspect automation frameworks and repos' },
    { action: 'Create Case Study', admin: true, user: false, instructor: true, desc: 'Publish frameworks and metrics' },
    { action: 'Delete Projects', admin: true, user: false, instructor: false, desc: 'Remove portfolio case studies' },
  ]},
  { module: 'Users & Roles Management', permissions: [
    { action: 'View Users List', admin: true, user: true, instructor: false, desc: 'Browse user directory' },
    { action: 'Change User Roles', admin: true, user: false, instructor: false, desc: 'Promote or demote accounts' },
    { action: 'Delete User Accounts', admin: true, user: false, instructor: false, desc: 'Erase accounts from MongoDB' },
  ]},
  { module: 'Payments & Billing', permissions: [
    { action: 'View Payment Settings', admin: true, user: false, instructor: false, desc: 'Access pricing configuration' },
    { action: 'Modify Common Fee', admin: true, user: false, instructor: false, desc: 'Update the global lesson fee' },
    { action: 'View Transaction Logs', admin: true, user: false, instructor: false, desc: 'Browse payment receipts' },
  ]},
];

// ─── SUB-COMPONENTS ─────────────────────────────────────────────────────────
function TabButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
        active
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50 scale-[1.03]'
          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
          active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ icon, label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
  };

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${colors[color]} border flex flex-col gap-2`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]} bg-slate-900`}>
        {icon}
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div>
        <div className="text-xs font-bold text-white">{label}</div>
        {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, themes, currentTheme, isDark } = useTheme();

  useEffect(() => { setMounted(true); }, []);
  const isAdmin = mounted && session?.user?.role === 'ADMIN';

  // ── UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [switching, setSwitching] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, message: '', type: 'success' });

  // ── Data Collections
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [allLessons, setAllLessons] = useState([]);

  // ── Pricing Settings
  const [pricingSettings, setPricingSettings] = useState({
    paymentEnabled: true, commonFeeAmount: 499, currency: 'INR', currencySymbol: '₹',
    paymentType: 'One-time', paidContentAccess: 'After successful payment', confirmationPopup: true,
  });

  // ── Profile
  const [profile, setProfile] = useState({
    name: 'QA RP', email: 'qarajendra4893@gmail.com',
    designation: 'Lead QA Automation Engineer & Instructor',
    bio: 'Specializing in enterprise Playwright, Selenium, Java, and CI/CD automation frameworks.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43210', location: 'Pune, India', website: 'qarp.io',
    preferences: { emailNotifications: true, courseUpdates: true, marketingEmails: false }
  });

  // ── Course Hierarchy
  const [selectedCourseForHierarchy, setSelectedCourseForHierarchy] = useState(null);
  const [newSectionModalOpen, setNewSectionModalOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [hierarchyLessonModalOpen, setHierarchyLessonModalOpen] = useState(false);
  const [targetSectionForLesson, setTargetSectionForLesson] = useState('');
  const [hierarchyLessonForm, setHierarchyLessonForm] = useState({
    title: '', sectionTitle: 'Section 1: Introduction', contentType: 'video',
    accessType: 'FREE', duration: '15 mins', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', notes: '',
  });

  // ── Course Modal (Create & Edit)
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '', shortDescription: '', category: 'QA Automation', difficulty: 'Beginner',
    duration: '8 Weeks', instructor: 'QA RP', isFree: true, price: 0, status: 'Active',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&auto=format&fit=crop&q=80',
  });

  // ── Helper to format lesson for DB API
  const formatLessonForDB = (raw) => {
    const objectives = typeof raw.objectives === 'string'
      ? raw.objectives.split('\n').map(s => s.trim()).filter(Boolean)
      : Array.isArray(raw.objectives) ? raw.objectives : [];

    const quiz = [];
    if (raw.quizQ1 && raw.quizQ1.trim()) {
      quiz.push({
        question: raw.quizQ1.trim(),
        options: typeof raw.quizOpt1 === 'string' ? raw.quizOpt1.split(',').map(s => s.trim()).filter(Boolean) : (raw.quizOpt1 || ['Option A', 'Option B', 'Option C']),
        correctAnswerIndex: Number(raw.quizCorrect1 || 0),
        explanation: raw.quizExp1 || '',
      });
    }

    const attachments = [];
    if (raw.attachmentName && raw.attachmentName.trim()) {
      attachments.push({
        name: raw.attachmentName.trim(),
        url: raw.attachmentUrl || '#',
        size: raw.attachmentSize || '1.4 MB',
        fileType: raw.attachmentName.endsWith('.ts') ? 'typescript' : raw.attachmentName.endsWith('.zip') ? 'zip' : 'document',
      });
    }

    return {
      title: raw.title,
      sectionTitle: raw.sectionTitle || 'Section 1: Introduction',
      duration: raw.duration || '15 minutes',
      accessType: raw.accessType || 'FREE',
      isPaid: raw.accessType === 'PAID',
      freePreview: raw.accessType === 'FREE',
      videoUrl: raw.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      notes: raw.notes || '',
      codeSnippet: raw.codeSnippet || '',
      terminalCommand: raw.terminalCommand || '',
      objectives,
      quiz,
      attachments,
    };
  };

  // ── Helper for empty lesson row in multi-lesson creator
  const createEmptyLessonRow = (sec = 'Section 1: Introduction') => ({
    title: '',
    duration: '15 minutes',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    sectionTitle: sec,
    accessType: 'FREE',
    activeSubTab: 'notes',
    notes: '',
    codeSnippet: '',
    terminalCommand: '',
    objectives: '',
    quizQ1: '',
    quizOpt1: 'Role & Accessible Name, Full XPath, Dynamic Index',
    quizCorrect1: 0,
    attachmentName: '',
    attachmentUrl: '',
    attachmentSize: '1.4 MB',
  });

  // ── Multi-Lesson Batch Creator Modal (via Course)
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [selectedCourseForLesson, setSelectedCourseForLesson] = useState(null);
  const [batchSectionTitle, setBatchSectionTitle] = useState('Section 1: Introduction');
  const [multiLessonsList, setMultiLessonsList] = useState([
    createEmptyLessonRow('Section 1: Introduction'),
    createEmptyLessonRow('Section 1: Introduction'),
  ]);

  const handleOpenAddLesson = (course) => {
    setSelectedCourseForLesson(course);
    setBatchSectionTitle('Section 1: Introduction');
    setMultiLessonsList([
      createEmptyLessonRow('Section 1: Introduction'),
      createEmptyLessonRow('Section 1: Introduction'),
    ]);
    setLessonModalOpen(true);
  };

  // ── Lesson Notes & Content Editor Modal (Full Studio Edit)
  const [editingLessonModalOpen, setEditingLessonModalOpen] = useState(false);
  const [editingLessonForm, setEditingLessonForm] = useState({
    ...createEmptyLessonRow('Section 1: Introduction'),
    _id: '',
  });

  // ── Project Modal
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '', shortDescription: '', category: 'Web Automation', projectType: 'Commercial',
    clientName: '', industry: 'Technology', role: 'Lead QA Automation Engineer',
    teamSize: '4 Engineers', duration: '3 Months',
    automationCoverage: 90, testCases: 180, bugsFiled: 40,
    technologies: 'Playwright, TypeScript, Docker, GitHub Actions, Allure',
    githubUrl: 'https://github.com',
    liveUrl: 'https://demo.example.com',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=700&auto=format&fit=crop&q=80',
    status: 'Active',
  });

  // ── Category Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '', slug: '', icon: '🤖', status: 'Active' });

  // ── Video Modal
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: '', youtubeUrl: '', description: '', category: 'Automation Frameworks' });

  // ─── DATA LOADING ─────────────────────────────────────────────────────────
  const loadAllData = async () => {
    try {
      const [crsRes, prjRes, vidRes, catRes, usrRes, lesRes, setRes] = await Promise.all([
        fetch('/api/courses').then(r => r.json()).catch(() => []),
        fetch('/api/portfolio-projects').then(r => r.json()).catch(() => []),
        fetch('/api/youtube').then(r => r.json()).catch(() => []),
        fetch('/api/categories').then(r => r.json()).catch(() => []),
        fetch('/api/users').then(r => r.json()).catch(() => []),
        fetch('/api/lessons').then(r => r.json()).catch(() => []),
        fetch('/api/settings').then(r => r.json()).catch(() => ({})),
      ]);
      setCourses(Array.isArray(crsRes) ? crsRes : []);
      setProjects(Array.isArray(prjRes) ? prjRes : []);
      setVideos(Array.isArray(vidRes) ? vidRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
      setUsers(Array.isArray(usrRes) ? usrRes : []);
      setAllLessons(Array.isArray(lesRes) ? lesRes : []);
      if (setRes?.paymentSettings) setPricingSettings(setRes.paymentSettings);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadAllData();
    })();
    return () => { cancelled = true; };
  }, []);

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setSaveStatus({ show: true, message, type });
    setTimeout(() => setSaveStatus({ show: false, message: '', type: 'success' }), 4000);
  };

  const switchToAdmin = async () => {
    setSwitching(true);
    let res = await signIn('credentials', { email: 'qarajendra4893@gmail.com', password: 'rgp@1234', redirect: false });
    if (res?.error) res = await signIn('credentials', { email: 'admin@example.com', password: 'demo', redirect: false });
    setSwitching(false);
    window.location.reload();
  };

  const switchToUser = async () => {
    setSwitching(true);
    await signOut({ redirect: false });
    setSwitching(false);
    window.location.reload();
  };

  // ─── ACTION HANDLERS ──────────────────────────────────────────────────────

  // Save Pricing Settings
  const handleSavePricingSettings = async () => {
    setSwitching(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentSettings: pricingSettings }),
      });
      if (res.ok) { showToast(`✓ Common fee set to ${pricingSettings.currencySymbol}${pricingSettings.commonFeeAmount}!`); loadAllData(); }
      else showToast('Failed to save payment settings', 'error');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSwitching(false); }
  };

  // Toggle Lesson FREE/PAID
  const handleToggleLessonAccessType = async (lesson) => {
    const newAccessType = lesson.accessType === 'PAID' || lesson.isPaid ? 'FREE' : 'PAID';
    try {
      const res = await fetch(`/api/lessons/${lesson._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessType: newAccessType, isPaid: newAccessType === 'PAID', freePreview: newAccessType === 'FREE' }),
      });
      if (res.ok) { showToast(`✓ "${lesson.title}" → ${newAccessType}`); loadAllData(); }
      else showToast('Failed to update', 'error');
    } catch (err) { showToast(err.message, 'error'); }
  };

  // Delete Lesson
  const handleDeleteLesson = async (lessonId, lessonTitle) => {
    if (!confirm(`Delete lesson "${lessonTitle}"?`)) return;
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' });
      if (res.ok) { showToast(`✓ Deleted "${lessonTitle}"`); loadAllData(); }
    } catch (err) { showToast(err.message, 'error'); }
  };

  // Create Lesson in Hierarchy
  const handleCreateLessonInHierarchy = async (e) => {
    e.preventDefault();
    if (!selectedCourseForHierarchy) return;
    try {
      const payload = {
        ...hierarchyLessonForm,
        courseId: selectedCourseForHierarchy._id,
        courseTitle: selectedCourseForHierarchy.title,
        sectionTitle: hierarchyLessonForm.sectionTitle || 'Section 1: Introduction',
        isPaid: hierarchyLessonForm.accessType === 'PAID',
        freePreview: hierarchyLessonForm.accessType === 'FREE',
      };
      const res = await fetch('/api/lessons', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      if (res.ok) {
        showToast(`✓ Lesson "${hierarchyLessonForm.title}" created!`);
        setHierarchyLessonModalOpen(false);
        setHierarchyLessonForm({ title: '', sectionTitle: 'Section 1: Introduction', contentType: 'video', accessType: 'FREE', duration: '15 mins', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', notes: '' });
        loadAllData();
      } else showToast('Failed to create lesson', 'error');
    } catch (err) { showToast(err.message, 'error'); }
  };



  // Open Edit Course
  const handleOpenEditCourse = (course) => {
    setCourseForm({
      _id: course._id,
      title: course.title || '',
      shortDescription: course.shortDescription || '',
      category: course.category || 'QA Automation',
      difficulty: course.difficulty || 'Beginner',
      duration: course.duration || '8 Weeks',
      instructor: course.instructor || 'QA RP',
      isFree: course.isFree !== false,
      price: course.price || 0,
      status: course.status || 'Active',
      thumbnail: course.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&auto=format&fit=crop&q=80',
    });
    setCourseModalOpen(true);
  };


  // Create or Update Course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    const isUpdate = !!courseForm._id;
    try {
      const res = await fetch(isUpdate ? `/api/courses/${courseForm._id}` : '/api/courses', {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm),
      });
      if (res.ok) {
        const saved = await res.json();
        showToast(isUpdate ? `✓ Course "${saved.title}" updated!` : `✓ Course "${saved.title}" created!`);
        setCourseModalOpen(false);
        setCourseForm({
          title: '', shortDescription: '', category: 'QA Automation', difficulty: 'Beginner',
          duration: '8 Weeks', instructor: 'QA RP', isFree: true, price: 0, status: 'Active',
          thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&auto=format&fit=crop&q=80'
        });
        loadAllData();
        if (!isUpdate) {
          setSelectedCourseForLesson(saved);
          setLessonModalOpen(true);
        }
      } else showToast(isUpdate ? 'Failed to update course' : 'Failed to create course', 'error');
    } catch (e) { showToast(e.message, 'error'); }
  };

  // Delete Course
  const handleDeleteCourse = async (id, title) => {
    if (!confirm(`Delete course "${title}"?`)) return;
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) { showToast(`✓ Course "${title}" deleted.`); loadAllData(); }
    } catch (e) { showToast(e.message, 'error'); }
  };


  // Add Multiple Lessons (Batch Save)
  const handleSaveMultipleLessons = async (e) => {
    if (e) e.preventDefault();
    if (!selectedCourseForLesson) {
      showToast('⚠️ No course selected', 'error');
      return;
    }
    const valid = multiLessonsList.filter(l => l.title && l.title.trim());
    if (valid.length === 0) {
      showToast('⚠️ Please provide a Lesson Title for at least one lesson before saving!', 'error');
      return;
    }
    try {
      const formattedLessons = valid.map(l => formatLessonForDB({
        ...l,
        sectionTitle: l.sectionTitle?.trim() || batchSectionTitle?.trim() || 'Section 1: Introduction'
      }));
      const res = await fetch(`/api/courses/${selectedCourseForLesson._id}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessons: formattedLessons }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Added ${valid.length} lessons with 5-point studio data to "${selectedCourseForLesson.title}"!`);
        setLessonModalOpen(false);
        setMultiLessonsList([
          createEmptyLessonRow(batchSectionTitle || 'Section 1: Introduction'),
          createEmptyLessonRow(batchSectionTitle || 'Section 1: Introduction'),
        ]);
        loadAllData();
      } else {
        showToast(data.error || 'Failed to add lessons', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to add lessons', 'error');
    }
  };

  // ── Edit Lesson Notes & Content Handler
  const handleOpenEditLesson = (lesson) => {
    const q1 = lesson.quiz?.[0] || {};
    const q2 = lesson.quiz?.[1] || {};
    const att1 = lesson.attachments?.[0] || {};
    setEditingLessonForm({
      _id: lesson._id,
      title: lesson.title || '',
      sectionTitle: lesson.sectionTitle || 'Section 1: Introduction',
      duration: lesson.duration || '15 minutes',
      accessType: lesson.accessType || (lesson.isPaid ? 'PAID' : 'FREE'),
      videoUrl: lesson.videoUrl || '',
      activeSubTab: 'notes',
      notes: lesson.notes || '',
      codeSnippet: lesson.codeSnippet || '',
      terminalCommand: lesson.terminalCommand || '',
      objectives: Array.isArray(lesson.objectives) ? lesson.objectives.join('\n') : lesson.objectives || '',
      quizQ1: q1.question || '',
      quizOpt1: Array.isArray(q1.options) ? q1.options.join(', ') : 'Role & Accessible Name, Full XPath, Dynamic Index',
      quizCorrect1: q1.correctAnswerIndex ?? 0,
      quizQ2: q2.question || '',
      quizOpt2: Array.isArray(q2.options) ? q2.options.join(', ') : 'Built-in auto-waiting, 10s Thread.sleep, Disable asserts',
      quizCorrect2: q2.correctAnswerIndex ?? 0,
      attachmentName: att1.name || '',
      attachmentUrl: att1.url || '',
      attachmentSize: att1.size || '1.4 MB',
    });
    setEditingLessonModalOpen(true);
  };

  const handleSaveEditedLesson = async (e) => {
    e.preventDefault();
    if (!editingLessonForm._id) return;
    try {
      const payload = formatLessonForDB(editingLessonForm);

      const res = await fetch(`/api/lessons/${editingLessonForm._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(`✓ Lesson "${editingLessonForm.title}" & 5 Learning Points updated!`);
        setEditingLessonModalOpen(false);
        loadAllData();
      } else {
        showToast('Failed to update lesson notes', 'error');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Create Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.title.trim()) {
      showToast('⚠️ Please enter a Project Title!', 'error');
      return;
    }
    try {
      const techArray = typeof projectForm.technologies === 'string'
        ? projectForm.technologies.split(',').map(s => s.trim()).filter(Boolean)
        : projectForm.technologies || ['Playwright', 'TypeScript', 'Docker'];

      const payload = {
        ...projectForm,
        technologies: techArray,
        tools: techArray,
        links: {
          github: projectForm.githubUrl || '',
          live: projectForm.liveUrl || '',
        },
        defectsFound: Number(projectForm.bugsFiled ?? 25),
        testCases: Number(projectForm.testCases ?? 120),
        automationCoverage: Number(projectForm.automationCoverage ?? 85),
      };

      const res = await fetch('/api/portfolio-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Project "${projectForm.title}" published with Tech Stack & Links!`);
        setProjectModalOpen(false);
        loadAllData();
      } else {
        showToast(data.error || 'Failed to create project', 'error');
      }
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // Delete Project
  const handleDeleteProject = async (id, title) => {
    if (!confirm(`Delete project "${title}"?`)) return;
    try {
      const res = await fetch(`/api/portfolio-projects/${id}?permanent=true`, { method: 'DELETE' });
      if (res.ok) { showToast(`✓ Deleted "${title}"`); loadAllData(); }
    } catch (e) { showToast(e.message, 'error'); }
  };

  // Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(catForm) });
      if (res.ok) { showToast(`✓ Category "${catForm.name}" created!`); setCatModalOpen(false); loadAllData(); }
      else showToast('Failed to create category', 'error');
    } catch (e) { showToast(e.message, 'error'); }
  };

  // Create Video
  const handleCreateVideo = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/youtube', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(videoForm) });
      if (res.ok) {
        showToast(`✓ Video "${videoForm.title}" added!`);
        setVideoModalOpen(false); setVideoForm({ title: '', youtubeUrl: '', description: '', category: 'Automation Frameworks' }); loadAllData();
      } else showToast('Failed to create video', 'error');
    } catch (e) { showToast(e.message, 'error'); }
  };

  // Load Template
  const handleLoadTemplate = (tpl) => {
    setContentForm({ ...contentForm, ...tpl, learningObjectives: [...tpl.learningObjectives], attachments: [...tpl.attachments] });
    showToast(`✓ Loaded template: ${tpl.name}`);
  };

  // ─── LOADING STATE ────────────────────────────────────────────────────────
  if (!mounted || sessionStatus === 'loading') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <div className="w-12 h-12 rounded-2xl border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <p className="text-sm font-semibold">Loading Settings Studio...</p>
        </div>
      </div>
    );
  }

  // ─── ACCESS CONTROL ───────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
            <Lock size={32} />
          </div>
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">Admin Access Required</span>
            <h1 className="text-2xl font-black text-white mt-2">Restricted Area</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Settings & Data Creator Studio is reserved for Platform Administrators.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={switchToAdmin} disabled={switching}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-black shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Crown size={15} /> {switching ? 'Authenticating...' : '⚡ 1-Click Enter as Admin (QA RP)'}
            </button>
            <Link href="/signin" className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition border border-slate-700">
              <Lock size={13} /> Custom Admin Login →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── STATS ────────────────────────────────────────────────────────────────
  const totalFree = allLessons.filter(l => l.accessType !== 'PAID' && !l.isPaid).length;
  const totalPaid = allLessons.filter(l => l.accessType === 'PAID' || l.isPaid).length;

  // ─── MAIN RENDER ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen font-sans pb-20">
      {/* ── TOAST NOTIFICATION ─────────────────────────────────────────────── */}
      {saveStatus.show && (
        <div className={`fixed top-5 right-5 z-[200] px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-2 animate-fade-in transition ${
          saveStatus.type === 'error'
            ? 'bg-rose-600 text-white border border-rose-500'
            : 'bg-emerald-600 text-white border border-emerald-500'
        }`}>
          {saveStatus.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          {saveStatus.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* ── PAGE HEADER ──────────────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/80 to-indigo-950/40 border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                  <Crown size={11} /> ADMIN AUTHORITY ACTIVE
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  MongoDB Atlas Connected
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                Platform Settings & <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Creator Studio</span>
              </h1>
              <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
                Full Admin CRUD — Create, manage, and publish Courses, Lessons, Content, Projects, Categories, and configure global Paid Content & Pricing settings.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <div className="text-center">
                <div className="text-xs text-slate-400">Logged in as</div>
                <div className="text-sm font-black text-white">{session?.user?.name || 'Admin'}</div>
                <div className="text-[10px] text-red-400 font-bold">ADMIN</div>
              </div>
              <button
                onClick={switchToUser} disabled={switching}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition"
              >
                <GraduationCap size={14} /> Switch to Learner
              </button>
            </div>
          </div>

          {/* ── TAB NAVIGATION ───────────────────────────────────────────── */}
          {/* ── TAB NAVIGATION ───────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-800/80">
            <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}
              icon={<Activity size={15} />} label="Dashboard" badge={`${courses.length + projects.length}`} />
            <TabButton active={activeTab === 'creator'} onClick={() => setActiveTab('creator')}
              icon={<Sparkles size={15} />} label="+ Creator Studio" badge="Admin CRUD" />
            <TabButton active={activeTab === 'courses'} onClick={() => setActiveTab('courses')}
              icon={<Layers size={15} />} label="Course Hierarchy & Curriculum" badge={`${courses.length} Courses`} />
            <TabButton active={activeTab === 'pricing'} onClick={() => setActiveTab('pricing')}
              icon={<CreditCard size={15} />} label="Paid Content & Pricing" badge={`${pricingSettings.currencySymbol}${pricingSettings.commonFeeAmount}`} />
            <TabButton active={activeTab === 'themes'} onClick={() => setActiveTab('themes')}
              icon={<Palette size={15} />} label="Theme & Appearance" badge="7 Themes" />
            <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}
              icon={<User size={15} />} label="Profile & Preferences" badge="QA RP" />
            <TabButton active={activeTab === 'roles'} onClick={() => setActiveTab('roles')}
              icon={<ShieldCheck size={15} />} label="Roles & Permissions" badge="RBAC" />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════════
            TAB: DASHBOARD
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon={<BookOpen size={18} />} label="Courses" value={courses.length} sub="Published" color="indigo" />
              <StatCard icon={<Briefcase size={18} />} label="QA Projects" value={projects.length} sub="Case studies" color="emerald" />
              <StatCard icon={<Play size={18} />} label="Total Lessons" value={allLessons.length} sub="All sections" color="cyan" />
              <StatCard icon={<CheckCircle size={18} />} label="Free Lessons" value={totalFree} sub="Direct access" color="emerald" />
              <StatCard icon={<CreditCard size={18} />} label="Paid Lessons" value={totalPaid} sub={`${pricingSettings.currencySymbol}${pricingSettings.commonFeeAmount} each`} color="amber" />
              <StatCard icon={<Users size={18} />} label="Users" value={users.length} sub="Registered" color="rose" />
            </div>

            {/* Quick Actions */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Zap size={16} className="text-amber-400" /> Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: '+ New Course', icon: <BookOpen size={16} />, color: 'from-purple-600 to-pink-600', action: () => setCourseModalOpen(true) },
                  { label: '+ New Project', icon: <Briefcase size={16} />, color: 'from-emerald-600 to-teal-600', action: () => setProjectModalOpen(true) },
                  { label: '+ New Category', icon: <Tag size={16} />, color: 'from-orange-600 to-amber-600', action: () => setCatModalOpen(true) },
                  { label: '+ New Video', icon: <Video size={16} />, color: 'from-rose-600 to-red-600', action: () => setVideoModalOpen(true) },
                  { label: 'Course Hierarchy', icon: <Layers size={16} />, color: 'from-cyan-600 to-blue-600', action: () => setActiveTab('courses') },
                  { label: 'Pricing Settings', icon: <CreditCard size={16} />, color: 'from-yellow-600 to-orange-600', action: () => setActiveTab('pricing') },
                  { label: 'Change Theme', icon: <Palette size={16} />, color: 'from-fuchsia-600 to-violet-600', action: () => setActiveTab('themes') },
                  { label: 'Profile Settings', icon: <User size={16} />, color: 'from-indigo-600 to-purple-600', action: () => setActiveTab('profile') },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action}
                    className={`p-4 rounded-2xl bg-gradient-to-br ${btn.color} text-white font-bold text-xs flex items-center gap-2 hover:opacity-90 transition shadow-md cursor-pointer`}
                  >
                    {btn.icon} {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Courses & Projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2"><BookOpen size={15} className="text-indigo-400" /> Courses</h3>
                  <button onClick={() => { setCourseForm({ title: '', shortDescription: '', category: 'QA Automation', difficulty: 'Beginner', duration: '8 Weeks', instructor: 'QA RP', isFree: true, price: 0, status: 'Active', thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&auto=format&fit=crop&q=80' }); setCourseModalOpen(true); }} className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer">+ Add Course</button>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {courses.slice(0, 5).map(c => (
                    <div key={c._id} className="px-5 py-3.5 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-200 truncate">{c.title}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{c.category}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{c.status || 'Active'}</span>
                          <span>•</span>
                          <span>{c.lessonsCount || allLessons.filter(l => l.courseId === c._id).length || 0} lessons</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleOpenAddLesson(c)}
                          title="Add Lesson to this Course"
                          className="px-2 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        >
                          <Plus size={11} /> Lesson
                        </button>
                        <button
                          onClick={() => handleOpenEditCourse(c)}
                          title="Edit Course Details"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => { setSelectedCourseForHierarchy(c); setActiveTab('courses'); }}
                          title="View Curriculum Hierarchy"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-900/40 text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                        >
                          <Layers size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(c._id, c.title)}
                          title="Delete Course"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && <div className="p-8 text-center text-xs text-slate-500">No courses yet. Click "+ Add Course".</div>}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2"><Briefcase size={15} className="text-emerald-400" /> QA Portfolio Projects</h3>
                  <button onClick={() => setProjectModalOpen(true)} className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer">+ Add Project</button>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {projects.slice(0, 5).map(p => (
                    <div key={p._id} className="px-5 py-3.5 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-200 truncate">{p.title}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-emerald-300">{p.category}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">{p.automationCoverage || 85}% Coverage</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/projects#${p._id}`}
                          title="View on Projects Page"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                        >
                          <Eye size={12} />
                        </Link>
                        <button
                          onClick={() => handleDeleteProject(p._id, p.title)}
                          title="Delete Project"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && <div className="p-8 text-center text-xs text-slate-500">No projects yet. Click "+ Add Project".</div>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB: CREATOR STUDIO
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'creator' && (
          <div className="space-y-8">
            {/* Studio Action Buttons */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Crown size={16} className="text-red-400" /> Create New Data (Admin Full CRUD)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Select a module to create and publish records directly to MongoDB Atlas.</p>
                </div>
                <button onClick={loadAllData} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer">
                  <RefreshCw size={15} />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: '+ Course', icon: '📚', sub: 'With Sections', color: 'from-purple-600 to-pink-700', action: () => { setCourseForm({ title: '', shortDescription: '', category: 'QA Automation', difficulty: 'Beginner', duration: '8 Weeks', instructor: 'QA RP', isFree: true, price: 0, status: 'Active', thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&auto=format&fit=crop&q=80' }); setCourseModalOpen(true); } },
                  { label: '+ Portfolio', icon: '💼', sub: 'QA Case Study', color: 'from-emerald-600 to-teal-700', action: () => setProjectModalOpen(true) },
                  { label: '+ Category', icon: '🏷️', sub: 'Taxonomy Node', color: 'from-orange-600 to-amber-700', action: () => setCatModalOpen(true) },
                  { label: '+ YouTube', icon: '▶️', sub: 'Video Link', color: 'from-rose-600 to-red-700', action: () => setVideoModalOpen(true) },
                  { label: 'Hierarchy', icon: '🌳', sub: 'Manage Lessons', color: 'from-cyan-600 to-blue-700', action: () => setActiveTab('courses') },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.action}
                    className={`p-4 rounded-2xl bg-gradient-to-br ${btn.color} text-white font-bold text-left flex flex-col gap-1 hover:opacity-90 transition shadow-md cursor-pointer`}
                  >
                    <span className="text-xl">{btn.icon}</span>
                    <span className="text-xs font-black">{btn.label}</span>
                    <span className="text-[10px] opacity-70">{btn.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Portfolio Projects & Categories row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Projects */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2"><Briefcase size={15} className="text-emerald-400" /> QA Projects ({projects.length})</h3>
                  <button onClick={() => setProjectModalOpen(true)} className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer">+ Add</button>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                  {projects.map(p => (
                    <div key={p._id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{p.title}</div>
                        <div className="text-[10px] text-slate-500">{p.category}</div>
                      </div>
                      <button onClick={() => handleDeleteProject(p._id, p.title)} className="p-1 text-slate-600 hover:text-rose-400 transition cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {projects.length === 0 && <div className="p-8 text-center text-xs text-slate-500">No projects yet.</div>}
                </div>
              </div>

              {/* Categories */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2"><Tag size={15} className="text-orange-400" /> Categories ({categories.length})</h3>
                  <button onClick={() => setCatModalOpen(true)} className="text-[11px] text-orange-400 hover:text-orange-300 font-bold cursor-pointer">+ Add</button>
                </div>
                <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                  {categories.map(cat => (
                    <div key={cat._id} className="px-5 py-3 flex items-center gap-3">
                      <span className="text-lg">{cat.icon || '📁'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-200">{cat.name}</div>
                        <div className="text-[10px] text-slate-500">/{cat.slug}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cat.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>{cat.status}</span>
                    </div>
                  ))}
                  {categories.length === 0 && <div className="p-8 text-center text-xs text-slate-500">No categories yet.</div>}
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2"><Users size={15} className="text-cyan-400" /> Platform Users ({users.length})</h3>
                <Link href="/users" className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">Manage All <ExternalLink size={10} /></Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3 text-center">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {users.slice(0, 8).map(u => (
                      <tr key={u._id} className="hover:bg-slate-800/40 transition">
                        <td className="px-6 py-3 font-bold text-slate-100">{u.name}</td>
                        <td className="px-4 py-3 text-slate-400">{u.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-slate-800 text-slate-400'}`}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB: COURSE HIERARCHY & CURRICULUM
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'courses' && (
          <div className="space-y-8">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">ADMIN HIERARCHY</span>
                <h2 className="text-xl font-black text-white mt-1">Course & Curriculum Studio</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage Courses → Sections → Lessons with 1-Click FREE or PAID status.</p>
              </div>
              <button onClick={() => setCourseModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Plus size={15} /> + Add New Course
              </button>
            </div>

            {!selectedCourseForHierarchy ? (
              /* Course List Table */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Layers size={16} className="text-indigo-400" /> All Courses ({courses.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">Click "Manage Hierarchy →" to structure sections & content</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Course</th>
                        <th className="px-4 py-4">Category</th>
                        <th className="px-4 py-4 text-center">Lessons</th>
                        <th className="px-4 py-4 text-center">Free</th>
                        <th className="px-4 py-4 text-center">Paid</th>
                        <th className="px-4 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {courses.map(course => {
                        const cls = allLessons.filter(l => l.courseId === course._id);
                        const freeC = cls.filter(l => l.accessType !== 'PAID' && !l.isPaid).length;
                        const paidC = cls.filter(l => l.accessType === 'PAID' || l.isPaid).length;
                        return (
                          <tr key={course._id} className="hover:bg-slate-800/40 transition">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-100 text-sm">{course.title}</div>
                              <div className="text-[10px] text-slate-500">{course.instructor || 'QA RP'} • {course.duration || '8 Weeks'}</div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-indigo-300 text-[10px] font-bold border border-slate-700">{course.category || 'QA Automation'}</span>
                            </td>
                            <td className="px-4 py-4 text-center font-mono font-bold text-slate-200">{cls.length || course.lessonsCount || 0}</td>
                            <td className="px-4 py-4 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">{freeC} Free</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">{paidC} Paid</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${course.status === 'Active' || course.status === 'Published' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                {course.status || 'Published'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center gap-1.5 justify-end">
                                <button onClick={() => setSelectedCourseForHierarchy(course)}
                                  title="Manage Course Sections & Lessons Hierarchy"
                                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
                                >
                                  <Layers size={12} /> Manage →
                                </button>
                                <button
                                  onClick={() => handleOpenAddLesson(course)}
                                  title="Add Lesson (Single / Multi-Lesson Batch)"
                                  className="px-2.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                                >
                                  <Plus size={12} /> Lesson
                                </button>
                                <button
                                  onClick={() => handleOpenEditCourse(course)}
                                  title="Edit Course Details"
                                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 cursor-pointer"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button onClick={() => handleDeleteCourse(course._id, course.title)}
                                  title="Delete Course"
                                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition border border-slate-700 cursor-pointer"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {courses.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-xs text-slate-500">No courses yet. Click "+ Add New Course" to get started.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Section & Lesson Hierarchy View */
              <div className="space-y-6">
                {/* Header */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-indigo-500/40 flex items-center justify-between shadow-xl">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedCourseForHierarchy(null)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer">
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">Hierarchical Curriculum</span>
                      <h3 className="text-lg font-black text-white">{selectedCourseForHierarchy.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setNewSectionModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer">
                      <FolderPlus size={13} className="text-amber-400" /> + Section
                    </button>
                    <button onClick={() => { setTargetSectionForLesson(''); setHierarchyLessonModalOpen(true); }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer">
                      <Plus size={13} /> + Lesson
                    </button>
                  </div>
                </div>

                {/* Sections Tree */}
                {(() => {
                  const cls = allLessons.filter(l => l.courseId === selectedCourseForHierarchy._id);
                  const grouped = cls.reduce((acc, l) => {
                    const sec = l.sectionTitle || 'Section 1: Introduction';
                    if (!acc[sec]) acc[sec] = [];
                    acc[sec].push(l);
                    return acc;
                  }, {});
                  if (Object.keys(grouped).length === 0) {
                    grouped['Section 1: Introduction'] = [];
                    grouped['Section 2: Automation & Advanced Testing'] = [];
                  }
                  return (
                    <div className="space-y-4">
                      {Object.entries(grouped).map(([sec, secLessons], sIdx) => (
                        <div key={sec} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                          <div className="p-4 sm:p-5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs">{sIdx + 1}</div>
                              <div>
                                <h4 className="text-sm font-black text-white flex items-center gap-2"><Layers size={13} className="text-indigo-400" /> {sec}</h4>
                                <span className="text-[11px] text-slate-400">
                                  {secLessons.length} Lessons • {secLessons.filter(l => l.accessType !== 'PAID' && !l.isPaid).length} Free • {secLessons.filter(l => l.accessType === 'PAID' || l.isPaid).length} Paid
                                </span>
                              </div>
                            </div>
                            <button onClick={() => { setTargetSectionForLesson(sec); setHierarchyLessonForm(p => ({ ...p, sectionTitle: sec })); setHierarchyLessonModalOpen(true); }}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1 border border-slate-700 cursor-pointer text-slate-200">
                              <Plus size={12} className="text-emerald-400" /> Add Content
                            </button>
                          </div>
                          <div className="p-4 sm:p-5 space-y-2.5">
                            {secLessons.length === 0 ? (
                              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                                No lessons yet. Click "Add Content" to create the first item.
                              </div>
                            ) : secLessons.map((lesson, lIdx) => {
                              const isPaid = lesson.accessType === 'PAID' || lesson.isPaid;
                              return (
                                <div key={lesson._id || lIdx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-[11px] shrink-0">{lIdx + 1}</div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-2">
                                        {lesson.title}
                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-slate-800 text-slate-400 uppercase shrink-0">{lesson.contentType || 'VIDEO'}</span>
                                      </div>
                                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><Clock size={9} /> {lesson.duration || '15 mins'}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      onClick={() => handleOpenEditLesson(lesson)}
                                      title="Edit Lesson Notes, Code & Architecture Studio"
                                      className="px-2.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                                    >
                                      <Edit2 size={11} /> Edit Notes &amp; Data
                                    </button>
                                    <button onClick={() => handleToggleLessonAccessType(lesson)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${isPaid ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'}`}>
                                      {isPaid ? <Lock size={11} className="text-amber-400" /> : <CheckCircle size={11} className="text-emerald-400" />}
                                      {isPaid ? `PAID (${pricingSettings.currencySymbol}${pricingSettings.commonFeeAmount})` : 'FREE'}
                                    </button>
                                    <button onClick={() => handleDeleteLesson(lesson._id, lesson.title)}
                                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition border border-slate-700 cursor-pointer">
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB: PAID CONTENT & PRICING SETTINGS
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'pricing' && (
          <div className="space-y-8">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">GLOBAL PRICING ENGINE</span>
                <h2 className="text-xl font-black text-white mt-1">Paid Content & Common Fee Settings</h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                  The common fee ({pricingSettings.currencySymbol}{pricingSettings.commonFeeAmount}) is controlled centrally — admins only select FREE or PAID per lesson, not individual amounts.
                </p>
              </div>
              <button onClick={handleSavePricingSettings} disabled={switching}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 cursor-pointer transition">
                <Save size={15} /> {switching ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            {/* Settings grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Enabled */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">Payment Enabled</h3>
                    <p className="text-xs text-slate-400">Activate or bypass the platform payment gateway</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={pricingSettings.paymentEnabled}
                      onChange={e => setPricingSettings({ ...pricingSettings, paymentEnabled: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 border border-slate-700" />
                  </label>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <strong className={pricingSettings.paymentEnabled ? 'text-emerald-400' : 'text-red-400'}>
                    {pricingSettings.paymentEnabled ? '✅ Payment Active — Paid content requires checkout' : '❌ Free Mode — All content is free'}
                  </strong>
                </div>
              </div>

              {/* Common Fee Amount */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div>
                  <h3 className="text-sm font-bold text-white">Common Fee Amount</h3>
                  <p className="text-xs text-slate-400">Standard fee applied to all PAID lessons & modules automatically</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-indigo-400">{pricingSettings.currencySymbol}</span>
                  <input type="number" min="0" value={pricingSettings.commonFeeAmount}
                    onChange={e => setPricingSettings({ ...pricingSettings, commonFeeAmount: Number(e.target.value) })}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-lg"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Default: ₹499 INR. Admin selects PAID → this fee auto-applies.</p>
              </div>

              {/* Currency */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div>
                  <h3 className="text-sm font-bold text-white">Currency</h3>
                  <p className="text-xs text-slate-400">Select currency for payment modal and receipts</p>
                </div>
                <select value={pricingSettings.currency}
                  onChange={e => {
                    const curr = e.target.value;
                    const sym = curr === 'INR' ? '₹' : curr === 'USD' ? '$' : curr === 'EUR' ? '€' : '£';
                    setPricingSettings({ ...pricingSettings, currency: curr, currencySymbol: sym });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                </select>
              </div>

              {/* Payment Type */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div>
                  <h3 className="text-sm font-bold text-white">Payment Type</h3>
                  <p className="text-xs text-slate-400">Access grant model for unlocked paid materials</p>
                </div>
                <input type="text" value={pricingSettings.paymentType}
                  onChange={e => setPricingSettings({ ...pricingSettings, paymentType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold"
                />
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white">Confirmation Popup</h4>
                    <p className="text-[10px] text-slate-400">Show payment success confirmation</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={pricingSettings.confirmationPopup}
                      onChange={e => setPricingSettings({ ...pricingSettings, confirmationPopup: e.target.checked })} className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 border border-slate-700" />
                  </label>
                </div>
              </div>
            </div>

            {/* Learner Flow Diagram */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <h3 className="text-sm font-black text-white flex items-center gap-2"><Info size={16} className="text-indigo-400" /> Learner Payment Flow</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { step: '1', label: 'Select Content', icon: '📚', color: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' },
                  { step: '2', label: 'Is it PAID?', icon: '🔒', color: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
                  { step: '3', label: `Fee Popup (${pricingSettings.currencySymbol}${pricingSettings.commonFeeAmount})`, icon: '💳', color: 'bg-purple-500/20 border-purple-500/40 text-purple-300' },
                  { step: '4', label: 'Unlock Content', icon: '✅', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
                ].map((s, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${s.color} text-center space-y-2`}>
                    <span className="text-2xl">{s.icon}</span>
                    <div className="text-[10px] font-black uppercase opacity-60">Step {s.step}</div>
                    <div className="text-xs font-bold">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB: THEME & APPEARANCE STUDIO
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'themes' && (
          <div className="space-y-8">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">THEME & APPEARANCE STUDIO</span>
              <h2 className="text-xl font-black text-white mt-1">Live Animated Theme Engine</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Active: <strong className="text-indigo-400">{currentTheme?.name}</strong> — changes apply across all platform pages instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {themes.map(t => {
                const isSelected = theme === t.id;
                return (
                  <div key={t.id} onClick={() => setTheme(t.id)}
                    className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer flex flex-col gap-4 ${isSelected ? 'bg-slate-900 border-indigo-500 shadow-2xl ring-2 ring-indigo-500/40 scale-[1.02]' : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{t.icon}</span>
                        <div>
                          <h3 className="text-sm font-black text-white">{t.name}</h3>
                          <span className="text-[10px] text-slate-400">{t.category}</span>
                        </div>
                      </div>
                      {isSelected && <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white">✓ Active</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{t.tagline}</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['bgMain', 'bgCard', 'primary', 'secondary'].map(k => (
                        <div key={k} className="space-y-1">
                          <div className="h-6 rounded-lg border border-white/10" style={{ backgroundColor: t.colors[k] }} />
                          <div className="text-[8px] font-mono text-slate-600 text-center">{k === 'bgMain' ? 'Bg' : k === 'bgCard' ? 'Card' : k === 'primary' ? 'Pri' : 'Sec'}</div>
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={e => { e.stopPropagation(); setTheme(t.id); }}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
                      {isSelected ? '✓ Currently Selected' : `Activate → ${t.name}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB: PROFILE & PREFERENCES
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Avatar Panel */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2"><User size={15} className="text-indigo-400" /> Avatar</h3>
                <div className="flex flex-col items-center gap-4">
                  <img src={profile.avatar} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-4 border-indigo-500/50 shadow-xl" />
                  <FileUploadZone
                    accept="image/*"
                    label="Upload Custom Avatar"
                    hint="PNG, JPG, WebP"
                    value={profile.avatar}
                    fileType="image"
                    onUploadSuccess={(data) => setProfile({ ...profile, avatar: data.url })}
                    onRemove={() => setProfile({ ...profile, avatar: PRESET_AVATARS[0] })}
                  />
                  <div className="text-[10px] font-bold text-slate-400">Or choose a preset avatar:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AVATARS.map((av, i) => (
                      <img key={i} src={av} alt="" onClick={() => setProfile({ ...profile, avatar: av })}
                        className={`w-12 h-12 rounded-xl cursor-pointer object-cover border-2 transition hover:scale-105 ${profile.avatar === av ? 'border-indigo-500' : 'border-slate-700'}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="md:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2"><Edit2 size={15} className="text-purple-400" /> Profile Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'name', icon: <User size={13} /> },
                    { label: 'Email', key: 'email', icon: <Mail size={13} /> },
                    { label: 'Designation', key: 'designation', icon: <Award size={13} /> },
                    { label: 'Phone', key: 'phone', icon: <Smartphone size={13} /> },
                    { label: 'Location', key: 'location', icon: <MapPin size={13} /> },
                    { label: 'Website', key: 'website', icon: <Globe size={13} /> },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">{f.icon} {f.label}</label>
                      <input type="text" value={profile[f.key] || ''} onChange={e => setProfile({ ...profile, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Bio</label>
                  <textarea rows={3} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none" />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2"><Bell size={15} className="text-amber-400" /> Notification Preferences</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'System alerts and updates' },
                  { key: 'courseUpdates', label: 'Course Updates', desc: 'New lessons and content' },
                  { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Promotions and announcements' },
                ].map(pref => (
                  <label key={pref.key} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition">
                    <div>
                      <div className="text-xs font-bold text-white">{pref.label}</div>
                      <div className="text-[10px] text-slate-400">{pref.desc}</div>
                    </div>
                    <input type="checkbox" checked={profile.preferences[pref.key]}
                      onChange={e => setProfile({ ...profile, preferences: { ...profile.preferences, [pref.key]: e.target.checked } })}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-800 border-slate-600" />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB: ROLES & PERMISSIONS MATRIX
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'roles' && (
          <div className="space-y-8">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">RBAC GUIDE</span>
              <h2 className="text-xl font-black text-white mt-1">Roles & Permissions Matrix</h2>
              <p className="text-xs text-slate-400 mt-0.5">Complete role-based access control reference for the QARP e-learning platform.</p>
            </div>

            <div className="space-y-6">
              {PERMISSIONS_DATA.map((section, sIdx) => (
                <div key={sIdx} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                  <div className="p-5 border-b border-slate-800 bg-slate-950/60">
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <ShieldCheck size={15} className="text-purple-400" /> {section.module}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="px-6 py-3 text-left">Permission</th>
                          <th className="px-4 py-3 text-center text-red-400">Admin</th>
                          <th className="px-4 py-3 text-center text-emerald-400">User/Learner</th>
                          <th className="px-4 py-3 text-center text-indigo-400">Instructor</th>
                          <th className="px-6 py-3 text-left text-slate-500">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {section.permissions.map((perm, pIdx) => (
                          <tr key={pIdx} className="hover:bg-slate-800/30 transition">
                            <td className="px-6 py-3 font-semibold text-slate-200">{perm.action}</td>
                            <td className="px-4 py-3 text-center">
                              {perm.admin ? <CheckCheck size={15} className="text-emerald-400 mx-auto" /> : <X size={14} className="text-slate-700 mx-auto" />}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {perm.user ? <CheckCheck size={15} className="text-emerald-400 mx-auto" /> : <X size={14} className="text-slate-700 mx-auto" />}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {perm.instructor ? <CheckCheck size={15} className="text-emerald-400 mx-auto" /> : <X size={14} className="text-slate-700 mx-auto" />}
                            </td>
                            <td className="px-6 py-3 text-slate-400">{perm.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>

            {/* Role Legend Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { role: 'ADMIN', icon: <Crown size={20} />, color: 'border-red-500/40 bg-red-500/10', badge: 'bg-red-500/20 text-red-300 border-red-500/30', description: 'Full CRUD access to all platform resources. Can create, edit, delete, and publish any content. Access to Settings Studio and RBAC controls.' },
                { role: 'INSTRUCTOR', icon: <Star size={20} />, color: 'border-indigo-500/40 bg-indigo-500/10', badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', description: 'Can create courses, manage their own content, and publish case studies. Cannot modify platform settings or other users\' data.' },
                { role: 'LEARNER', icon: <GraduationCap size={20} />, color: 'border-emerald-500/40 bg-emerald-500/10', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', description: 'Read-only access to published content. Can enroll in courses, unlock paid lessons via payment, and track their own progress.' },
              ].map(r => (
                <div key={r.role} className={`p-6 rounded-3xl border ${r.color} space-y-3`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.color} text-white`}>{r.icon}</div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${r.badge}`}>{r.role}</span>
                  <p className="text-[12px] text-slate-400 leading-relaxed">{r.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: SECTION CREATOR
      ════════════════════════════════════════════════════════════════════ */}
      {newSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2"><FolderPlus size={17} className="text-amber-400" /> + Add Curriculum Section</h3>
              <button onClick={() => setNewSectionModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Section Title *</label>
              <input type="text" value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)}
                placeholder="e.g. Section 2: Manual Testing Fundamentals"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" />
            </div>
            <button onClick={() => {
              if (!newSectionTitle.trim()) return;
              setHierarchyLessonForm(p => ({ ...p, sectionTitle: newSectionTitle }));
              setTargetSectionForLesson(newSectionTitle);
              setNewSectionModalOpen(false); setHierarchyLessonModalOpen(true); setNewSectionTitle('');
            }} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-slate-950 font-black text-xs shadow-lg cursor-pointer">
              Create Section & Add First Lesson →
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: LESSON IN HIERARCHY (FREE / PAID)
      ════════════════════════════════════════════════════════════════════ */}
      {hierarchyLessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateLessonInHierarchy} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="text-[10px] font-bold text-indigo-400 uppercase">Course: {selectedCourseForHierarchy?.title}</div>
                <h3 className="text-base font-black text-white">+ Add Content to Hierarchy</h3>
              </div>
              <button type="button" onClick={() => setHierarchyLessonModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Target Section *</label>
              <input type="text" required value={hierarchyLessonForm.sectionTitle}
                onChange={e => setHierarchyLessonForm({ ...hierarchyLessonForm, sectionTitle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Lesson / Content Title *</label>
              <input type="text" required value={hierarchyLessonForm.title}
                onChange={e => setHierarchyLessonForm({ ...hierarchyLessonForm, title: e.target.value })}
                placeholder="e.g. 01 Framework Architecture Deep Dive"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Content Type</label>
                <select value={hierarchyLessonForm.contentType} onChange={e => setHierarchyLessonForm({ ...hierarchyLessonForm, contentType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white">
                  <option value="video">🎥 Video Lesson</option>
                  <option value="pdf">📄 PDF Document</option>
                  <option value="notes">📝 Interactive Notes</option>
                  <option value="image">🖼️ Architecture Diagram</option>
                  <option value="quiz">❓ Quiz / Assessment</option>
                  <option value="assignment">💻 Capstone Assignment</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Access Tier *</label>
                <select value={hierarchyLessonForm.accessType} onChange={e => setHierarchyLessonForm({ ...hierarchyLessonForm, accessType: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold">
                  <option value="FREE">🟢 FREE — Direct Access</option>
                  <option value="PAID">🔒 PAID — {pricingSettings.currencySymbol}{pricingSettings.commonFeeAmount} Common Fee</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Video / Resource URL</label>
                <input type="url" value={hierarchyLessonForm.videoUrl}
                  onChange={e => setHierarchyLessonForm({ ...hierarchyLessonForm, videoUrl: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Duration</label>
                <input type="text" value={hierarchyLessonForm.duration}
                  onChange={e => setHierarchyLessonForm({ ...hierarchyLessonForm, duration: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-bold text-xs shadow-lg cursor-pointer">
              Save Content to Section →
            </button>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: COURSE CREATOR & EDITOR
      ════════════════════════════════════════════════════════════════════ */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateCourse} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <BookOpen size={17} className="text-purple-400" />
                {courseForm._id ? `✏️ Edit Course: ${courseForm.title}` : '+ Add New Course'}
              </h3>
              <button type="button" onClick={() => setCourseModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Course Title *</label>
              <input type="text" required value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="e.g. Selenium WebDriver Automation Masterclass"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category *</label>
                <input type="text" value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Duration</label>
                <input type="text" value={courseForm.duration} onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Difficulty</label>
                <select value={courseForm.difficulty} onChange={e => setCourseForm({ ...courseForm, difficulty: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none">
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Status</label>
                <select value={courseForm.status || 'Active'} onChange={e => setCourseForm({ ...courseForm, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none">
                  <option>Active</option><option>Draft</option><option>Archived</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Instructor</label>
              <input type="text" value={courseForm.instructor} onChange={e => setCourseForm({ ...courseForm, instructor: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Course Thumbnail Image (Upload or URL)</label>
              <FileUploadZone
                accept="image/*"
                label="Upload Course Cover Image"
                hint="Supports PNG, JPG, WebP, SVG (Max 50MB)"
                value={courseForm.thumbnail}
                fileType="image"
                onUploadSuccess={(data) => setCourseForm({ ...courseForm, thumbnail: data.url })}
                onRemove={() => setCourseForm({ ...courseForm, thumbnail: '' })}
              />
              <input
                type="url"
                value={courseForm.thumbnail}
                onChange={e => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                placeholder="Or paste external image URL (e.g. https://images.unsplash.com/...)"
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Short Description</label>
              <textarea rows={2} value={courseForm.shortDescription} onChange={e => setCourseForm({ ...courseForm, shortDescription: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none focus:outline-none" />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg cursor-pointer">
              {courseForm._id ? '✓ Save Changes to Course' : 'Save Course & Add Lessons →'}
            </button>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: LESSON CREATOR (Single & Multi-Lesson Batch)
      ════════════════════════════════════════════════════════════════════ */}
      {lessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
              <div>
                <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Course: {selectedCourseForLesson?.title}</div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Play size={16} className="text-purple-400" />
                  📚 Multi-Lesson Studio (Batch Mode — {multiLessonsList.length} rows)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLessonModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Multi-Lesson Batch Creator Only */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Top Bar: Section Title Control & Auto-Fill Template */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Layers size={13} className="text-purple-400" />
                      Section Title * (Applies to all lesson rows)
                    </label>
                    <input
                      type="text"
                      required
                      value={batchSectionTitle}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBatchSectionTitle(val);
                        const updated = multiLessonsList.map(l => ({ ...l, sectionTitle: val }));
                        setMultiLessonsList(updated);
                      }}
                      placeholder="Section 1: Introduction"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                    />
                  </div>
                  <div className="flex flex-col justify-end pt-1 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        setMultiLessonsList([
                          {
                            ...createEmptyLessonRow(batchSectionTitle),
                            title: '01 Introduction & Test Automation Architecture',
                            duration: '15 minutes',
                            accessType: 'FREE',
                            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                            notes: 'Deep-dive into architectural principles, locator hierarchies, and resilient test patterns.',
                            codeSnippet: "import { test, expect } from '@playwright/test';\n\ntest('Smoke Suite', async ({ page }) => {\n  await page.goto('https://example.com');\n  await expect(page).toHaveTitle(/Example/);\n});",
                            terminalCommand: 'npx playwright test --headed',
                            objectives: 'Master framework architecture\nImplement resilient locators\nRun test suite via CLI',
                            quizQ1: 'What is the most resilient locator in modern test frameworks?',
                            quizOpt1: 'getByRole & Accessible Name, Full XPath, Dynamic Index',
                            quizCorrect1: 0,
                            attachmentName: 'playwright.config.ts',
                            attachmentUrl: '/uploads/1788343066240_sample-test-automation.pdf',
                            attachmentSize: '2.4 KB',
                          },
                          {
                            ...createEmptyLessonRow(batchSectionTitle),
                            title: '02 Page Object Model & Resilient Assertion Strategies',
                            duration: '20 minutes',
                            accessType: 'PAID',
                            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                            notes: 'Building robust Page Objects with isolated locators and auto-waiting assertions.',
                            codeSnippet: "import { Page, Locator, expect } from '@playwright/test';\n\nexport class LoginPage {\n  readonly page: Page;\n  readonly submitBtn: Locator;\n  constructor(page: Page) {\n    this.page = page;\n    this.submitBtn = page.getByRole('button', { name: 'Log In' });\n  }\n}",
                            terminalCommand: 'npx playwright test tests/login.spec.ts',
                            objectives: 'Design clean POM classes\nEliminate flaky hard sleeps\nConfigure parallel worker threads',
                            quizQ1: 'Why should Page Object Models encapsulate locators?',
                            quizOpt1: 'Improves maintainability, Makes tests run slower, Hardcodes DOM paths',
                            quizCorrect1: 0,
                            attachmentName: 'pom-starter-template.zip',
                            attachmentUrl: '/uploads/1788343066240_sample-test-automation.pdf',
                            attachmentSize: '4.8 MB',
                          },
                        ]);
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Sparkles size={13} /> + Auto-Fill 2 Sample Lesson Rows
                    </button>
                  </div>
                </div>
              </div>

              {/* Lesson Rows List */}
              <div className="space-y-4">
                {multiLessonsList.map((row, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5 relative group shadow-md hover:border-purple-500/30 transition">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="text-xs font-black text-purple-400 flex items-center gap-1.5">
                        <Video size={13} className="text-purple-400" />
                        Lesson #{idx + 1}
                      </span>
                      {multiLessonsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setMultiLessonsList(multiLessonsList.filter((_, i) => i !== idx))}
                          className="text-slate-500 hover:text-rose-400 text-xs font-bold transition cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-rose-500/10"
                        >
                          <Trash2 size={12} /> Remove Row
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Lesson Title *</label>
                        <input
                          type="text"
                          required
                          value={row.title}
                          onChange={e => {
                            const copy = [...multiLessonsList];
                            copy[idx].title = e.target.value;
                            setMultiLessonsList(copy);
                          }}
                          placeholder={`e.g. 0${idx + 1} Introduction to Test Automation`}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Access Tier</label>
                        <select
                          value={row.accessType}
                          onChange={e => {
                            const copy = [...multiLessonsList];
                            copy[idx].accessType = e.target.value;
                            setMultiLessonsList(copy);
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold focus:outline-none"
                        >
                          <option value="FREE">🟢 FREE — Direct Access</option>
                          <option value="PAID">🔒 PAID ({pricingSettings.currencySymbol}{pricingSettings.commonFeeAmount})</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Section</label>
                        <input
                          type="text"
                          value={row.sectionTitle}
                          onChange={e => {
                            const copy = [...multiLessonsList];
                            copy[idx].sectionTitle = e.target.value;
                            setMultiLessonsList(copy);
                          }}
                          placeholder="Section 1: Introduction"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Duration</label>
                        <input
                          type="text"
                          value={row.duration}
                          onChange={e => {
                            const copy = [...multiLessonsList];
                            copy[idx].duration = e.target.value;
                            setMultiLessonsList(copy);
                          }}
                          placeholder="15 minutes"
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Video URL (Embed / MP4)</label>
                        <input
                          type="url"
                          value={row.videoUrl}
                          onChange={e => {
                            const copy = [...multiLessonsList];
                            copy[idx].videoUrl = e.target.value;
                            setMultiLessonsList(copy);
                          }}
                          placeholder="https://www.youtube.com/embed/..."
                          className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* ── 5 DYNAMIC POINTS SUB-TABS (Per Row in Batch Creator) ── */}
                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
                      <div className="flex flex-wrap gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                        {[
                          { id: 'notes', label: '1. Notes & Breakdown', icon: <FileText size={10} /> },
                          { id: 'code', label: '2. Code & CLI', icon: <Code2 size={10} /> },
                          { id: 'objectives', label: '3. Objectives', icon: <CheckCircle size={10} /> },
                          { id: 'quiz', label: '4. Knowledge Check', icon: <Sparkles size={10} /> },
                          { id: 'files', label: '5. Files & Upload', icon: <Download size={10} /> },
                        ].map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              const copy = [...multiLessonsList];
                              copy[idx].activeSubTab = t.id;
                              setMultiLessonsList(copy);
                            }}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                              (row.activeSubTab || 'notes') === t.id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {t.icon} <span>{t.label}</span>
                          </button>
                        ))}
                      </div>

                      {(row.activeSubTab || 'notes') === 'notes' && (
                        <div className="space-y-1">
                          <textarea
                            rows={2}
                            value={row.notes || ''}
                            onChange={e => {
                              const copy = [...multiLessonsList];
                              copy[idx].notes = e.target.value;
                              setMultiLessonsList(copy);
                            }}
                            placeholder={`Lesson Notes, architectural principles, and concepts for Lesson #${idx + 1}...`}
                            className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 resize-none focus:outline-none"
                          />
                        </div>
                      )}

                      {(row.activeSubTab || 'notes') === 'code' && (
                        <div className="space-y-1.5">
                          <textarea
                            rows={2}
                            value={row.codeSnippet || ''}
                            onChange={e => {
                              const copy = [...multiLessonsList];
                              copy[idx].codeSnippet = e.target.value;
                              setMultiLessonsList(copy);
                            }}
                            placeholder="import { test, expect } from '@playwright/test';\n\ntest('Sample Spec', async ({ page }) => { ... });"
                            className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 resize-none focus:outline-none"
                          />
                          <input
                            type="text"
                            value={row.terminalCommand || ''}
                            onChange={e => {
                              const copy = [...multiLessonsList];
                              copy[idx].terminalCommand = e.target.value;
                              setMultiLessonsList(copy);
                            }}
                            placeholder="Terminal CLI: npx playwright test --headed"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none"
                          />
                        </div>
                      )}

                      {(row.activeSubTab || 'notes') === 'objectives' && (
                        <textarea
                          rows={2}
                          value={row.objectives || ''}
                          onChange={e => {
                            const copy = [...multiLessonsList];
                            copy[idx].objectives = e.target.value;
                            setMultiLessonsList(copy);
                          }}
                          placeholder="Learning Objectives (one per line):&#10;Master test architecture&#10;Implement resilient locators"
                          className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 resize-none focus:outline-none"
                        />
                      )}

                      {(row.activeSubTab || 'notes') === 'quiz' && (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={row.quizQ1 || ''}
                            onChange={e => {
                              const copy = [...multiLessonsList];
                              copy[idx].quizQ1 = e.target.value;
                              setMultiLessonsList(copy);
                            }}
                            placeholder="Quiz Question (e.g. What is the most resilient locator?)"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                          />
                          <input
                            type="text"
                            value={row.quizOpt1 || ''}
                            onChange={e => {
                              const copy = [...multiLessonsList];
                              copy[idx].quizOpt1 = e.target.value;
                              setMultiLessonsList(copy);
                            }}
                            placeholder="Options comma-separated: getByRole & Accessible Name, Full XPath, Dynamic Index"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
                          />
                        </div>
                      )}

                      {(row.activeSubTab || 'notes') === 'files' && (
                        <div className="space-y-2">
                          <FileUploadZone
                            accept="image/*,.pdf,.zip,.ts,.doc,.docx"
                            label={`Upload PDF or Starter File for Lesson #${idx + 1}`}
                            hint="Supports PDF, PNG, JPG, ZIP, TS files (Max 50MB)"
                            value={row.attachmentUrl}
                            onUploadSuccess={(data) => {
                              const copy = [...multiLessonsList];
                              copy[idx].attachmentName = data.name;
                              copy[idx].attachmentUrl = data.url;
                              copy[idx].attachmentSize = data.size;
                              setMultiLessonsList(copy);
                            }}
                            onRemove={() => {
                              const copy = [...multiLessonsList];
                              copy[idx].attachmentName = '';
                              copy[idx].attachmentUrl = '';
                              copy[idx].attachmentSize = '1.4 MB';
                              setMultiLessonsList(copy);
                            }}
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={row.attachmentName || ''}
                              onChange={e => {
                                const copy = [...multiLessonsList];
                                copy[idx].attachmentName = e.target.value;
                                setMultiLessonsList(copy);
                              }}
                              placeholder="File name: starter.zip or notes.pdf"
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                            />
                            <input
                              type="text"
                              value={row.attachmentUrl || ''}
                              onChange={e => {
                                const copy = [...multiLessonsList];
                                copy[idx].attachmentUrl = e.target.value;
                                setMultiLessonsList(copy);
                              }}
                              placeholder="Download URL: /uploads/... or https://..."
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMultiLessonsList([
                    ...multiLessonsList,
                    createEmptyLessonRow(batchSectionTitle || 'Section 1: Introduction')
                  ])}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Plus size={13} /> + Add Another Lesson Row
                </button>
                <button
                  type="button"
                  onClick={handleSaveMultipleLessons}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 text-white font-extrabold text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  🚀 Save All {multiLessonsList.filter(l => l.title?.trim()).length} Lessons with 5-Point Data to Course →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: EDIT LESSON NOTES, CODE & 5-POINT DATA STUDIO
      ════════════════════════════════════════════════════════════════════ */}
      {editingLessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <form onSubmit={handleSaveEditedLesson} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase">Curriculum Studio • ID: {editingLessonForm._id?.slice(-6)}</span>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Edit2 size={16} className="text-indigo-400" />
                  Edit Lesson 5-Point Learning Studio
                </h3>
              </div>
              <button type="button" onClick={() => setEditingLessonModalOpen(false)} className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer text-lg">
                ✕
              </button>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    value={editingLessonForm.title}
                    onChange={e => setEditingLessonForm({ ...editingLessonForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Section Title *</label>
                  <input
                    type="text"
                    required
                    value={editingLessonForm.sectionTitle}
                    onChange={e => setEditingLessonForm({ ...editingLessonForm, sectionTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Access Tier *</label>
                  <select
                    value={editingLessonForm.accessType}
                    onChange={e => setEditingLessonForm({ ...editingLessonForm, accessType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-none"
                  >
                    <option value="FREE">🟢 FREE — Direct Access</option>
                    <option value="PAID">🔒 PAID — {pricingSettings.currencySymbol}{pricingSettings.commonFeeAmount} Fee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Duration</label>
                  <input
                    type="text"
                    value={editingLessonForm.duration}
                    onChange={e => setEditingLessonForm({ ...editingLessonForm, duration: e.target.value })}
                    placeholder="15 minutes"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Video URL (Embed / MP4)</label>
                  <input
                    type="url"
                    value={editingLessonForm.videoUrl}
                    onChange={e => setEditingLessonForm({ ...editingLessonForm, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* ── 5 DYNAMIC POINTS SUB-TABS (Edit Modal) ── */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                  {[
                    { id: 'notes', label: '1. Notes & Breakdown', icon: <FileText size={13} /> },
                    { id: 'code', label: '2. Code & Terminal', icon: <Code2 size={13} /> },
                    { id: 'objectives', label: '3. Objectives', icon: <CheckCircle size={13} /> },
                    { id: 'quiz', label: '4. Knowledge Check', icon: <Sparkles size={13} /> },
                    { id: 'files', label: '5. Files', icon: <Download size={13} /> },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEditingLessonForm({ ...editingLessonForm, activeSubTab: t.id })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        (editingLessonForm.activeSubTab || 'notes') === t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.icon} <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                {/* 1. NOTES & BREAKDOWN */}
                {(editingLessonForm.activeSubTab || 'notes') === 'notes' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <FileText size={14} className="text-indigo-400" />
                        📑 Lesson Notes &amp; Architecture Breakdown (Shows in Learner Studio)
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditingLessonForm({
                          ...editingLessonForm,
                          notes: `In this comprehensive hands-on masterclass for "${editingLessonForm.title || 'this lesson'}", we explore the architectural design patterns of modern automation suites.\n\n### Core Architecture Principles:\n1. Resilient Locator Strategies using getByRole and data-testid attributes.\n2. Dynamic state assertion polling without Thread.sleep().\n3. Parallelized pipeline execution in GitHub Actions CI/CD.`
                        })}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20"
                      >
                        + Insert QA Blueprint Template
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={editingLessonForm.notes}
                      onChange={e => setEditingLessonForm({ ...editingLessonForm, notes: e.target.value })}
                      placeholder="Explain architectural patterns, locator strategies, and core concepts for this lesson..."
                      className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed resize-none focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* 2. CODE & TERMINAL */}
                {(editingLessonForm.activeSubTab || 'notes') === 'code' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Code2 size={14} className="text-emerald-400" />
                          💻 Executable Automation Code Blueprint (Shows in Code Tab)
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditingLessonForm({
                            ...editingLessonForm,
                            codeSnippet: `import { test, expect } from '@playwright/test';\n\ntest('${editingLessonForm.title || 'Smoke Scenario'}', async ({ page }) => {\n  // 1. Navigate to target application\n  await page.goto('https://example.com');\n\n  // 2. Perform actions with auto-waiting\n  await page.locator('input[type="text"]').fill('QA RP Engineer');\n  await page.locator('button[type="submit"]').click();\n\n  // 3. Verify state and assertions\n  await expect(page.locator('.welcome-banner')).toBeVisible();\n  await expect(page).toHaveURL(/.*dashboard/);\n});`
                          })}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20"
                        >
                          + Insert Playwright Spec
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        value={editingLessonForm.codeSnippet}
                        onChange={e => setEditingLessonForm({ ...editingLessonForm, codeSnippet: e.target.value })}
                        placeholder="// Paste executable test automation code snippet here..."
                        className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 leading-relaxed resize-none focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1">Terminal CLI Execution Command</label>
                      <input
                        type="text"
                        value={editingLessonForm.terminalCommand}
                        onChange={e => setEditingLessonForm({ ...editingLessonForm, terminalCommand: e.target.value })}
                        placeholder="npx playwright test --grep='smoke' --headed"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 3. OBJECTIVES */}
                {(editingLessonForm.activeSubTab || 'notes') === 'objectives' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-purple-400" />
                      🎯 Key Learning Objectives (One per line — Shows in Checklist Tab)
                    </label>
                    <textarea
                      rows={3}
                      value={editingLessonForm.objectives}
                      onChange={e => setEditingLessonForm({ ...editingLessonForm, objectives: e.target.value })}
                      placeholder="Master architectural principles for this lesson&#10;Implement resilient locators without hardcoded sleeps&#10;Execute automated tests in CI/CD pipeline"
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed resize-none focus:outline-none"
                    />
                  </div>
                )}

                {/* 4. KNOWLEDGE CHECK (QUIZ) */}
                {(editingLessonForm.activeSubTab || 'notes') === 'quiz' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300">⚡ Custom Knowledge Check Questions</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Question 1</label>
                        <input
                          type="text"
                          value={editingLessonForm.quizQ1}
                          onChange={e => setEditingLessonForm({ ...editingLessonForm, quizQ1: e.target.value })}
                          placeholder="What is the primary architectural goal of this lesson?"
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Options (comma separated)</label>
                        <input
                          type="text"
                          value={editingLessonForm.quizOpt1}
                          onChange={e => setEditingLessonForm({ ...editingLessonForm, quizOpt1: e.target.value })}
                          placeholder="Role-based auto-waiting, Full XPath chains, Thread.sleep(5000)"
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-bold text-slate-400">Correct Option Index:</label>
                        <select
                          value={editingLessonForm.quizCorrect1}
                          onChange={e => setEditingLessonForm({ ...editingLessonForm, quizCorrect1: Number(e.target.value) })}
                          className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-bold"
                        >
                          <option value={0}>Option 1 (First)</option>
                          <option value={1}>Option 2 (Second)</option>
                          <option value={2}>Option 3 (Third)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. FILES */}
                {(editingLessonForm.activeSubTab || 'notes') === 'files' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-200">📦 Upload Lesson PDF, Image Diagram, or Starter Code</label>
                    <FileUploadZone
                      accept="image/*,.pdf,.zip,.ts,.doc,.docx"
                      label="Upload PDF or Image File"
                      hint="Supports PDF, PNG, JPG, ZIP, TS files (Max 50MB)"
                      value={editingLessonForm.attachmentUrl}
                      onUploadSuccess={(data) => {
                        setEditingLessonForm({
                          ...editingLessonForm,
                          attachmentName: data.name,
                          attachmentUrl: data.url,
                          attachmentSize: data.size,
                        });
                      }}
                      onRemove={() => {
                        setEditingLessonForm({
                          ...editingLessonForm,
                          attachmentName: '',
                          attachmentUrl: '',
                          attachmentSize: '1.4 MB',
                        });
                      }}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">File Name</label>
                        <input
                          type="text"
                          value={editingLessonForm.attachmentName}
                          onChange={e => setEditingLessonForm({ ...editingLessonForm, attachmentName: e.target.value })}
                          placeholder="playwright.config.ts or notes.pdf"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">Resource URL</label>
                        <input
                          type="text"
                          value={editingLessonForm.attachmentUrl}
                          onChange={e => setEditingLessonForm({ ...editingLessonForm, attachmentUrl: e.target.value })}
                          placeholder="/uploads/... or https://..."
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1">File Size</label>
                        <input
                          type="text"
                          value={editingLessonForm.attachmentSize}
                          onChange={e => setEditingLessonForm({ ...editingLessonForm, attachmentSize: e.target.value })}
                          placeholder="1.4 MB"
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-950/60">
              <button
                type="button"
                onClick={() => setEditingLessonModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 text-white text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer"
              >
                ✓ Save Lesson Notes &amp; Data →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: PORTFOLIO PROJECT CREATOR
      ════════════════════════════════════════════════════════════════════ */}
      {projectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateProject} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl p-6 sm:p-8 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Briefcase size={17} className="text-emerald-400" />
                  + Add QA Portfolio Project
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Publish enterprise automation case studies, tech stacks, metrics, and GitHub repos.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProjectForm({
                    title: 'Cross-Platform Mobile & Web Automation Framework',
                    shortDescription: 'Enterprise test automation suite with parallel execution on cloud grid, visual diff regression, and automated Jira defect filing.',
                    category: categories[0]?.name || 'Mobile Testing',
                    projectType: 'Commercial',
                    clientName: 'Global FinTech Corp',
                    industry: 'Banking & Financial Services',
                    role: 'Lead QA Automation Architect',
                    teamSize: '5 Automation Engineers',
                    duration: '4 Months',
                    automationCoverage: 95,
                    testCases: 350,
                    bugsFiled: 65,
                    technologies: 'Playwright, Appium, TypeScript, Python, Docker, GitHub Actions, AWS Device Farm, Allure',
                    githubUrl: 'https://github.com/qarajendra/enterprise-automation-suite',
                    liveUrl: 'https://allure-report.example.com',
                    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=700&auto=format&fit=crop&q=80',
                    status: 'Active',
                  })}
                  className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={11} /> + Auto-Fill Sample Project
                </button>
                <button type="button" onClick={() => setProjectModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800">✕</button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Project Title *</label>
              <input type="text" required value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
                placeholder="e.g. Banking API Automation Suite"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                <select value={projectForm.category} onChange={e => setProjectForm({ ...projectForm, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none">
                  {categories.map(cat => (
                    <option key={cat._id || cat.name} value={cat.name}>{cat.icon || '🏷️'} {cat.name}</option>
                  ))}
                  {categories.length === 0 && (
                    <>
                      <option value="QA Automation">QA Automation</option>
                      <option value="Web Automation">Web Automation</option>
                      <option value="API Automation">API Automation</option>
                      <option value="Mobile Testing">Mobile Testing</option>
                      <option value="DevOps & CI/CD">DevOps &amp; CI/CD</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Industry</label>
                <input type="text" value={projectForm.industry} onChange={e => setProjectForm({ ...projectForm, industry: e.target.value })}
                  placeholder="Banking & FinTech"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Client / Company Name</label>
                <input type="text" value={projectForm.clientName} onChange={e => setProjectForm({ ...projectForm, clientName: e.target.value })}
                  placeholder="FinTech Corp"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Short Description</label>
              <textarea rows={2} value={projectForm.shortDescription} onChange={e => setProjectForm({ ...projectForm, shortDescription: e.target.value })}
                placeholder="Enterprise end-to-end checkout testing framework with visual regression and network mocking."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none focus:outline-none" />
            </div>

            {/* ── TECHNOLOGIES & TOOLS ── */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Code2 size={14} className="text-emerald-400" />
                  Technologies &amp; Tools (Comma-separated tags)
                </label>
                <span className="text-[10px] text-slate-500">Shows as skill pills on project cards</span>
              </div>
              <input
                type="text"
                value={projectForm.technologies}
                onChange={e => setProjectForm({ ...projectForm, technologies: e.target.value })}
                placeholder="Playwright, TypeScript, Docker, GitHub Actions, Allure"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[
                  { label: '+ Playwright + TS Stack', stack: 'Playwright, TypeScript, Docker, Allure, GitHub Actions' },
                  { label: '+ Selenium + Java Stack', stack: 'Selenium WebDriver, Java, TestNG, Maven, Jenkins, ExtentReports' },
                  { label: '+ Appium Mobile Stack', stack: 'Appium, Python, PyTest, AWS Device Farm, BrowserStack' },
                  { label: '+ RestAssured API Stack', stack: 'RestAssured, Postman, Java, Newman, Karate, Swagger' },
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => setProjectForm({ ...projectForm, technologies: preset.stack })}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold border border-slate-700 transition cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── PROJECT LINKS (GitHub Repo & Live Demo) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Code2 size={13} className="text-indigo-400" /> GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={projectForm.githubUrl}
                  onChange={e => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                  placeholder="https://github.com/username/project-repo"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <ExternalLink size={13} className="text-purple-400" /> Live Demo / Report URL
                </label>
                <input
                  type="url"
                  value={projectForm.liveUrl}
                  onChange={e => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                  placeholder="https://allure-report.example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* ── METRICS & STATS ── */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Automation Coverage %', key: 'automationCoverage', placeholder: '95', type: 'number' },
                { label: 'Test Cases Automated', key: 'testCases', placeholder: '350', type: 'number' },
                { label: 'Bugs / Defects Filed', key: 'bugsFiled', placeholder: '42', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-slate-300 mb-1">{f.label}</label>
                  <input type={f.type || 'text'} value={projectForm[f.key]} onChange={e => setProjectForm({ ...projectForm, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none" />
                </div>
              ))}
            </div>

            {/* ── PROJECT COVER IMAGE ── */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Project Cover Image (Upload or URL)</label>
              <FileUploadZone
                accept="image/*"
                label="Upload Project Cover Image"
                hint="Supports PNG, JPG, WebP, SVG (Max 50MB)"
                value={projectForm.thumbnail}
                fileType="image"
                onUploadSuccess={(data) => setProjectForm({ ...projectForm, thumbnail: data.url })}
                onRemove={() => setProjectForm({ ...projectForm, thumbnail: '' })}
              />
              <input
                type="url"
                value={projectForm.thumbnail}
                onChange={e => setProjectForm({ ...projectForm, thumbnail: e.target.value })}
                placeholder="Or paste external image URL (e.g. https://images.unsplash.com/...)"
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 focus:outline-none"
              />
            </div>

            <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-xl cursor-pointer transition">
              🚀 Publish QA Project with Tech Stack &amp; Links →
            </button>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: CATEGORY CREATOR
      ════════════════════════════════════════════════════════════════════ */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateCategory} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2"><Tag size={17} className="text-orange-400" /> + Add Category</h3>
              <button type="button" onClick={() => setCatModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            {[
              { label: 'Category Name *', key: 'name', placeholder: 'e.g. API Automation' },
              { label: 'Slug *', key: 'slug', placeholder: 'e.g. api-automation' },
              { label: 'Icon (Emoji)', key: 'icon', placeholder: '🤖' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-slate-300 mb-1">{f.label}</label>
                <input type="text" required={f.key !== 'icon'} value={catForm[f.key]} onChange={e => setCatForm({ ...catForm, [f.key]: e.target.value })}
                  placeholder={f.placeholder} className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
              <textarea rows={2} value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none" />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold text-xs shadow-lg cursor-pointer">
              Create Category
            </button>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: YOUTUBE VIDEO CREATOR
      ════════════════════════════════════════════════════════════════════ */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateVideo} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2"><Video size={17} className="text-rose-400" /> + Add YouTube Video</h3>
              <button type="button" onClick={() => setVideoModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Title *</label>
              <input type="text" required value={videoForm.title} onChange={e => setVideoForm({ ...videoForm, title: e.target.value })}
                placeholder="e.g. Playwright Full Course 2025" className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">YouTube URL *</label>
              <input type="text" required value={videoForm.youtubeUrl} onChange={e => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..." className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
              <select value={videoForm.category} onChange={e => setVideoForm({ ...videoForm, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none">
                {categories.map(cat => (
                  <option key={cat._id || cat.name} value={cat.name}>{cat.icon || '▶️'} {cat.name}</option>
                ))}
                {categories.length === 0 && <option value="QA Automation">QA Automation</option>}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
              <textarea rows={2} value={videoForm.description} onChange={e => setVideoForm({ ...videoForm, description: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none focus:outline-none" />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-xs shadow-lg cursor-pointer">
              Add YouTube Video
            </button>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          MODAL: COURSE CREATOR & EDITOR
      ════════════════════════════════════════════════════════════════════ */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateCourse} className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <BookOpen size={17} className="text-indigo-400" />
                  + Create New Course
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Define course metadata, categories, difficulty, pricing, and thumbnail.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCourseForm({
                    title: 'Playwright & TypeScript Test Automation Architecture 2025',
                    shortDescription: 'Master modern web & API test automation using Playwright, Page Object Models, parallel sharding, and CI/CD reporting.',
                    category: categories[0]?.name || 'QA Automation',
                    difficulty: 'Intermediate',
                    duration: '8 Weeks',
                    instructor: profile.name || 'QA RP',
                    isFree: true,
                    price: 0,
                    status: 'Active',
                    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&auto=format&fit=crop&q=80',
                  })}
                  className="px-2.5 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={11} /> + Auto-Fill Course
                </button>
                <button type="button" onClick={() => setCourseModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800">✕</button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Course Title *</label>
              <input type="text" required value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="e.g. Master Playwright Automation with TypeScript"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-none focus:border-indigo-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Short Description</label>
              <textarea rows={2} value={courseForm.shortDescription} onChange={e => setCourseForm({ ...courseForm, shortDescription: e.target.value })}
                placeholder="Comprehensive training blueprint covering framework design, locators, and CI/CD pipelines."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none focus:outline-none focus:border-indigo-500" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                <select value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none">
                  {categories.map(cat => (
                    <option key={cat._id || cat.name} value={cat.name}>{cat.icon || '📚'} {cat.name}</option>
                  ))}
                  {categories.length === 0 && <option value="QA Automation">QA Automation</option>}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Difficulty</label>
                <select value={courseForm.difficulty} onChange={e => setCourseForm({ ...courseForm, difficulty: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>All levels</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Duration</label>
                <input type="text" value={courseForm.duration} onChange={e => setCourseForm({ ...courseForm, duration: e.target.value })}
                  placeholder="8 Weeks" className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Instructor</label>
                <input type="text" value={courseForm.instructor} onChange={e => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  placeholder="QA RP" className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={courseForm.isFree} onChange={e => setCourseForm({ ...courseForm, isFree: e.target.checked, price: e.target.checked ? 0 : 49.99 })}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700" />
                <span className="text-xs font-bold text-emerald-400">100% Free Course</span>
              </label>
              {!courseForm.isFree && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Course Price ($)</label>
                  <input type="number" min="0" step="0.01" value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Course Thumbnail (Upload or URL)</label>
              <FileUploadZone
                accept="image/*"
                label="Upload Course Cover Image"
                hint="Supports PNG, JPG, WebP, SVG (Max 50MB)"
                value={courseForm.thumbnail}
                fileType="image"
                onUploadSuccess={(data) => setCourseForm({ ...courseForm, thumbnail: data.url })}
                onRemove={() => setCourseForm({ ...courseForm, thumbnail: '' })}
              />
              <input
                type="url"
                value={courseForm.thumbnail}
                onChange={e => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                placeholder="Or paste external image URL"
                className="w-full mt-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 focus:outline-none"
              />
            </div>

            <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 text-white font-extrabold text-xs shadow-xl cursor-pointer transition">
              🚀 Create Course with Curriculum →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
