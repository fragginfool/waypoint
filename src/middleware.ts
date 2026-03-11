import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add paths that don't require authentication here
const publicPaths = ['/login', '/register', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files, api routes (unless specified), Next.js internals
  if (
    pathname.includes('.') || 
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;
  const isPublicPath = publicPaths.includes(pathname);

  // If user is not authenticated and trying to access a protected route
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    // Optionally save the return url to redirect back after login
    // loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access login/register pages
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|uploads).*)',
  ],
};
