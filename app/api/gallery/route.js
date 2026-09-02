import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/mongodb';
import MediaFile from '@/models/MediaFile';

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const q = searchParams.get('q') || '';
    const fileType = searchParams.get('type') || 'all';
    const category = searchParams.get('category') || 'all';
    const sort = searchParams.get('sort') || 'newest';

    const filter = {};

    if (fileType && fileType !== 'all') {
      filter.fileType = fileType;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (q.trim()) {
      const regex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { name: regex },
        { originalName: regex },
        { description: regex },
        { category: regex },
        { tags: regex },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    else if (sort === 'name_asc') sortObj = { name: 1 };
    else if (sort === 'name_desc') sortObj = { name: -1 };
    else if (sort === 'size_desc') sortObj = { size: -1 };
    else if (sort === 'size_asc') sortObj = { size: 1 };

    const files = await MediaFile.find(filter).sort(sortObj).lean();

    // Aggregations for counts and categories
    const allFiles = await MediaFile.find().select('fileType category').lean();
    const totalCount = allFiles.length;
    const imageCount = allFiles.filter(f => f.fileType === 'image').length;
    const pdfCount = allFiles.filter(f => f.fileType === 'pdf').length;
    const categories = Array.from(new Set(allFiles.map(f => f.category).filter(Boolean)));

    return NextResponse.json({
      files: JSON.parse(JSON.stringify(files)),
      total: files.length,
      overview: {
        total: totalCount,
        images: imageCount,
        pdfs: pdfCount,
        categories,
      }
    });
  } catch (error) {
    console.error('GET /api/gallery error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const formData = await req.formData();

    const files = formData.getAll('files');
    const singleFile = formData.get('file');
    const fileList = files && files.length > 0 ? files : singleFile ? [singleFile] : [];

    if (fileList.length === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const customName = formData.get('name') || '';
    const category = formData.get('category') || 'General Assets';
    const description = formData.get('description') || '';
    const tagsRaw = formData.get('tags') || '';
    const tags = typeof tagsRaw === 'string'
      ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
      : Array.isArray(tagsRaw) ? tagsRaw : [];

    const createdRecords = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file || typeof file.arrayBuffer !== 'function') continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const timestamp = Date.now() + i;
      const originalName = file.name || `file_${timestamp}`;
      const ext = path.extname(originalName).toLowerCase();
      const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${timestamp}_${baseName}${ext}`;

      let fileUrl = '';
      let savedToDisk = false;

      // Try local filesystem write if not on serverless environment
      if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
        try {
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          await mkdir(uploadDir, { recursive: true });
          const filepath = path.join(uploadDir, filename);
          await writeFile(filepath, buffer);
          fileUrl = `/uploads/${filename}`;
          savedToDisk = true;
        } catch (fsErr) {
          console.warn('Filesystem write failed in gallery upload, falling back to Base64:', fsErr.message);
        }
      }

      // Serverless fallback: convert to base64 Data URI
      if (!savedToDisk) {
        const mime = file.type || (ext === '.pdf' ? 'application/pdf' : 'application/octet-stream');
        fileUrl = `data:${mime};base64,${buffer.toString('base64')}`;
      }

      const isPdf = ext === '.pdf' || file.type === 'application/pdf';
      const isImg = ext.match(/\.(png|jpg|jpeg|webp|svg|gif|avif)$/i) || file.type?.startsWith('image/');
      const fileType = isPdf ? 'pdf' : isImg ? 'image' : 'document';

      const displayName = customName && fileList.length === 1
        ? customName
        : originalName.replace(ext, '').replace(/[-_]/g, ' ');

      const mediaRecord = await MediaFile.create({
        name: displayName,
        originalName,
        url: fileUrl,
        fileType,
        mimeType: file.type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
        size: buffer.length,
        sizeFormatted: formatBytes(buffer.length),
        category: category.trim(),
        description: description.trim(),
        tags,
      });

      createdRecords.push(mediaRecord.toJSON());
    }

    return NextResponse.json(
      fileList.length === 1 ? createdRecords[0] : { success: true, count: createdRecords.length, files: createdRecords },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/gallery error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
