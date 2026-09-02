import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Lesson from '@/models/Lesson';
import PortfolioProject from '@/models/PortfolioProject';
import User from '@/models/User';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // 1. Overall Counts
    const totalCourses = await Course.countDocuments();
    const totalLessons = await Lesson.countDocuments();
    const totalProjects = await PortfolioProject.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalCategories = await Category.countDocuments();

    // 2. Category Aggregation across Courses
    const categoryStats = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 3. Difficulty Aggregation
    const difficultyStats = await Course.aggregate([
      { $group: { _id: '$level', count: { $sum: 1 } } }
    ]);

    // 4. Recent Courses Activity
    const recentCourses = await Course.find()
      .sort({ updatedAt: -1 })
      .limit(6)
      .select('title category level price isFree updatedAt createdAt')
      .lean();

    return NextResponse.json({
      overview: {
        totalCourses,
        totalLessons,
        totalProjects,
        totalUsers,
        totalCategories,
      },
      categoryStats: categoryStats.map(c => ({ category: c._id || 'QA Automation', count: c.count })),
      difficultyStats: difficultyStats.map(d => ({ level: d._id || 'Beginner', count: d.count })),
      recentActivity: JSON.parse(JSON.stringify(recentCourses))
    });
  } catch (error) {
    console.error('GET /api/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
