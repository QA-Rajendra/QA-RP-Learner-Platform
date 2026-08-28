# 🎓 QA RP Learner Platform

> **Enterprise-Grade QA Automation Training, 5-Point Learning Studio, and Portfolio Showcase Platform.**

Built with **Next.js 16 (App Router)**, **React 19**, **TailwindCSS**, **MongoDB Atlas**, and **NextAuth.js**.

---

## 🌟 Key Platform Features

- 🎓 **5-Point Interactive Lesson Player (`/learn/[courseId]/[lessonId]`)**:
  - Point 1: Architectural Notes & Best Practices Breakdown
  - Point 2: Runnable Code Snippets & CLI Terminal Command Runner
  - Point 3: Interactive Learning Objectives Progress Checklist
  - Point 4: Instant Knowledge Check Quizzes with Explanations
  - Point 5: Starter Files, PDFs, and Architecture Diagram Downloads
- 📁 **Admin Media & PDF Gallery (`/gallery`)**:
  - Drag-and-drop file uploader supporting JPG, PNG, WEBP, SVG, and PDF
  - Interactive Image Lightbox with Zoom/Rotate controls
  - Embedded PDF Viewer modal with page navigation and download
  - Role-protected administrative access guard
- ⚙️ **Admin Studio & Quick Actions (`/settings`)**:
  - 1-Click Course, Project, Category, and Video Creator Modals
  - Visual Curriculum Hierarchy Tree with Multi-Lesson Batch Mode
  - Dynamic Category Taxonomy Engine synchronized across all catalogs and filters
  - 7 Live Switchable UI Themes (Cyber Indigo, Emerald Glow, Crimson Tech, etc.)
- 💼 **QA Portfolio Projects Showcase (`/projects`)**:
  - Real-world test automation case studies (Playwright, Selenium, RestAssured, Appium)
  - Automation coverage %, defect counts, test cases, and live Allure reports
- 💳 **Paid Content Gating & UPI QR Checkout**:
  - Instant UPI QR payment modal with state persistence and unlocked lesson tracking

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router & Turbopack)
- **Frontend**: React 19, TailwindCSS, Lucide Icons, Glassmorphic UI
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: NextAuth.js (v4) with Bcrypt password encryption & Role Guards
- **Testing**: Automated end-to-end integration test suites (100% pass rate)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/QA-Rajendra/QA-RP-Learner-Platform.git
cd QA-RP-Learner-Platform
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Test Suites

```bash
# Run Master Test Orchestrator (Executes all 4 suites)
node ./scripts/run-all-tests.mjs

# Run individual suites
node ./scripts/test-all-apis.mjs
node ./scripts/test-gallery-integration.mjs
node ./scripts/test-all-modules-interop.mjs
node ./scripts/master-e2e-suite.mjs
```

---

## 👤 Author & Lead Instructor

- **QA RP / Rajendra Patil**
- **GitHub**: [@QA-Rajendra](https://github.com/QA-Rajendra)
- **Platform**: QA RP Learner Platform
