import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Allowed MIME types and extensions
const ALLOWED_TYPES = {
  // Images
  'image/jpeg': { ext: '.jpg', type: 'image' },
  'image/png': { ext: '.png', type: 'image' },
  'image/webp': { ext: '.webp', type: 'image' },
  'image/svg+xml': { ext: '.svg', type: 'image' },
  'image/gif': { ext: '.gif', type: 'image' },
  // PDFs & Documents
  'application/pdf': { ext: '.pdf', type: 'pdf' },
  'application/zip': { ext: '.zip', type: 'zip' },
  'application/x-zip-compressed': { ext: '.zip', type: 'zip' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { ext: '.docx', type: 'document' },
  'application/msword': { ext: '.doc', type: 'document' },
  'text/plain': { ext: '.txt', type: 'document' },
  'text/javascript': { ext: '.js', type: 'code' },
  'text/typescript': { ext: '.ts', type: 'code' },
  'application/json': { ext: '.json', type: 'code' },
};

function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No valid file uploaded' }, { status: 400 });
    }

    const mimeType = file.type || '';
    const originalName = file.name || 'uploaded-file';
    const originalExt = path.extname(originalName).toLowerCase();
    
    // Determine category / fileType
    let fileCategory = 'document';
    if (mimeType.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(originalExt)) {
      fileCategory = 'image';
    } else if (mimeType === 'application/pdf' || originalExt === '.pdf') {
      fileCategory = 'pdf';
    } else if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(originalExt)) {
      fileCategory = 'zip';
    } else if (['.ts', '.js', '.jsx', '.tsx', '.py', '.java', '.json'].includes(originalExt)) {
      fileCategory = 'code';
    }

    // Check size (Max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum limit of 50MB' }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Generate safe clean unique filename
    const cleanBase = path.basename(originalName, originalExt)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);
    const timestamp = Date.now();
    const finalExt = originalExt || (ALLOWED_TYPES[mimeType] ? ALLOWED_TYPES[mimeType].ext : '.bin');
    const filename = `${timestamp}_${cleanBase}${finalExt}`;
    const filePath = path.join(uploadsDir, filename);

    // Write file to public/uploads
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    const formattedSize = formatBytes(file.size);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      name: originalName,
      size: formattedSize,
      fileType: fileCategory,
      mimeType: mimeType || 'application/octet-stream',
      filename,
    });
  } catch (error) {
    console.error('File Upload Error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
