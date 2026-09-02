import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);
    const body = await req.json();

    const updated = await Message.findByIdAndUpdate(id, body, { new: true }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(updated)));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export { PATCH as PUT };

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);
    await Message.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Message deleted', id });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
