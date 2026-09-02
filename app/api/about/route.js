import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

const DEFAULT_PROFILE = {
  name: "QA RP (QA Lead)",
  title: "QA Automation Architect & Instructor",
  bio: "10+ years specializing in enterprise test automation, resilient framework design, CI/CD matrix sharding, and mentoring 10,000+ QA engineers worldwide.",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
  skills: [
    "Test Automation Architecture (POM, Hybrid, BDD)",
    "Web E2E Testing (Playwright, Selenium 4, Cypress)",
    "REST API Testing & Mocking (RestAssured, Postman, Supertest)",
    "Mobile Automation (Appium, Android & iOS)",
    "Performance & Load Testing (JMeter, k6)",
    "CI/CD Sharding & Cloud Runners (GitHub Actions, Docker, Jenkins)",
    "Defect Root-Cause Analysis & Traceability Matrices",
    "Automated Test Reporting (Allure, HTML Summaries, Slack Alerts)"
  ],
  tools: [
    { name: "Playwright", category: "Web & API", level: "Expert" },
    { name: "Selenium WebDriver", category: "Web Automation", level: "Expert" },
    { name: "Java / TypeScript / JS", category: "Programming", level: "Expert" },
    { name: "RestAssured", category: "API Testing", level: "Expert" },
    { name: "Postman", category: "API Testing", level: "Advanced" },
    { name: "Docker", category: "DevOps", level: "Advanced" },
    { name: "GitHub Actions", category: "CI/CD Pipelines", level: "Expert" },
    { name: "JMeter", category: "Performance", level: "Advanced" },
    { name: "MongoDB / SQL", category: "Database Testing", level: "Advanced" },
    { name: "Appium", category: "Mobile Automation", level: "Advanced" }
  ],
  timeline: [
    {
      year: "2023 – Present",
      role: "Lead QA Automation Architect",
      company: "Enterprise FinTech & SaaS",
      desc: "Architected Playwright & Selenium hybrid frameworks with matrix sharding, slashing test execution time by 75% across 200+ microservices."
    },
    {
      year: "2021 – 2023",
      role: "Senior QA Automation Engineer",
      company: "E-Commerce Platform",
      desc: "Designed end-to-end checkout regression suites and API contract validation engines with automated Slack defect triaging."
    },
    {
      year: "2019 – 2021",
      role: "QA Engineer",
      company: "Software Solutions",
      desc: "Built core functional test suites, automated regression testing with Selenium & Java, and maintained defect repositories."
    }
  ],
  location: "Global",
  website: "-",
  email: "qarajendra4893@gmail.com"
};

export async function GET() {
  try {
    await connectDB();
    let setting = await Setting.findOne().lean();
    if (!setting) {
      setting = await Setting.create({ instructorProfile: DEFAULT_PROFILE });
      setting = setting.toJSON();
    }
    const profile = setting.instructorProfile || DEFAULT_PROFILE;
    return NextResponse.json(profile);
  } catch (error) {
    console.error('GET /api/about error:', error);
    return NextResponse.json(DEFAULT_PROFILE);
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '403 Forbidden - Admin access required' }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();

    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({ instructorProfile: { ...DEFAULT_PROFILE, ...body } });
    } else {
      setting.instructorProfile = {
        ...(setting.instructorProfile?.toObject ? setting.instructorProfile.toObject() : setting.instructorProfile),
        ...body
      };
      await setting.save();
    }

    return NextResponse.json(setting.instructorProfile);
  } catch (error) {
    console.error('PUT /api/about error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
