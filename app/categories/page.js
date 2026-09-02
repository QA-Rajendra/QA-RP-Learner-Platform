'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Tag,
  Plus,
  Trash2,
  BookOpen,
  Briefcase,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function CategoriesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const [cats, setCats] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('📚');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCats(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setAdding(true);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, '-'),
          icon: icon.trim() || '📚',
          description: description.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCats(prev => [data, ...prev]);
        setName('');
        setSlug('');
        setDescription('');
      } else {
        alert(data.error || 'Failed to create category');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCats(prev => prev.filter(c => c._id !== id));
      }
    } catch (err) {
      alert('Error deleting category');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-bold uppercase">
            <Tag size={15} /> Course &amp; Project Categories
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Explore Learning Taxonomy
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Browse automation courses, case studies, and code projects grouped by testing specialization.
          </p>
        </div>

        {/* Admin Quick Category Creator */}
        {isAdmin && (
          <form onSubmit={handleAdd} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Plus size={16} className="text-orange-400" /> + Add New Category
              </h3>
              <span className="text-[11px] text-slate-500">Admin Studio Control</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (!slug || slug === name.toLowerCase().replace(/\s+/g, '-')) {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  placeholder="e.g. Performance & Load Testing"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="performance-testing"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Emoji Icon</label>
                <input
                  type="text"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  placeholder="⚡"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white text-center focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief summary of skills and test automation topics covered in this track."
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={adding}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white text-xs font-black transition shadow-lg cursor-pointer"
              >
                {adding ? 'Saving...' : '✓ Add Category'}
              </button>
            </div>
          </form>
        )}

        {/* Categories Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
            <Sparkles size={18} className="animate-spin text-orange-400" /> Loading taxonomy...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cats.map((cat) => (
              <div
                key={cat._id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 hover:border-orange-500/40 transition hover:shadow-2xl hover:shadow-orange-950/40 relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 rounded-2xl bg-slate-950 border border-slate-800 inline-block">
                      {cat.icon || '🏷️'}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="opacity-0 group-hover:opacity-100 transition p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white mt-3">{cat.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {cat.description || `Specialized test blueprints and automation projects for ${cat.name}.`}
                  </p>
                </div>

                {/* Cross-Module Quick Filters */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
                  <Link
                    href={`/courses?category=${encodeURIComponent(cat.name)}`}
                    className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 text-[11px] font-bold text-center border border-slate-800 hover:border-indigo-500/40 transition flex items-center justify-center gap-1"
                  >
                    <BookOpen size={12} /> Courses
                  </Link>
                  <Link
                    href={`/projects?category=${encodeURIComponent(cat.name)}`}
                    className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-purple-600/20 text-purple-300 hover:text-purple-200 text-[11px] font-bold text-center border border-slate-800 hover:border-purple-500/40 transition flex items-center justify-center gap-1"
                  >
                    <Briefcase size={12} /> Projects
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}