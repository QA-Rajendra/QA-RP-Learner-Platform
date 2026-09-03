import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import PortfolioProject from '@/models/PortfolioProject';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);

    let project = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      project = await PortfolioProject.findById(id).lean();
    }
    if (!project) {
      project = await PortfolioProject.findOne({ slug: id }).lean();
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(project)));
  } catch (error) {
    console.error('GET /api/portfolio-projects/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '403 Forbidden - Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { id } = await Promise.resolve(params);
    const body = await req.json();

    const updated = await PortfolioProject.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(updated)));
  } catch (error) {
    console.error('PUT /api/portfolio-projects/[id] error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: '403 Forbidden - Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { id } = await Promise.resolve(params);
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      await PortfolioProject.findByIdAndDelete(id);
    } else {
      await PortfolioProject.findByIdAndUpdate(id, { deletedAt: new Date(), status: 'Archived' });
    }

    return NextResponse.json({ message: 'Project removed successfully', id });
  } catch (error) {
    console.error('DELETE /api/portfolio-projects/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
