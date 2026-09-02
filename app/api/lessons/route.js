import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Lesson from '@/models/Lesson';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const query = courseId ? { courseId } : {};
    const lessons = await Lesson.find(query).sort({ order: 1 }).lean();
    // Normalize legacy lessons that may not have accessType/isPaid fields
    const normalized = lessons.map(l => ({
      ...l,
      _id: l._id.toString(),
      accessType: l.accessType ?? (l.isPaid ? 'PAID' : 'FREE'),
      isPaid: l.isPaid ?? false,
      freePreview: l.freePreview ?? true,
      sectionTitle: l.sectionTitle ?? 'Section 1: Introduction',
    }));
    return NextResponse.json(normalized);
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: '403 Forbidden' }, { status: 403 });
    await connectDB();
    const body = await request.json();
    const lesson = await Lesson.create(body);
    return NextResponse.json(lesson.toJSON(), { status: 201 });
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}