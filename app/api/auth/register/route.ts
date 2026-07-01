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

function registerLocalUser(email: string, name: string, password: string, role: string) {
  const normalizedEmail = normalizeValue(email);
  const normalizedName = normalizeValue(name);
  const exists = localUsers.some(
    (user) => user.email.toLowerCase() === normalizedEmail || user.name.toLowerCase() === normalizedName
  );
  if (exists) {
    throw new Error('User already exists.');
  }
  const newUser = { name, email, password, role };
  localUsers.push(newUser);
  return { name: newUser.name, email: newUser.email, role: newUser.role };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim();
    const name = String(body.name || '').trim();
    const password = String(body.password || '');
    const role = String(body.role || '').trim();

    if (!email || !name || !password || !role) {
      return NextResponse.json({ success: false, error: 'Missing registration fields.' }, { status: 400 });
    }

    let useLocalAuth = !process.env.MONGODB_URI;
    let userData: any;

    if (!useLocalAuth) {
      try {
        await connectDB();
      } catch {
        useLocalAuth = true;
      }
    }

    if (useLocalAuth) {
      userData = registerLocalUser(email, name, password, role);
    } else {
      const user = await User.create({ email, name, password, role });
      userData = user.toObject();
      delete userData.password;
    }

    return NextResponse.json({ success: true, data: userData }, { status: 201 });
  } catch (error: any) {
    const message = error?.message === 'User already exists.' ? 'User already exists.' : error?.message || 'Unable to register user.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
