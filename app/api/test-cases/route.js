import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import TestCase from '@/models/TestCase';
import PortfolioProject from '@/models/PortfolioProject';
import { parseTestCaseContent } from '@/lib/testCaseParser';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const moduleName = searchParams.get('module');
    const suite = searchParams.get('suite');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const projectId = searchParams.get('projectId');
    const search = searchParams.get('search');

    const query = {};
    if (moduleName && moduleName !== 'All') query.module = moduleName;
    if (suite && suite !== 'All') query.suite = suite;
    if (priority && priority !== 'All') query.priority = priority;
    if (type && type !== 'All') query.type = type;
    if (status && status !== 'All') query.status = status;
    if (projectId && projectId !== 'All') query.projectId = projectId;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { testCaseId: regex },
        { scenarioId: regex },
        { module: regex },
        { suite: regex },
        { description: regex },
        { content: regex },
      ];
    }

    const testCases = await TestCase.find(query)
      .populate('projectId', 'title category')
      .sort({ createdAt: -1 })
      .lean();

    // Module statistics
    const allCases = await TestCase.find({}).select('module suite priority type status').lean();
    const stats = {
      total: allCases.length,
      highPriority: allCases.filter(c => c.priority === 'High' || c.priority === 'Critical').length,
      positiveCount: allCases.filter(c => c.type === 'Positive').length,
      negativeCount: allCases.filter(c => c.type === 'Negative').length,
      automatedCount: allCases.filter(c => c.status === 'Automated').length,
    };

    return NextResponse.json({ testCases: JSON.parse(JSON.stringify(testCases)), stats });
  } catch (error) {
    console.error('GET /api/test-cases error:', error);
    return NextResponse.json({ error: 'Failed to fetch test cases' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const isBatch = Array.isArray(body) || (body.testCases && Array.isArray(body.testCases));
    const items = isBatch ? (Array.isArray(body) ? body : body.testCases) : [body];

    if (items.length === 0) {
      return NextResponse.json({ error: 'No test cases provided' }, { status: 400 });
    }

    const createdList = [];

    for (const item of items) {
      const moduleName = item.module?.trim() || 'Login';
      const suiteName = item.suite?.trim() || (body.suite?.trim() || '');
      const name = item.name?.trim();
      if (!name) continue;

      let testCaseId = item.testCaseId?.trim();
      if (!testCaseId) {
        const sanitizedModule = moduleName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'GEN';
        const count = await TestCase.countDocuments({ module: new RegExp(`^${moduleName}$`, 'i') });
        const nextNum = String(count + createdList.length + 1).padStart(3, '0');
        testCaseId = `TC-${sanitizedModule}-${nextNum}`;
      }

      let scenarioId = item.scenarioId?.trim();
      if (!scenarioId) {
        const sanitizedModule = moduleName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'GEN';
        scenarioId = `TS-${sanitizedModule}-001`;
      }

      let steps = Array.isArray(item.steps) && item.steps.length > 0 ? item.steps : [];
      let detectedFormat = item.format || 'structured';

      if (steps.length === 0 && item.content && item.content.trim()) {
        const parsed = parseTestCaseContent(item.content, item.format || 'auto');
        steps = parsed.steps;
        if (parsed.format) detectedFormat = parsed.format;
      }

      if (steps.length === 0) {
        steps = [
          {
            stepNumber: 1,
            action: `Verify ${name}`,
            testData: 'Valid Inputs',
            expectedResult: `${name} succeeds as expected`,
            status: 'Not Run',
          },
        ];
      }

      const existing = await TestCase.findOne({ testCaseId });
      if (existing) {
        testCaseId = `${testCaseId}-${Math.floor(100 + Math.random() * 900)}`;
      }

      const newTestCase = await TestCase.create({
        module: moduleName,
        suite: suiteName,
        scenarioId,
        testCaseId,
        name,
        priority: item.priority || 'High',
        type: item.type || 'Positive',
        description: item.description || '',
        content: item.content || '',
        format: detectedFormat,
        steps,
        preconditions: item.preconditions || '',
        postconditions: item.postconditions || '',
        projectId: item.projectId || null,
        status: item.status || 'Ready',
        author: item.author || 'QA RP Lead',
        executionTime: item.executionTime || '2 mins',
        tags: Array.isArray(item.tags) ? item.tags : ['Manual', moduleName, ...(suiteName ? [`Suite: ${suiteName}`] : [])],
      });

      if (item.projectId) {
        try {
          await PortfolioProject.findByIdAndUpdate(item.projectId, {
            $inc: { testCases: 1 },
          });
        } catch (err) {
          console.warn('Failed to increment project testCases count:', err.message);
        }
      }

      createdList.push(newTestCase);
    }

    if (createdList.length === 0) {
      return NextResponse.json({ error: 'Failed to create any valid test case' }, { status: 400 });
    }

    if (isBatch) {
      return NextResponse.json(
        { success: true, count: createdList.length, testCases: JSON.parse(JSON.stringify(createdList)) },
        { status: 201 }
      );
    }

    return NextResponse.json(JSON.parse(JSON.stringify(createdList[0])), { status: 201 });
  } catch (error) {
    console.error('POST /api/test-cases error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create test case' },
      { status: 500 }
    );
  }
}

// Fallback query DELETE /api/test-cases?id=...
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Test case ID parameter is required' }, { status: 400 });
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
    console.error('DELETE /api/test-cases error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete test case' },
      { status: 500 }
    );
  }
}
