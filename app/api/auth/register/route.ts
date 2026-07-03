import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const defaultUsers = [
  { name: 'candidate', email: 'candidate@example.com', password: 'candidate123', role: 'candidate' },
  { name: 'hr', email: 'hr@example.com', password: 'hr123', role: 'hr' },
  { name: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
];

const localUsers = [...defaultUsers];

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

async function seedDefaultUsers() {
  try {
    for (const defaultUser of defaultUsers) {
      const exists = await User.findOne({ $or: [{ email: defaultUser.email }, { name: defaultUser.name }] });
      if (!exists) {
        await User.create(defaultUser);
      }
    }
  } catch {
    // ignore seeding errors
  }
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
        await seedDefaultUsers();

        // Enforce admin limit
        if (role === 'admin') {
          const adminCount = await User.countDocuments({ role: 'admin' });
          if (adminCount >= 2) {
            return NextResponse.json({ success: false, error: 'Maximum number of admin accounts reached.' }, { status: 400 });
          }
        }

        // HR accounts require admin approval
        const status = role === 'hr' ? 'pending' : 'active';
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ email, name, password: hashed, role, status });
        userData = user.toObject();
        delete userData.password;
      } catch (error: any) {
        const message = error?.message?.includes('duplicate key') ? 'User already exists.' : error?.message || 'Unable to register user.';
        return NextResponse.json({ success: false, error: message }, { status: 400 });
      }
    } else {
      // local fallback: enforce admin limit and HR pending
      const normalizedEmail = email.toLowerCase();
      const exists = localUsers.some((u) => u.email.toLowerCase() === normalizedEmail || u.name.toLowerCase() === name.toLowerCase());
      if (exists) {
        return NextResponse.json({ success: false, error: 'User already exists.' }, { status: 400 });
      }
      if (role === 'admin') {
        const adminCount = localUsers.filter((u) => u.role === 'admin').length;
        if (adminCount >= 2) {
          return NextResponse.json({ success: false, error: 'Maximum number of admin accounts reached.' }, { status: 400 });
        }
      }
      const status = role === 'hr' ? 'pending' : 'active';
      const hashed = await bcrypt.hash(password, 10);
      const newUser = { name, email, password: hashed, role, status } as any;
      localUsers.push(newUser);
      userData = { name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status };
    }

    return NextResponse.json({ success: true, data: userData }, { status: 201 });
  } catch (error: any) {
    const message = error?.message === 'User already exists.' ? 'User already exists.' : error?.message || 'Unable to register user.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
