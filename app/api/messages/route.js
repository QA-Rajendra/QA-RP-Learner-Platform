import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';

export async function GET() {
  try {
    await connectDB();
    const messages = await Message.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(messages)));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name || !body.email || !body.message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    const message = await Message.create(body);
    return NextResponse.json(JSON.parse(JSON.stringify(message)), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
