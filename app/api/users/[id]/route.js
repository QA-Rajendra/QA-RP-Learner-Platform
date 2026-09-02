import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    await connectDB();
    const user = await User.findById(resolvedParams.id).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ ...user, _id: user._id.toString(), password: undefined });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await Promise.resolve(params);
    await connectDB();

    const body = await request.json();
    
    // Check permissions: Admin can update any user, normal user can only update themselves
    const isSelf = session?.user?.id === resolvedParams.id || session?.user?.email === body.email;
    const isAdmin = session?.user?.role === 'ADMIN';

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: '403 Forbidden' }, { status: 403 });
    }

    // Only admins can promote/demote roles or change account status
    if (!isAdmin && (body.role || body.status)) {
      delete body.role;
      delete body.status;
    }

    const updatedUser = await User.findByIdAndUpdate(
      resolvedParams.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json(updatedUser.toJSON());
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '403 Forbidden' }, { status: 403 });
    }
    const resolvedParams = await Promise.resolve(params);
    await connectDB();
    await User.findByIdAndDelete(resolvedParams.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}