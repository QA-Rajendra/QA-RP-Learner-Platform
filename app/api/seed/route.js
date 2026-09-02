import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Category from "@/models/Category";
import User from "@/models/User";

const COURSES = [
  {
    title: "[10x] [ LIVE ]Job Ready Automation Tester Blueprint with JAVA By QA RP - 10x",
    code: "QA-JAVA-10X",
    category: "Development",
    categorySlug: "development",
    instructor: "QA RP",
    lessonsCount: 230,
    duration: "16 Weeks",
    language: "English",
    level: "All levels",
    status: "Active",
    studentsCount: 1420,
    price: 0,
    originalPrice: 199.0,
    isFree: true,
    rating: 5,
    reviewsCount: 3840,
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=700&auto=format&fit=crop&q=80",
    description: "Master Java, Selenium, API Testing, Framework Design and CI/CD Pipelines to become a top 1% Job Ready Automation Tester.",
    shortDescription: "Complete Java & Automation Testing Blueprint.",
    objectives: [
      "Core Java from basics to advanced OOPs",
      "Selenium WebDriver with Page Object Model (POM)",
      "TestNG, Cucumber BDD & RestAssured API Testing",
      "Git, Jenkins, Docker & CI/CD Pipelines"
    ]
  },
  { title: "Create An LMS Website With LearnPress", code: "LMS-101", category: "Photography", categorySlug: "photography", instructor: "Determined-Poitras", lessonsCount: 20, duration: "2 Weeks", language: "English", level: "All levels", status: "Active", studentsCount: 156, price: 0, originalPrice: 29.0, isFree: true, rating: 5, reviewsCount: 1025, thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700&auto=format&fit=crop&q=80", description: "Master how to build a complete LMS from scratch.", shortDescription: "Build a full LMS with LearnPress." },
  { title: "Create An LMS Website With LearnPress", code: "LMS-102", category: "Office", categorySlug: "office", instructor: "Kenny White", lessonsCount: 20, duration: "2 Weeks", language: "English", level: "All levels", status: "Active", studentsCount: 156, price: 0, originalPrice: 29.0, isFree: true, rating: 5, reviewsCount: 1025, thumbnail: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=700&auto=format&fit=crop&q=80", description: "Enterprise office workflow automation.", shortDescription: "Enterprise office training platform." },
  { title: "Create An LMS Website With LearnPress", code: "LMS-103", category: "Commercial", categorySlug: "commercial", instructor: "John Doe", lessonsCount: 20, duration: "2 Weeks", language: "English", level: "Beginner", status: "Active", studentsCount: 156, price: 0, originalPrice: 29.0, isFree: true, rating: 4, reviewsCount: 840, thumbnail: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=700&auto=format&fit=crop&q=80", description: "Commercial LMS deployment strategies.", shortDescription: "Commercial LMS for businesses." },
  { title: "Create An LMS Website With LearnPress", code: "LMS-104", category: "Educate", categorySlug: "educate", instructor: "Emma Watson", lessonsCount: 20, duration: "2 Weeks", language: "English", level: "Intermediate", status: "Active", studentsCount: 156, price: 0, originalPrice: 29.0, isFree: true, rating: 5, reviewsCount: 1025, thumbnail: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=700&auto=format&fit=crop&q=80", description: "Educational pedagogy techniques.", shortDescription: "Education methods for instructors." },
  { title: "Advanced Photography Masterclass", code: "PHO-201", category: "Photography", categorySlug: "photography", instructor: "Sarah Connor", lessonsCount: 30, duration: "4 Weeks", language: "English", level: "Expert", status: "Active", studentsCount: 89, price: 49.99, originalPrice: 99.0, isFree: false, rating: 5, reviewsCount: 512, thumbnail: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=700&auto=format&fit=crop&q=80", description: "Advanced photography techniques.", shortDescription: "Master advanced photography." },
  { title: "UI/UX Design for Developers", code: "DES-301", category: "Design", categorySlug: "design", instructor: "Maria Garcia", lessonsCount: 25, duration: "3 Weeks", language: "English", level: "Intermediate", status: "Active", studentsCount: 203, price: 39.99, originalPrice: 79.0, isFree: false, rating: 4, reviewsCount: 340, thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=700&auto=format&fit=crop&q=80", description: "Modern UI/UX design principles.", shortDescription: "Design principles for developers." },
  { title: "React & Next.js Full Stack Bootcamp", code: "DEV-401", category: "Development", categorySlug: "development", instructor: "David Miller", lessonsCount: 45, duration: "8 Weeks", language: "English", level: "Intermediate", status: "Active", studentsCount: 412, price: 79.99, originalPrice: 149.0, isFree: false, rating: 5, reviewsCount: 890, thumbnail: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=700&auto=format&fit=crop&q=80", description: "Complete full-stack bootcamp.", shortDescription: "Full-stack React & Next.js bootcamp." },
  { title: "Digital Marketing Fundamentals", code: "MKT-501", category: "Marketing", categorySlug: "marketing", instructor: "Lisa Park", lessonsCount: 18, duration: "3 Weeks", language: "English", level: "Beginner", status: "Active", studentsCount: 167, price: 29.99, originalPrice: 59.0, isFree: false, rating: 4, reviewsCount: 225, thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&auto=format&fit=crop&q=80", description: "SEO and content strategy.", shortDescription: "Digital marketing from scratch." },
  { title: "Python for Data Science", code: "DAT-601", category: "Data Science", categorySlug: "data-science", instructor: "James Wilson", lessonsCount: 35, duration: "6 Weeks", language: "English", level: "Beginner", status: "Active", studentsCount: 534, price: 0, originalPrice: 69.0, isFree: true, rating: 5, reviewsCount: 1204, thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&auto=format&fit=crop&q=80", description: "Python for data analysis and ML.", shortDescription: "Python data science essentials." },
  { title: "Business English Communication", code: "ENG-701", category: "Language", categorySlug: "language", instructor: "Anna Thompson", lessonsCount: 22, duration: "4 Weeks", language: "English", level: "Intermediate", status: "Active", studentsCount: 298, price: 19.99, originalPrice: 49.0, isFree: false, rating: 4, reviewsCount: 445, thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=700&auto=format&fit=crop&q=80", description: "Professional English for workplace.", shortDescription: "English for business professionals." },
  { title: "Yoga & Mindfulness for Beginners", code: "HLT-801", category: "Health", categorySlug: "health", instructor: "Priya Sharma", lessonsCount: 15, duration: "2 Weeks", language: "English", level: "Beginner", status: "Active", studentsCount: 189, price: 0, originalPrice: 39.0, isFree: true, rating: 5, reviewsCount: 672, thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&auto=format&fit=crop&q=80", description: "Beginner yoga and mindfulness.", shortDescription: "Start your yoga journey today." },
];

const CATEGORIES = [
  { name: "Photography", slug: "photography", icon: "📷", coursesCount: 2 },
  { name: "Office", slug: "office", icon: "💼", coursesCount: 1 },
  { name: "Commercial", slug: "commercial", icon: "🏢", coursesCount: 1 },
  { name: "Educate", slug: "educate", icon: "🎓", coursesCount: 1 },
  { name: "Design", slug: "design", icon: "🎨", coursesCount: 1 },
  { name: "Development", slug: "development", icon: "💻", coursesCount: 1 },
  { name: "Marketing", slug: "marketing", icon: "📈", coursesCount: 1 },
  { name: "Data Science", slug: "data-science", icon: "📊", coursesCount: 1 },
  { name: "Language", slug: "language", icon: "🗣️", coursesCount: 1 },
  { name: "Health", slug: "health", icon: "🧘", coursesCount: 1 },
];

const USERS = [
  { name: "QA RP (Admin)", email: "qarajendra4893@gmail.com", password: "Patil@321", role: "ADMIN", status: "Active", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", designation: "Lead QA Automation Engineer & Platform Admin" },
  { name: "Alex Rivera", email: "user@example.com", password: "demo", role: "USER", status: "Active", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80", designation: "Enrolled Student / Learner" },
  { name: "Sophia Chang", email: "sophia@example.com", password: "demo", role: "USER", status: "Active", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", designation: "Student" },
  { name: "Kenny White", email: "kenny@example.com", password: "demo", role: "USER", status: "Active", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", designation: "Instructor" },
];

export async function POST() {
  try {
    await connectDB();
    const courseCount = await Course.countDocuments();
    const userCount = await User.countDocuments();

    if (courseCount === 0) await Course.insertMany(COURSES);
    if (await Category.countDocuments() === 0) await Category.insertMany(CATEGORIES);
    if (userCount === 0) await User.insertMany(USERS);

    return NextResponse.json({
      message: "Database seeded!",
      counts: {
        courses: await Course.countDocuments(),
        categories: await Category.countDocuments(),
        users: await User.countDocuments(),
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await connectDB();
    await Course.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});
    return NextResponse.json({ message: "Database cleared. Call POST /api/seed to re-seed." });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
