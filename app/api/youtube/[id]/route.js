import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import YouTubeVideo from '@/models/YouTubeVideo';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);
    const video = await YouTubeVideo.findById(id).lean();
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    return NextResponse.json(JSON.parse(JSON.stringify(video)));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);
    const body = await req.json();

    const updated = await YouTubeVideo.findByIdAndUpdate(id, body, { new: true }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(updated)));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);
    await YouTubeVideo.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Video removed successfully', id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
