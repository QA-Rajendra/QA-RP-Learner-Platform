'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  ClipboardList,
  FileText,
  Mail,
  User,
  Shield,
  Sparkles,
  ExternalLink,
  Code2,
  Heart
} from 'lucide-react';

export default function Footer() {
  return (
    <footer
      suppressHydrationWarning
      className="border-t font-sans transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-surface, #0B1020)',
        borderColor: 'var(--border-color, #1E293B)',
        color: 'var(--text-main, #F8FAFC)',
      }}
    >
      {/* Upper Footer: Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105"
                style={{ background: 'var(--theme-gradient, linear-gradient(135deg, #3B82F6, #60A5FA))' }}
              >
                <GraduationCap size={22} />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-tight">
                  QA RP Learner Platform
                </span>
                <span
                  className="text-[10px] uppercase font-bold tracking-widest"
                  style={{ color: 'var(--color-primary, #3B82F6)' }}
                >
                  Enterprise Automation Hub
                </span>
              </div>
            </Link>

            <p
              className="text-xs sm:text-sm leading-relaxed max-w-sm"
              style={{ color: 'var(--text-muted, #94A3B8)' }}
            >
              Industry-grade QA test automation learning, real-time regression suites, test case architecture, and engineering runlogs designed for modern SDETs.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {['Playwright', 'Selenium', 'Cypress', 'RestAssured', 'CI/CD'].map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border"
                  style={{
                    backgroundColor: 'var(--bg-card, #151C2F)',
                    borderColor: 'var(--border-color, #1E293B)',
                    color: 'var(--text-muted, #94A3B8)',
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Platform
            </h3>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--text-muted, #94A3B8)' }}>
              <li>
                <Link href="/" className="hover:text-white transition flex items-center gap-1.5">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white transition flex items-center gap-1.5">
                  <BookOpen size={12} /> Courses Catalog
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition flex items-center gap-1.5">
                  <Briefcase size={12} /> QA Projects
                </Link>
              </li>
              <li>
                <Link href="/test-cases" className="hover:text-white transition flex items-center gap-1.5">
                  <ClipboardList size={12} /> Test Cases Suite
                </Link>
              </li>
              <li>
                <Link href="/my-learning" className="hover:text-white transition flex items-center gap-1.5">
                  <GraduationCap size={12} /> My Learning
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Tools & Resources */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Engineering
            </h3>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--text-muted, #94A3B8)' }}>
              <li>
                <Link href="/notes" className="hover:text-white transition flex items-center gap-1.5">
                  <FileText size={12} /> QA-Notes Studio
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition flex items-center gap-1.5">
                  <User size={12} /> Instructor Profile
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition flex items-center gap-1.5">
                  <Mail size={12} /> Contact &amp; Support
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-white transition flex items-center gap-1.5">
                  <Shield size={12} /> Admin Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Release & Version Badge */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Release Status
            </h3>
            <div
              className="p-3.5 rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--bg-card, #151C2F)',
                borderColor: 'var(--border-color, #1E293B)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400">Live &amp; Synchronized</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted, #94A3B8)' }}>
                MongoDB Atlas connected with automated CI regression triggers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── LOWER FOOTER: MANDATORY BRANDING ──────────────────────────── */}
      <div
        className="border-t py-6 px-4 sm:px-6 lg:px-8 transition-colors duration-200"
        style={{
          backgroundColor: 'var(--bg-main, #0B1020)',
          borderColor: 'var(--border-color, #1E293B)',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Main User Requested Branding */}
          <div className="flex items-center gap-2 font-bold tracking-tight text-center sm:text-left">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] sm:text-xs"
              style={{
                backgroundColor: 'var(--bg-card, #151C2F)',
                borderColor: 'var(--border-color, #1E293B)',
                color: 'var(--color-primary, #3B82F6)',
              }}
            >
              <Sparkles size={13} />
              <span>Powered by QARP ©version 2026</span>
            </span>
          </div>

          {/* Copyright & Rights Notice */}
          <div
            className="flex items-center gap-4 text-[11px] text-center"
            style={{ color: 'var(--text-subtle, #64748B)' }}
          >
            <span>All rights reserved.</span>
            <span>•</span>
            <span>Enterprise QA Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
