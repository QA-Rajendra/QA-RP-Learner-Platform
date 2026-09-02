'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  User,
  Shield,
  Award,
  Terminal,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Mail,
  Edit3,
  Plus,
  Trash2,
  Save,
  X,
  RotateCcw,
  Check,
  Crown
} from 'lucide-react';

const emptySubscribe = () => () => {};

const DEFAULT_PROFILE = {
  name: 'QA RP (QA Lead)',
  title: 'QA Automation Architect & Instructor',
  bio: '10+ years specializing in enterprise test automation, resilient framework design, CI/CD matrix sharding, and mentoring 10,000+ QA engineers worldwide.',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
  skills: [
    'Test Automation Architecture (POM, Hybrid, BDD)',
    'Web E2E Testing (Playwright, Selenium 4, Cypress)',
    'REST API Testing & Mocking (RestAssured, Postman, Supertest)',
    'Mobile Automation (Appium, Android & iOS)',
    'Performance & Load Testing (JMeter, k6)',
    'CI/CD Sharding & Cloud Runners (GitHub Actions, Docker, Jenkins)',
    'Defect Root-Cause Analysis & Traceability Matrices',
    'Automated Test Reporting (Allure, HTML Summaries, Slack Alerts)'
  ],
  tools: [
    { name: 'Playwright', category: 'Web & API', level: 'Expert' },
    { name: 'Selenium WebDriver', category: 'Web Automation', level: 'Expert' },
    { name: 'Java / TypeScript / JS', category: 'Programming', level: 'Expert' },
    { name: 'RestAssured', category: 'API Testing', level: 'Expert' },
    { name: 'Postman', category: 'API Testing', level: 'Advanced' },
    { name: 'Docker', category: 'DevOps', level: 'Advanced' },
    { name: 'GitHub Actions', category: 'CI/CD Pipelines', level: 'Expert' },
    { name: 'JMeter', category: 'Performance', level: 'Advanced' },
    { name: 'MongoDB / SQL', category: 'Database Testing', level: 'Advanced' },
    { name: 'Appium', category: 'Mobile Automation', level: 'Advanced' }
  ],
  timeline: [
    {
      year: '2023 – Present',
      role: 'Lead QA Automation Architect',
      company: 'Enterprise FinTech & SaaS',
      desc: 'Architected Playwright & Selenium hybrid frameworks with matrix sharding, slashing test execution time by 75% across 200+ microservices.'
    },
    {
      year: '2021 – 2023',
      role: 'Senior QA Automation Engineer',
      company: 'E-Commerce Platform',
      desc: 'Designed end-to-end checkout regression suites and API contract validation engines with automated Slack defect triaging.'
    },
    {
      year: '2019 – 2021',
      role: 'QA Engineer',
      company: 'Software Solutions',
      desc: 'Built core functional test suites, automated regression testing with Selenium & Java, and maintained defect repositories.'
    }
  ]
};

