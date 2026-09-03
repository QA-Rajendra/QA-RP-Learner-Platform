'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Code2,
  Search,
  ClipboardList,
  Plus
} from 'lucide-react';
import CreateTestCaseModal from '@/components/testcases/CreateTestCaseModal';

function ProjectsContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('category') || 'All';

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [testCaseModalOpen, setTestCaseModalOpen] = useState(false);
  const [selectedProjectForCase, setSelectedProjectForCase] = useState(null);

  useEffect(() => {
    if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category'));
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [projRes, catRes] = await Promise.all([
          fetch('/api/portfolio-projects').then(r => r.json()).catch(() => []),
          fetch('/api/categories').then(r => r.json()).catch(() => []),
        ]);
        const list = Array.isArray(projRes) && projRes.length > 0 ? projRes : [
          {
            _id: 'p-1',
            title: 'E-Commerce Playwright Automation Framework',
            category: 'Web Automation',
            shortDescription: 'Enterprise end-to-end checkout testing framework with visual regression and network mocking.',
            automationCoverage: 92,
            testCases: 145,
            defectsFound: 28,
            technologies: ['Playwright', 'TypeScript', 'Docker', 'GitHub Actions', 'Allure'],
            tools: ['Playwright Test', 'Postman', 'Docker'],
            links: { github: 'https://github.com', live: 'https://demo.example.com' }
          },
          {
            _id: 'p-2',
            title: 'Banking Web & API Automation Suite',
            category: 'API Automation',
            shortDescription: 'Full hybrid test automation for critical financial transfer transactions with JWT auth validation.',
            automationCoverage: 88,
            testCases: 210,
            defectsFound: 42,
            technologies: ['Selenium', 'Java', 'RestAssured', 'TestNG', 'Jenkins'],
            tools: ['Selenium WebDriver', 'RestAssured', 'Maven'],
            links: { github: 'https://github.com' }
          },
          {
            _id: 'p-3',
            title: 'Mobile Banking App Test Automation',
            category: 'Mobile Testing',
            shortDescription: 'Cross-platform mobile automation suite executing on real iOS & Android devices in AWS Device Farm.',
            automationCoverage: 85,
            testCases: 95,
            defectsFound: 19,
            technologies: ['Appium', 'Python', 'PyTest', 'AWS Device Farm'],
            tools: ['Appium', 'PyTest'],
            links: { github: 'https://github.com' }
          },
          {
            _id: 'p-4',
            title: 'CI/CD Automated Sharding Matrix Pipeline',
            category: 'DevOps & CI/CD',
            shortDescription: 'Optimized multi-worker GitHub Actions pipeline reducing full test execution time from 25 min to 3.5 min.',
            automationCoverage: 95,
            testCases: 350,
            defectsFound: 65,
            technologies: ['GitHub Actions', 'Docker', 'Playwright', 'Node.js'],
            tools: ['Docker', 'GitHub Actions'],
            links: { github: 'https://github.com' }
          }
        ];
        setProjects(list);
        if (Array.isArray(catRes)) setCategories(catRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = projects.filter(p => {
    if (selectedCategory !== 'All' && p.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.shortDescription?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase">
            <Briefcase size={15} /> QA Portfolio Projects
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Enterprise Test Automation Projects
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Real-world QA engineering case studies, framework repositories, automation coverage metrics, and defect reports.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedProjectForCase(null);
                setTestCaseModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center gap-2 transition shadow-lg shadow-purple-950/50 cursor-pointer"
            >
              <Plus size={15} /> + Create New Test Case
            </button>
            <Link
              href="/test-cases"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
            >
              <ClipboardList size={15} /> Test Cases Matrix →
            </Link>
          </div>
        </div>

        {/* Dynamic Category Chips */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              💼 All Projects ({projects.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id || cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory.toLowerCase() === cat.name.toLowerCase()
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/60'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{cat.icon || '🏷️'}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.name} value={cat.name}>
                {cat.icon || '🏷️'} {cat.name}
              </option>
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

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((proj) => (
            <div
              key={proj._id}
              id={proj._id}
              className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 hover:border-purple-500/40 transition hover:shadow-2xl hover:shadow-purple-950/40 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {proj.category || 'QA Automation'}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> {proj.automationCoverage || 85}% Coverage
                  </span>
                </div>

                <h2 className="text-xl font-black text-white">{proj.title}</h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {proj.shortDescription || proj.description}
                </p>

                {/* QA Metrics Highlights */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/80 text-center">
                  <div>
                    <div className="text-base font-black text-indigo-400">{proj.testCases || 120}+</div>
                    <div className="text-[10px] text-slate-400 font-semibold">Test Cases</div>
                  </div>
                  <div>
                    <div className="text-base font-black text-rose-400">{proj.defectsFound || 25}</div>
                    <div className="text-[10px] text-slate-400 font-semibold">Defects Caught</div>
                  </div>
                  <div>
                    <div className="text-base font-black text-emerald-400">{proj.automationCoverage || 85}%</div>
                    <div className="text-[10px] text-slate-400 font-semibold">Coverage</div>
                  </div>
                </div>

                {/* Tech Stack Pills */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Technologies &amp; Tools</div>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies?.map((tech, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-200 border border-slate-800 text-[11px] font-semibold">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Links & CTA */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setSelectedProjectForCase(proj);
                    setTestCaseModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-bold transition cursor-pointer"
                  title="Add Test Case to this Project"
                >
                  <Plus size={13} /> Test Case
                </button>
                {proj.links?.github && (
                  <a
                    href={proj.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
                  >
                    <Code2 size={13} /> Repo
                  </a>
                )}
                {proj.links?.live && (
                  <a
                    href={proj.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-950/50"
                  >
                    <ExternalLink size={13} /> Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Test Case Modal */}
      <CreateTestCaseModal
        isOpen={testCaseModalOpen}
        onClose={() => setTestCaseModalOpen(false)}
        projectId={selectedProjectForCase?._id}
        initialModule={selectedProjectForCase?.category || 'Login'}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}

export default function ProjectsShowcasePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading projects...</div>}>
      <ProjectsContent />
    </Suspense>
  );
}
