import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    await connectDB();
    const course = await Course.findById(resolvedParams.id).lean();
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    return NextResponse.json({ ...course, _id: course._id.toString() });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '403 Forbidden' }, { status: 403 });
    }
    const resolvedParams = await Promise.resolve(params);
    await connectDB();
    const body = await request.json();
    const updated = await Course.findByIdAndUpdate(
      resolvedParams.id,
      { ...body, isFree: Number(body.price || 0) === 0, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(updated)));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '403 Forbidden' }, { status: 403 });
    }
    const resolvedParams = await Promise.resolve(params);
    await connectDB();
    await Course.findByIdAndDelete(resolvedParams.id);
    return NextResponse.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}