'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LogOut,
  GraduationCap,
  Menu,
  X,
  Crown,
  Settings,
  BookOpen,
  Briefcase,
  FileText,
  User,
  Mail,
  Shield,
  Check,
  ChevronDown,
  Palette,
  Sparkles,
  ClipboardList,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeDropdown, setThemeDropdown] = useState(false);
  const [adminDropdown, setAdminDropdown] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, isDark, themes, currentTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only evaluate role after mount to prevent SSR/CSR hydration mismatch
  const isAdmin = mounted && session?.user?.role === 'ADMIN';

  const handleLogout = async () => {
    setSwitching(true);
    await signOut({ redirect: false });
    setSwitching(false);
    router.push('/');
    router.refresh();
  };

  return (
    <nav
      suppressHydrationWarning
      className="sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 border-b font-sans shadow-lg"
      style={{
        backgroundColor: 'var(--nav-bg)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-main)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 shrink-0 group-hover:scale-105"
              style={{
                background: 'var(--theme-gradient, linear-gradient(135deg, #3B82F6, #60A5FA))',
                boxShadow: 'var(--primary-glow)',
              }}
            >
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col shrink-0">
              <span
                className="font-display font-black text-base lg:text-lg leading-tight tracking-tight whitespace-nowrap bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'var(--theme-gradient, linear-gradient(to right, #FFFFFF, #93C5FD))',
                }}
              >
                QA RP <span className="font-extrabold text-indigo-400">Learner Platform</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            <NavLink href="/" label="Home" active={pathname === '/'} />
            <NavLink href="/courses" icon={<BookOpen size={13} />} label="Courses" active={pathname.startsWith('/courses') || pathname.startsWith('/learn')} />
            <NavLink href="/projects" icon={<Briefcase size={13} />} label="Projects" active={pathname === '/projects'} />
            <NavLink href="/test-cases" icon={<ClipboardList size={13} />} label="Test Cases" active={pathname.startsWith('/test-cases')} />
            <NavLink href="/my-learning" icon={<GraduationCap size={13} />} label="My Learning" active={pathname === '/my-learning'} />
            <NavLink href="/about" icon={<User size={13} />} label="About" active={pathname === '/about'} />
            <NavLink href="/contact" icon={<Mail size={13} />} label="Contact" active={pathname === '/contact'} />
            
            {/* CONSOLIDATED ADMIN STUDIO DROPDOWN */}
            {isAdmin && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAdminDropdown(!adminDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer"
                  style={{
                    backgroundColor: (pathname === '/settings' || pathname === '/gallery') ? 'var(--bg-card-hover, rgba(255,255,255,0.08))' : 'transparent',
                    borderColor: (pathname === '/settings' || pathname === '/gallery') ? 'var(--border-active)' : 'transparent',
                    color: (pathname === '/settings' || pathname === '/gallery') ? 'var(--color-primary)' : 'var(--text-main)',
                  }}
                >
                  <ShieldCheck size={13} style={{ color: 'var(--color-primary)' }} />
                  <span>Admin Studio</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-red-500/20 text-red-400 border border-red-500/30">
                    Admin
                  </span>
                  <ChevronDown size={12} className={`opacity-60 transition-transform duration-200 ${adminDropdown ? 'rotate-180' : ''}`} />
                </button>

                {adminDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAdminDropdown(false)} />
                    <div
                      className="absolute right-0 mt-2 w-60 rounded-2xl p-2 z-50 border shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-color)',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)',
                      }}
                    >
                      <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800/60 flex items-center justify-between">
                        <span>Admin Navigation</span>
                        <Crown size={12} className="text-red-400" />
                      </div>
                      <div className="space-y-1 mt-1">
                        <Link
                          href="/settings"
                          onClick={() => setAdminDropdown(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-white/5 transition"
                          style={{
                            color: pathname === '/settings' ? 'var(--color-primary)' : 'var(--text-main)',
                          }}
                        >
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                            <Settings size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate">Settings Studio</div>
                            <div className="text-[10px] text-slate-400 font-normal truncate">Curriculum & platform CRUD</div>
                          </div>
                        </Link>

                        <Link
                          href="/gallery"
                          onClick={() => setAdminDropdown(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-white/5 transition"
                          style={{
                            color: pathname === '/gallery' ? 'var(--color-primary)' : 'var(--text-main)',
                          }}
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                            <FileText size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate">Media Gallery</div>
                            <div className="text-[10px] text-slate-400 font-normal truncate">Uploads & blueprints</div>
                          </div>
                        </Link>

                        <Link
                          href="/test-cases"
                          onClick={() => setAdminDropdown(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-white/5 transition"
                          style={{
                            color: pathname === '/test-cases' ? 'var(--color-primary)' : 'var(--text-main)',
                          }}
                        >
                          <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
                            <ClipboardList size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate">Test Cases Suite</div>
                            <div className="text-[10px] text-slate-400 font-normal truncate">Execute & author test cases</div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Quick Controls: Animated Themes Selector & Role/Auth */}
          <div className="flex items-center gap-2.5">
            {/* ANIMATED THEMES DROPDOWN */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setThemeDropdown(!themeDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-300 shadow-sm"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: themeDropdown ? 'var(--border-active)' : 'var(--border-color)',
                  color: 'var(--text-main)',
                  boxShadow: themeDropdown ? 'var(--primary-glow)' : 'none',
                }}
                title="Switch Theme"
              >
                <span className="text-sm">{currentTheme?.icon || '⚡'}</span>
                <span className="hidden sm:inline font-semibold">{currentTheme?.name || 'Theme'}</span>
                <ChevronDown size={13} className={`opacity-60 transition-transform duration-200 ${themeDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Exact Animated Themes Menu Box from Screenshot */}
              {themeDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setThemeDropdown(false)} />
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-2xl p-2.5 z-50 border shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-150"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-main)',
                      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* Header: ANIMATED THEMES */}
                    <div className="px-2.5 py-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-60">
                      <span>Animated Themes</span>
                      <Sparkles size={11} style={{ color: 'var(--color-primary)' }} />
                    </div>

                    <div className="space-y-1 mt-1">
                      {themes.map((t) => {
                        const isSelected = theme === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              setTheme(t.id);
                              setThemeDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all duration-150 group"
                            style={{
                              backgroundColor: isSelected ? 'var(--bg-card-hover, rgba(255,255,255,0.08))' : 'transparent',
                              border: isSelected ? '1px solid var(--border-active)' : '1px solid transparent',
                              boxShadow: isSelected ? 'var(--primary-glow)' : 'none',
                            }}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-base shrink-0">{t.icon}</span>
                              <div className="truncate">
                                <span
                                  className="text-xs font-bold block truncate"
                                  style={{
                                    color: isSelected ? 'var(--color-primary)' : 'var(--text-main)',
                                  }}
                                >
                                  {t.name}
                                </span>
                              </div>
                            </div>

                            {/* Active Indicator / Color Dot */}
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20 inline-block"
                                style={{ backgroundColor: t.colors.primary }}
                              />
                              {isSelected && <Check size={13} style={{ color: 'var(--color-primary)' }} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {isAdmin ? (
              /* Admin Active State */
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                  }}
                >
                  <Crown size={13} /> Admin: QA RP
                </span>
                <button
                  onClick={handleLogout}
                  disabled={switching}
                  title="Logout from Admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border shadow-sm"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)',
                  }}
                >
                  <LogOut size={13} /> {switching ? '...' : 'Logout'}
                </button>
              </div>
            ) : (
              /* Public / Learner State -> Admin Login CTA */
              <Link
                href="/signin"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition shadow-md"
                style={{
                  background: 'var(--theme-gradient, linear-gradient(135deg, #3B82F6, #2563EB))',
                }}
              >
                <Shield size={13} /> Admin Login
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-1.5 rounded-lg border"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
              }}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div
          className="lg:hidden border-t px-4 py-3 flex flex-col gap-1 transition"
          style={{
            backgroundColor: 'var(--bg-main)',
            borderColor: 'var(--border-color)',
          }}
        >
          <MobileLink href="/" label="🏠 Home" onClick={() => setMenuOpen(false)} />
          <MobileLink href="/about" label="👤 About Instructor" onClick={() => setMenuOpen(false)} />
          <MobileLink href="/courses" label="📚 Courses Catalog" onClick={() => setMenuOpen(false)} />
          <MobileLink href="/projects" label="💼 QA Projects" onClick={() => setMenuOpen(false)} />
          <MobileLink href="/test-cases" label="🧪 QA Test Cases Suite" onClick={() => setMenuOpen(false)} />
          <MobileLink href="/my-learning" label="🎓 My Learning Dashboard" onClick={() => setMenuOpen(false)} />
          <MobileLink href="/contact" label="✉️ Contact & Inquiries" onClick={() => setMenuOpen(false)} />
          {isAdmin && (
            <>
              <MobileLink href="/gallery" label="📁 Admin Media Gallery" onClick={() => setMenuOpen(false)} />
              <MobileLink href="/settings" label="⚙️ Admin Settings Studio" onClick={() => setMenuOpen(false)} />
            </>
          )}
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, icon, label, badge, active }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
      style={{
        backgroundColor: active ? 'var(--bg-card-hover, rgba(255,255,255,0.08))' : 'transparent',
        border: active ? '1px solid var(--border-active)' : '1px solid transparent',
        color: active ? 'var(--color-primary)' : 'var(--text-main)',
        opacity: active ? 1 : 0.8,
      }}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span
          className="px-1.5 py-0.2 rounded-full text-[9px] font-bold"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function MobileLink({ href, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-3 py-2 rounded-xl text-xs font-semibold opacity-90 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition"
    >
      {label}
    </Link>
  );
}