import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Lesson from '@/models/Lesson';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const lesson = await Lesson.findById(id).lean();
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }
    return NextResponse.json({
      ...lesson,
      _id: lesson._id.toString(),
      accessType: lesson.accessType ?? (lesson.isPaid ? 'PAID' : 'FREE'),
      isPaid: lesson.isPaid ?? false,
      freePreview: lesson.freePreview ?? true,
      sectionTitle: lesson.sectionTitle ?? 'Section 1: Introduction',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '403 Forbidden - Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const updated = await Lesson.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json(updated.toJSON());
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '403 Forbidden - Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { id } = await params;
    const deleted = await Lesson.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}