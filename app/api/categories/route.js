import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();
    const cats = await Category.find().sort({ name: 1 }).lean();
    return NextResponse.json(cats.map(c => ({ ...c, _id: c._id.toString() })));
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const cat = await Category.create({
      ...body,
      slug: (body.slug || body.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    });
    return NextResponse.json(JSON.parse(JSON.stringify(cat)), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}