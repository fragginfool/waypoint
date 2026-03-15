import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const pathParams = await params;

    // Prevent directory traversal attacks
    const safePath = pathParams.path.join('/');
    if (safePath.includes('..') || safePath.startsWith('/')) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, safePath);

    // Ensure the resolved path is actually inside the upload directory
    if (!filePath.startsWith(uploadDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const data = await readFile(filePath);

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return new NextResponse('File not found', { status: 404 });
  }
}
