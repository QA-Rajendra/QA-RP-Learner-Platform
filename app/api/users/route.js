import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '403 Forbidden - Admin access required' }, { status: 403 });
    }

    await connectDB();
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(users.map(u => ({ ...u, _id: u._id.toString(), password: undefined })));
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: '403 Forbidden' }, { status: 403 });
    await connectDB();
    const body = await request.json();
    const user = await User.create(body);
    return NextResponse.json(user.toJSON(), { status: 201 });
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 500 }); }
}