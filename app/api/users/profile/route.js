import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    await connectDB();

    let user;
    if (session?.user?.email) {
      user = await User.findOne({ email: session.user.email }).lean();
    } else {
      // Return default learner profile if visitor/guest
      user = await User.findOne({ role: { $in: ['USER', 'STUDENT'] } }).lean() || await User.findOne().lean();
    }

    if (!user) {
      return NextResponse.json({
        name: 'Guest Learner',
        email: 'guest@qarp.io',
        role: 'STUDENT',
        designation: 'QA Learner'
      });
    }

    return NextResponse.json({ ...user, _id: user._id.toString(), password: undefined });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    await connectDB();
    const body = await request.json();

    let query = {};
    if (session?.user?.email) {
      query = { email: session.user.email };
    } else if (body.email) {
      query = { email: body.email };
    } else {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Protect role modification on self-profile endpoint unless admin
    if (session?.user?.role !== 'ADMIN') {
      delete body.role;
      delete body.status;
    }

    const updatedUser = await User.findOneAndUpdate(
      query,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser.toJSON());
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
