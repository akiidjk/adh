import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getUserId, validateConfig } from '@/config';
import { decrypt } from '@/lib/session';

const publicRoutes = ['/login', '/api/health'];

export default async function proxy(req: NextRequest) {
  await validateConfig();
  const path = req.nextUrl.pathname;

  const isPublicRoute = publicRoutes.includes(path);

  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);
  const authenticated = session?.userId === (await getUserId());

  if (!isPublicRoute && !authenticated) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isPublicRoute && authenticated) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)'
};
