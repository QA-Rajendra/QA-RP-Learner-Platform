import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const courseId = searchParams.get('courseId');
    const query = {};
    if (userId) query.userId = userId;
    if (courseId) query.courseId = courseId;
    const enrollments = await Enrollment.find(query).sort({ enrolledAt: -1 }).lean();
    return NextResponse.json(enrollments.map(e => ({ ...e, _id: e._id.toString() })));
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: '401 Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await request.json();
    const existing = await Enrollment.findOne({ userId: body.userId, courseId: body.courseId });
    if (existing) return NextResponse.json({ error: 'User is already enrolled in this course.' }, { status: 409 });
    const enrollment = await Enrollment.create({ ...body, progress: 0, status: 'In Progress', enrolledAt: new Date() });
    return NextResponse.json(enrollment.toJSON(), { status: 201 });
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}