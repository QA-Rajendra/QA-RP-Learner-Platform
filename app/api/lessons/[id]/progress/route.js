import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LessonProgress from '@/models/LessonProgress';
import Lesson from '@/models/Lesson';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id: lessonId } = await Promise.resolve(params);
    const body = await req.json();
    let { userId = 'user_demo_1', courseId, completed = true } = body;

    if (!courseId) {
      const l = await Lesson.findById(lessonId).lean();
      if (l) courseId = l.courseId;
    }

    if (!courseId) {
      return NextResponse.json({ error: 'courseId could not be resolved' }, { status: 400 });
    }

    // 1. Upsert Lesson Progress
    const progressDoc = await LessonProgress.findOneAndUpdate(
      { userId, courseId, lessonId },
      {
        userId,
        courseId,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
        lastAccessedAt: new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    );

    // 2. Compute live course progress
    const totalLessons = await Lesson.countDocuments({ courseId, status: 'Published' });
    const completedDocs = await LessonProgress.find({ userId, courseId, completed: true }).lean();
    const completedLessonIds = completedDocs.map(d => d.lessonId);
    const completedCount = completedLessonIds.length;
    const progressPct = totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

    // 3. Update Enrollment
    const course = await Course.findById(courseId).lean();
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId, courseId },
      {
        userId,
        courseId,
        courseTitle: course?.title || 'QA Course',
        courseThumbnail: course?.thumbnail || '',
        progress: progressPct,
        completedLessons: completedLessonIds,
        totalLessons,
        lastLessonId: lessonId,
        status: progressPct >= 100 ? 'Completed' : 'In Progress',
        completedAt: progressPct >= 100 ? new Date() : null,
      },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({
      lessonProgress: progressDoc,
      courseProgress: progressPct,
      completedCount,
      totalLessons,
      enrollment,
    });
  } catch (error) {
    console.error('POST /api/lessons/[id]/progress error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update progress' }, { status: 500 });
  }
}
