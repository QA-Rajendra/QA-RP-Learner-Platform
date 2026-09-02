import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';

export async function GET() {
  try {
    await connectDB();
    const students = await User.find({ role: 'USER' }).sort({ createdAt: -1 }).lean();

    // Attach enrollment summary for each student
    const studentList = await Promise.all(
      students.map(async (st) => {
        const enrollments = await Enrollment.find({
          $or: [{ userId: st._id.toString() }, { userEmail: st.email }]
        }).lean();

        const completedCourses = enrollments.filter(e => e.progress >= 100).length;
        const avgProgress = enrollments.length > 0
          ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
          : 0;

        return {
          ...st,
          _id: st._id.toString(),
          enrolledCoursesCount: enrollments.length,
          completedCoursesCount: completedCourses,
          averageProgress: avgProgress,
          enrollments,
        };
      })
    );

    return NextResponse.json(JSON.parse(JSON.stringify(studentList)));
  } catch (error) {
    console.error('GET /api/students error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
