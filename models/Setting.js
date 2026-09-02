import mongoose from "mongoose";

const ToolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: "Automation" },
    level: { type: String, default: "Expert" }
  },
  { _id: false }
);

const TimelineSchema = new mongoose.Schema(
  {
    year: { type: String, required: true },
    role: { type: String, required: true },
    company: { type: String, required: true },
    desc: { type: String, required: true }
  },
  { _id: false }
);

const SettingSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "QA RP Learner Platform" },
    tagline: { type: String, default: "Next-Generation Learning Experience" },
    supportEmail: { type: String, default: "qarajendra4893@gmail.com" },
    allowRegistration: { type: Boolean, default: true },
    defaultRole: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    requireEmailVerification: { type: Boolean, default: false },
    courseAutoEnroll: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    maxUploadSizeMB: { type: Number, default: 50 },
    theme: { type: String, default: "dark" },
    enablePublicBrowsing: { type: Boolean, default: true },
    allowUserReviews: { type: Boolean, default: true },
    instructorProfile: {
      name: { type: String, default: "QA RP (QA Lead)" },
      title: { type: String, default: "QA Automation Architect & Instructor" },
      bio: {
        type: String,
        default:
          "10+ years specializing in enterprise test automation, resilient framework design, CI/CD matrix sharding, and mentoring 10,000+ QA engineers worldwide."
      },
      avatar: {
        type: String,
        default:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80"
      },
      skills: {
        type: [String],
        default: [
          "Test Automation Architecture (POM, Hybrid, BDD)",
          "Web E2E Testing (Playwright, Selenium 4, Cypress)",
          "REST API Testing & Mocking (RestAssured, Postman, Supertest)",
          "Mobile Automation (Appium, Android & iOS)",
          "Performance & Load Testing (JMeter, k6)",
          "CI/CD Sharding & Cloud Runners (GitHub Actions, Docker, Jenkins)",
          "Defect Root-Cause Analysis & Traceability Matrices",
          "Automated Test Reporting (Allure, HTML Summaries, Slack Alerts)"
        ]
      },
      tools: {
        type: [ToolSchema],
        default: [
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
        ]
      },
      timeline: {
        type: [TimelineSchema],
        default: [
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
        ]
      },
      location: { type: String, default: "Global" },
      website: { type: String, default: "-" },
      email: { type: String, default: "qarajendra4893@gmail.com" }
    },
    paymentSettings: {
      paymentEnabled: { type: Boolean, default: true },
      commonFeeAmount: { type: Number, default: 499 },
      currency: { type: String, default: "INR" },
      currencySymbol: { type: String, default: "₹" },
      paymentType: { type: String, default: "One-time" },
      paidContentAccess: { type: String, default: "After successful payment" },
      confirmationPopup: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

SettingSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret._id = ret._id.toString();
    delete ret.__v;
    return ret;
  }
});

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
