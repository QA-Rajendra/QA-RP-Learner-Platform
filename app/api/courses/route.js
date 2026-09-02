import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = {};
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const level = searchParams.get('level');
    const price = searchParams.get('price');
    const instructor = searchParams.get('instructor');

    if (search) {
      const regex = new RegExp(search, 'i');
      query['$or'] = [{ title: regex }, { instructor: regex }];
    }
    if (category) query.category = category;
    if (level) query.level = level;
    if (price === 'free') query.isFree = true;
    if (price === 'paid') query.isFree = false;
    if (instructor) query.instructor = instructor;

    const courses = await Course.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(courses.map(c => ({ ...c, _id: c._id.toString(), createdAt: c.createdAt?.toISOString(), updatedAt: c.updatedAt?.toISOString() })));
  } catch (error) {
    console.error('GET /api/courses error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '403 Forbidden' }, { status: 403 });
    }
    await connectDB();
    const body = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Course title is required' }, { status: 400 });
    }

    if (!body.code) {
      body.code = 'QA-' + (body.title || 'CRS').substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    }

    const course = await Course.create({ ...body, isFree: Number(body.price || 0) === 0 });
    return NextResponse.json(JSON.parse(JSON.stringify(course)), { status: 201 });
  } catch (error) {
    console.error('POST /api/courses error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}