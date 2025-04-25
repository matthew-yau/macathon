// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Get the current path
  const path = req.nextUrl.pathname;
  
  // Check if session exists
  const { data: { session } } = await supabase.auth.getSession();
  
  // Define protected routes - add additional routes as needed
  const protectedRoutes = ['/', '/supa'];
  
  // Define auth routes
  const authRoutes = ['/login', '/register'];
  
  // If accessing a protected route without a session, redirect to login
  if (protectedRoutes.includes(path) && !session) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // If accessing auth routes with a session, redirect to home
  if (authRoutes.includes(path) && session) {
    const redirectUrl = new URL('/', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

export const config = {
  matcher: ['/', '/supa', '/login', '/register']
};