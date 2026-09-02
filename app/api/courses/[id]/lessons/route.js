import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import Course from '@/models/Course';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id: courseId } = await Promise.resolve(params);

    const lessons = await Lesson.find({ courseId }).sort({ order: 1, lessonNumber: 1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(lessons)));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await connectDB();
    const { id: courseId } = await Promise.resolve(params);
    const body = await req.json();

    const course = await Course.findById(courseId).lean();
    const courseTitle = course?.title || 'QA Course';

    const lessonList = Array.isArray(body) ? body : Array.isArray(body.lessons) ? body.lessons : [body];
    
    const validLessons = lessonList.filter(l => l && l.title && l.title.trim());
    if (validLessons.length === 0) {
      return NextResponse.json({ error: 'At least one lesson title is required' }, { status: 400 });
    }

    const createdLessons = [];
    const currentCount = await Lesson.countDocuments({ courseId });

    for (let i = 0; i < validLessons.length; i++) {
      const item = validLessons[i];
      const lessonDoc = await Lesson.create({
        ...item,
        courseId,
        courseTitle,
        order: currentCount + i + 1,
        lessonNumber: currentCount + i + 1,
        accessType: item.accessType || (item.isPaid ? 'PAID' : 'FREE'),
        isPaid: item.accessType === 'PAID' || !!item.isPaid,
        freePreview: item.accessType === 'FREE' || item.freePreview !== false,
      });
      createdLessons.push(lessonDoc.toJSON());
    }

    // Update lessons count on course
    const totalCount = await Lesson.countDocuments({ courseId });
    await Course.findByIdAndUpdate(courseId, { lessonsCount: totalCount });

    return NextResponse.json(
      Array.isArray(body) || Array.isArray(body.lessons) ? createdLessons : createdLessons[0],
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
