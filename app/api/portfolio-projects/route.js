import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PortfolioProject from '@/models/PortfolioProject';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    const query = { deletedAt: null };
    if (category && category !== 'All') query.category = category;
    if (status && status !== 'All') query.status = status;
    if (featured === 'true') query.featured = true;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { shortDescription: regex },
        { technologies: { $in: [regex] } },
        { tools: { $in: [regex] } },
      ];
    }

    const projects = await PortfolioProject.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json(JSON.parse(JSON.stringify(projects)));
  } catch (error) {
    console.error('GET /api/portfolio-projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Project Title is required' }, { status: 400 });
    }

    const technologies = Array.isArray(body.technologies)
      ? body.technologies
      : typeof body.technologies === 'string'
      ? body.technologies.split(',').map(s => s.trim()).filter(Boolean)
      : typeof body.tags === 'string'
      ? body.tags.split(',').map(s => s.trim()).filter(Boolean)
      : ['Playwright', 'TypeScript', 'Docker'];

    const tools = Array.isArray(body.tools)
      ? body.tools
      : typeof body.tools === 'string'
      ? body.tools.split(',').map(s => s.trim()).filter(Boolean)
      : technologies;

    const links = {
      github: body.githubUrl || body.links?.github || '',
      live: body.liveUrl || body.links?.live || '',
      demo: body.demoUrl || body.links?.demo || '',
      caseStudy: body.caseStudyUrl || body.links?.caseStudy || '',
    };

    const project = await PortfolioProject.create({
      ...body,
      technologies,
      tools,
      links,
      defectsFound: Number(body.bugsFiled ?? body.defectsFound ?? 25),
      testCases: Number(body.testCases ?? 120),
      automationCoverage: Number(body.automationCoverage ?? 85),
    });

    return NextResponse.json(JSON.parse(JSON.stringify(project)), { status: 201 });
  } catch (error) {
    console.error('POST /api/portfolio-projects error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create project' }, { status: 500 });
  }
}
