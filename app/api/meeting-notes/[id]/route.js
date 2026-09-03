import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import MeetingNote from '@/models/MeetingNote';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    let note = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      note = await MeetingNote.findById(id).lean();
    }

    if (!note) {
      return NextResponse.json(
        { success: false, error: 'Meeting note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error('Error fetching meeting note:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid meeting note ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const updateFields = {};
    if (body.title !== undefined) updateFields.title = body.title;
    if (body.module !== undefined) updateFields.module = body.module;
    if (body.topic !== undefined) updateFields.topic = body.topic;
    if (body.tagColor !== undefined) updateFields.tagColor = body.tagColor;
    if (body.summary !== undefined) updateFields.summary = body.summary;
    if (body.transcribe !== undefined) updateFields.transcribe = body.transcribe;
    if (body.chatHistory !== undefined) updateFields.chatHistory = body.chatHistory;

    const updated = await MeetingNote.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Meeting note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Meeting note updated successfully',
      note: updated,
    });
  } catch (error) {
    console.error('Error updating meeting note:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update note' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid meeting note ID' },
        { status: 400 }
      );
    }

    const deleted = await MeetingNote.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Meeting note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Meeting note deleted successfully',
      deletedId: id,
    });
  } catch (error) {
    console.error('Error deleting meeting note:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete note' },
      { status: 500 }
    );
  }
}
