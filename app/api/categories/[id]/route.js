import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';

export async function DELETE(request, { params }) {
  try {
    const { id } = await Promise.resolve(params);
    await connectDB();
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}