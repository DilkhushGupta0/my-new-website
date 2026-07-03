import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const COOKIE_NAME = 'zenzi_session';

export function createSessionCookie(response: NextResponse, payload: Record<string, any>) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export function getTokenFromRequest(request: NextRequest) {
  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }

  const cookie = request.cookies.get(COOKIE_NAME);
  return cookie?.value || null;
}

export function verifyAuthToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as Record<string, any>;
  } catch {
    return null;
  }
}

export function getAuthFromRequest(request: NextRequest) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyAuthToken(token);
}

export function requireAdmin(request: NextRequest) {
  const payload = getAuthFromRequest(request);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
