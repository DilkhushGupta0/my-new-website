import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

const localUsers = [
  { name: 'candidate', email: 'candidate@example.com', password: 'candidate123', role: 'candidate' },
  { name: 'hr', email: 'hr@example.com', password: 'hr123', role: 'hr' },
  { name: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
];

function normalizeValue(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

function findLocalUser(username: string, password: string, role: string) {
  return localUsers.find(
    (user) => (user.email.toLowerCase() === username || user.name.toLowerCase() === username) && user.password === password && user.role === role
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = normalizeValue(body.username);
    const password = String(body.password || '');
    const role = normalizeValue(body.role);

    if (!username || !password || !role) {
      return NextResponse.json({ success: false, error: 'Missing username, password, or role.' }, { status: 400 });
    }

    let useLocalAuth = !process.env.MONGODB_URI;
    let userData: any = null;

    if (!useLocalAuth) {
      try {
        await connectDB();
      } catch {
        useLocalAuth = true;
      }
    }

    if (useLocalAuth) {
      const localUser = findLocalUser(username, password, role);
      if (!localUser) {
        return NextResponse.json({ success: false, error: 'Invalid credentials or role.' }, { status: 401 });
      }
      userData = { name: localUser.name, email: localUser.email, role: localUser.role };
    } else {
      const user = await User.findOne({ $or: [{ email: username }, { name: username }] });
      if (!user || user.password !== password || user.role !== role) {
        return NextResponse.json({ success: false, error: 'Invalid credentials or role.' }, { status: 401 });
      }
      userData = user.toObject();
      delete userData.password;
    }

    return NextResponse.json({ success: true, data: userData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Login failed.' }, { status: 500 });
  }
}
