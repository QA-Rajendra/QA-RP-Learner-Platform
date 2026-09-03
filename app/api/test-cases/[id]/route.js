import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import TestCase from '@/models/TestCase';
import { parseTestCaseContent } from '@/lib/testCaseParser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    let testCase = null;
    if (mongoose.isValidObjectId(id)) {
      testCase = await TestCase.findById(id).populate('projectId', 'title category').lean();
    }
    if (!testCase) {
      testCase = await TestCase.findOne({
        $or: [{ testCaseId: id }, { scenarioId: id }],
      }).populate('projectId', 'title category').lean();
    }

    if (!testCase) {
      return NextResponse.json({ error: 'Test case not found' }, { status: 404 });
    }
    return NextResponse.json(JSON.parse(JSON.stringify(testCase)));
  } catch (error) {
    console.error('GET /api/test-cases/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch test case' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams?.id;
    const body = await req.json();

    // Re-parse steps if content was updated without explicit steps
    let updateData = { ...body };
    if (body.content && (!body.steps || body.steps.length === 0)) {
      const parsed = parseTestCaseContent(body.content, body.format || 'auto');
      updateData.steps = parsed.steps;
      if (parsed.format) updateData.format = parsed.format;
    }

    let updated = null;
    if (mongoose.isValidObjectId(id)) {
      updated = await TestCase.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).lean();
    }
    if (!updated) {
      updated = await TestCase.findOneAndUpdate(
        { $or: [{ testCaseId: id }, { scenarioId: id }] },
        updateData,
        { new: true, runValidators: true }
      ).lean();
    }

    if (!updated) {
      return NextResponse.json({ error: 'Test case not found' }, { status: 404 });
    }

    return NextResponse.json(JSON.parse(JSON.stringify(updated)));
  } catch (error) {
    console.error('PUT /api/test-cases/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update test case' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: 'Test case ID is required' }, { status: 400 });
    }

    let deleted = null;
    if (mongoose.isValidObjectId(id)) {
      deleted = await TestCase.findByIdAndDelete(id);
    }

    if (!deleted) {
      deleted = await TestCase.findOneAndDelete({
        $or: [
          { testCaseId: id },
          { scenarioId: id },
          { name: id },
        ],
      });
    }

    if (!deleted) {
      return NextResponse.json({ error: 'Test case not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Test case deleted successfully',
      id: deleted._id,
      testCaseId: deleted.testCaseId,
    });
  } catch (error) {
    console.error('DELETE /api/test-cases/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete test case' },
      { status: 500 }
    );
  }
}
