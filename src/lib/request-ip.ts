import type { NextRequest } from 'next/server';

export const requestIp = (req: NextRequest) => {
  const ip =
    req.ip ||
    req.headers.get('x-client-ip') ||
    req.headers.get('x-forwarded-for') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('true-client-ip') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded') ||
    req.headers.get('forwarded-for') ||
    req.headers.get('forwarded') ||
    '127.0.0.1';

  return ip;
};