export default function AboutPage() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = mounted && session?.user?.role === 'ADMIN';

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editTab, setEditTab] = useState('hero'); // 'hero' | 'skills' | 'tools' | 'timeline'
  const [formData, setFormData] = useState(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });

  // Temporary item inputs for CRUD
  const [newSkill, setNewSkill] = useState('');
  const [newTool, setNewTool] = useState({ name: '', category: 'Web Automation', level: 'Expert' });
  const [newTimeline, setNewTimeline] = useState({ year: '', role: '', company: '', desc: '' });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  useEffect(() => {
    let isCurrent = true;
    async function fetchProfile() {
      try {
        setLoading(true);
        const res = await fetch('/api/about');
        if (res.ok) {
          const data = await res.json();
          if (isCurrent && data) {
            setProfile(data);
            setFormData(data);
          }
        }
      } catch (err) {
        console.error('Failed to load about profile:', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }
    fetchProfile();
    return () => {
      isCurrent = false;
    };
  }, []);

  const handleOpenEditModal = () => {
    setFormData(JSON.parse(JSON.stringify(profile)));
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditing(false);
        showToast('✓ About Profile & CRUD data updated in MongoDB!');
      } else {
        showToast('Failed to save profile updates.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  // Skills CRUD
  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setFormData({
      ...formData,
      skills: [...(formData.skills || []), newSkill.trim()]
    });
    setNewSkill('');
  };

  const handleDeleteSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  // Tools CRUD
  const handleAddTool = () => {
    if (!newTool.name.trim()) return;
    setFormData({
      ...formData,
      tools: [...(formData.tools || []), { ...newTool }]
    });
    setNewTool({ name: '', category: 'Web Automation', level: 'Expert' });
  };

  const handleDeleteTool = (index) => {
    setFormData({
      ...formData,
      tools: formData.tools.filter((_, i) => i !== index)
    });
  };

  // Timeline CRUD
  const handleAddTimeline = () => {
    if (!newTimeline.year.trim() || !newTimeline.role.trim()) return;
    setFormData({
      ...formData,
      timeline: [
        { ...newTimeline },
        ...(formData.timeline || [])
      ]
    });
    setNewTimeline({ year: '', role: '', company: '', desc: '' });
  };

  const handleDeleteTimeline = (index) => {
    setFormData({
      ...formData,
      timeline: formData.timeline.filter((_, i) => i !== index)
    });
  };

  const handleResetDefaults = () => {
    if (!confirm('Reset all profile details, skills, tools, and timeline to default template?')) return;
    setFormData(JSON.parse(JSON.stringify(DEFAULT_PROFILE)));
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-10 h-10 rounded-2xl border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <p className="text-xs font-semibold">Loading Instructor Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-slide-up border border-emerald-400">
          <Check size={16} />
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Admin Authority Banner & Edit Trigger */}
        {isAdmin && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/50 via-slate-900 to-indigo-950/50 border border-red-500/30 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                <Crown size={16} />
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  Admin Authority Active
                </div>
                <div className="text-[11px] text-slate-400">
                  Full CRUD permissions enabled for Instructor Profile, Skills, Tools, and Timeline.
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenEditModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-950/50 transition shrink-0"
            >
              <Edit3 size={14} /> ✏️ Edit Profile &amp; Manage CRUD
            </button>
          </div>
        )}

        {/* Profile Hero Header */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-indigo-950/40 relative overflow-hidden">
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-1 shrink-0 shadow-xl shadow-indigo-950/60">
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex items-center justify-center overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="text-indigo-400" />
              )}
            </div>
          </div>

          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Shield size={13} /> {profile.title || 'QA Automation Architect & Instructor'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              {profile.name || 'QA RP (QA Lead)'}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
              {profile.bio}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <Link
                href="/projects"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-950/50"
              >
                <Briefcase size={14} className="inline mr-1.5" /> View QA Projects
              </Link>
              <Link
                href="/courses"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
              >
                <GraduationCap size={14} className="inline mr-1.5" /> Browse Courses
              </Link>
              <Link
                href="/contact"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
              >
                <Mail size={14} className="inline mr-1.5" /> Get in Touch
              </Link>
              {isAdmin && (
                <button
                  onClick={handleOpenEditModal}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs border border-indigo-500/30 transition flex items-center gap-1.5"
                >
                  <Edit3 size={13} /> Edit Header
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Core Testing Expertise */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-400" /> Core Testing Skills &amp; Methodology
            </h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditTab('skills');
                  handleOpenEditModal();
                }}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
              >
                <Edit3 size={12} /> Edit Skills ({profile.skills?.length || 0})
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.skills?.map((skill, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tools & Frameworks Grid */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Terminal size={18} className="text-purple-400" /> Tools &amp; Automation Technologies
            </h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditTab('tools');
                  handleOpenEditModal();
                }}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
              >
                <Edit3 size={12} /> Edit Tools ({profile.tools?.length || 0})
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {profile.tools?.map((t, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 hover:border-purple-500/50 transition">
                <div className="font-extrabold text-xs text-white truncate">{t.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{t.category}</div>
                <span className="inline-block text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                  {t.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Career Timeline */}
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Award size={18} className="text-amber-400" /> Professional Experience &amp; Leadership
            </h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditTab('timeline');
                  handleOpenEditModal();
                }}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
              >
                <Edit3 size={12} /> Edit Timeline ({profile.timeline?.length || 0})
              </button>
            )}
          </div>
          <div className="space-y-6">
            {profile.timeline?.map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-4 pb-6 border-b border-slate-800/80 last:border-0 last:pb-0">
                <div className="sm:w-44 shrink-0">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-950 text-indigo-300 border border-slate-800">
                    {item.year}
                  </span>
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-black text-sm text-white">{item.role}</h3>
                  <div className="text-xs text-indigo-400 font-medium">{item.company}</div>
                  <p className="text-xs text-slate-300 leading-relaxed pt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL ADMIN CRUD MODAL STUDIO */}
      {/* ========================================================================= */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-white">About Page CRUD Studio</h2>
                  <p className="text-xs text-slate-400">Edit and save instructor information, skills, tools, and timeline.</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800 bg-slate-950/40">
              <button
                onClick={() => setEditTab('hero')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  editTab === 'hero' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                👤 Hero &amp; Bio
              </button>
              <button
                onClick={() => setEditTab('skills')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  editTab === 'skills' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ✨ Skills ({formData.skills?.length || 0})
              </button>
              <button
                onClick={() => setEditTab('tools')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  editTab === 'tools' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                💻 Tools ({formData.tools?.length || 0})
              </button>
              <button
                onClick={() => setEditTab('timeline')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  editTab === 'timeline' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                🏆 Experience ({formData.timeline?.length || 0})
              </button>
            </div>

            {/* Modal Body / Tab Contents */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* TAB 1: HERO & BIO */}
              {editTab === 'hero' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Instructor Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Designation / Badge *
                      </label>
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Avatar / Profile Photo URL
                    </label>
                    <input
                      type="text"
                      value={formData.avatar || ''}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                    {formData.avatar && (
                      <div className="mt-2 flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <img src={formData.avatar} alt="Preview" className="w-12 h-12 rounded-xl object-cover" />
                        <span className="text-[11px] text-slate-400">Avatar Image Preview</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      Bio &amp; Professional Summary *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.bio || ''}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: SKILLS CRUD */}
              {editTab === 'skills' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      + Add New Testing Skill / Methodology
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="e.g. AI-Driven Automated Test Generation & Healing"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition"
                      >
                        <Plus size={14} /> Add Skill
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Current Skills List ({formData.skills?.length || 0})
                    </div>
                    {formData.skills?.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2 text-slate-200">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span>{s}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(idx)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                          title="Delete skill"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: TOOLS CRUD */}
              {editTab === 'tools' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      + Add New Automation Tool
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newTool.name}
                        onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                        placeholder="Tool Name (e.g. Playwright)"
                        className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="text"
                        value={newTool.category}
                        onChange={(e) => setNewTool({ ...newTool, category: e.target.value })}
                        placeholder="Category (e.g. Web Automation)"
                        className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                      <select
                        value={newTool.level}
                        onChange={(e) => setNewTool({ ...newTool, level: e.target.value })}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                      >
                        <option value="Expert">Expert</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Beginner">Beginner</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTool}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 transition"
                    >
                      <Plus size={14} /> Add Tool Card
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {formData.tools?.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-white">{t.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {t.category} • <span className="text-purple-400">{t.level}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteTool(idx)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: TIMELINE CRUD */}
              {editTab === 'timeline' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      + Add Professional Experience Item
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newTimeline.year}
                        onChange={(e) => setNewTimeline({ ...newTimeline, year: e.target.value })}
                        placeholder="Period (e.g. 2024 – Present)"
                        className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        value={newTimeline.role}
                        onChange={(e) => setNewTimeline({ ...newTimeline, role: e.target.value })}
                        placeholder="Role Title"
                        className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        value={newTimeline.company}
                        onChange={(e) => setNewTimeline({ ...newTimeline, company: e.target.value })}
                        placeholder="Company / Domain"
                        className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={newTimeline.desc}
                      onChange={(e) => setNewTimeline({ ...newTimeline, desc: e.target.value })}
                      placeholder="Summary of responsibilities, framework achievements, and metrics..."
                      className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddTimeline}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition"
                    >
                      <Plus size={14} /> Add Timeline Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.timeline?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-indigo-300 font-bold text-[10px]">
                            {item.year}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTimeline(idx)}
                            className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="font-bold text-white">{item.role}</div>
                        <div className="text-[11px] text-indigo-400 font-medium">{item.company}</div>
                        <p className="text-[11px] text-slate-300 leading-relaxed pt-1">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition border border-slate-800"
              >
                <RotateCcw size={13} /> Reset Template
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveProfile}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition shadow-emerald-950/50"
                >
                  <Save size={14} /> {saving ? 'Saving to MongoDB...' : 'Save & Update Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
