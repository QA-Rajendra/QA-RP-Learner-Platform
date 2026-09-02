import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import YouTubeVideo from '@/models/YouTubeVideo';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const query = {};
    if (category && category !== 'All') query.category = category;
    if (featured === 'true') query.featured = true;

    const videos = await YouTubeVideo.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(videos)));
  } catch (error) {
    console.error('GET /api/youtube error:', error);
    return NextResponse.json({ error: 'Failed to fetch YouTube videos' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.title || !body.youtubeUrl) {
      return NextResponse.json({ error: 'Video Title and YouTube URL are required' }, { status: 400 });
    }

    const video = await YouTubeVideo.create(body);
    return NextResponse.json(JSON.parse(JSON.stringify(video)), { status: 201 });
  } catch (error) {
    console.error('POST /api/youtube error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add video' }, { status: 500 });
  }
}
