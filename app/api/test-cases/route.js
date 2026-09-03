import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TestCase from '@/models/TestCase';
import PortfolioProject from '@/models/PortfolioProject';
import { parseTestCaseContent } from '@/lib/testCaseParser';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const moduleName = searchParams.get('module');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const projectId = searchParams.get('projectId');
    const search = searchParams.get('search');

    const query = {};
    if (moduleName && moduleName !== 'All') query.module = moduleName;
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
        { description: regex },
        { content: regex },
      ];
    }

    const testCases = await TestCase.find(query)
      .populate('projectId', 'title category')
      .sort({ createdAt: -1 })
      .lean();

    // Module statistics
    const allCases = await TestCase.find({}).select('module priority type status').lean();
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

    const moduleName = body.module?.trim() || 'Login';
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: 'Test Case Name is required' }, { status: 400 });
    }

    // Auto-generate testCaseId if not provided or format correctly
    let testCaseId = body.testCaseId?.trim();
    if (!testCaseId) {
      const sanitizedModule = moduleName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'GEN';
      const count = await TestCase.countDocuments({ module: new RegExp(`^${moduleName}$`, 'i') });
      const nextNum = String(count + 1).padStart(3, '0');
      testCaseId = `TC-${sanitizedModule}-${nextNum}`;
    }

    // Auto-generate scenarioId if not provided
    let scenarioId = body.scenarioId?.trim();
    if (!scenarioId) {
      const sanitizedModule = moduleName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'GEN';
      scenarioId = `TS-${sanitizedModule}-001`;
    }

    // Parse content into steps if not directly passed
    let steps = Array.isArray(body.steps) && body.steps.length > 0 ? body.steps : [];
    let detectedFormat = body.format || 'structured';

    if (steps.length === 0 && body.content && body.content.trim()) {
      const parsed = parseTestCaseContent(body.content, body.format || 'auto');
      steps = parsed.steps;
      if (parsed.format) detectedFormat = parsed.format;
    }

    // If still no steps, create a baseline step
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

    // Check duplicate testCaseId and adjust if needed
    const existing = await TestCase.findOne({ testCaseId });
    if (existing) {
      testCaseId = `${testCaseId}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const newTestCase = await TestCase.create({
      module: moduleName,
      scenarioId,
      testCaseId,
      name,
      priority: body.priority || 'High',
      type: body.type || 'Positive',
      description: body.description || '',
      content: body.content || '',
      format: detectedFormat,
      steps,
      preconditions: body.preconditions || '',
      postconditions: body.postconditions || '',
      projectId: body.projectId || null,
      status: body.status || 'Ready',
      author: body.author || 'QA RP Lead',
      executionTime: body.executionTime || '2 mins',
      tags: Array.isArray(body.tags) ? body.tags : ['Manual', moduleName],
    });

    // Optionally increment project's testCases counter
    if (body.projectId) {
      try {
        await PortfolioProject.findByIdAndUpdate(body.projectId, {
          $inc: { testCases: 1 },
        });
      } catch (err) {
        console.warn('Failed to increment project testCases count:', err.message);
      }
    }

    return NextResponse.json(JSON.parse(JSON.stringify(newTestCase)), { status: 201 });
  } catch (error) {
    console.error('POST /api/test-cases error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create test case' },
      { status: 500 }
    );
  }
}
