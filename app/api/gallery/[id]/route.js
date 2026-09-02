import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import MediaFile from '@/models/MediaFile';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);

    const file = await MediaFile.findById(id).lean();
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(file)));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);
    const body = await req.json();

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.tags !== undefined) {
      updateData.tags = typeof body.tags === 'string'
        ? body.tags.split(',').map(t => t.trim()).filter(Boolean)
        : Array.isArray(body.tags) ? body.tags : [];
    }

    const updated = await MediaFile.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!updated) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(updated)));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { id } = await Promise.resolve(params);

    const file = await MediaFile.findById(id);
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Try deleting file from disk storage
    if (file.url && file.url.startsWith('/uploads/')) {
      const filename = file.url.replace('/uploads/', '');
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
      try {
        await unlink(filepath);
      } catch (err) {
        // Disk unlink may fail if already removed, continue DB delete
      }
    }

    await MediaFile.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
