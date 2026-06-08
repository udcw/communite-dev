import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map<string, { count: number; resetTime: number }>();

export function proxy(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  const record = rateLimit.get(ip);
  
  if (record) {
    if (now > record.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
      return null;
    }
    
    if (record.count >= maxRequests) {
      return new NextResponse('Trop de requêtes. Attendez une minute.', { status: 429 });
    }
    
    record.count++;
    rateLimit.set(ip, record);
  } else {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
  }
  
  return null;
}

export const config = {
  matcher: '/api/:path*',
};