import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const defaultUsers = [
  { name: 'candidate', email: 'candidate@example.com', password: 'candidate123', role: 'candidate' },
  { name: 'hr', email: 'hr@example.com', password: 'hr123', role: 'hr' },
  { name: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
];

function normalizeValue(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

function findLocalUser(username: string, password: string, role: string) {
  return defaultUsers.find(
    (user) => (user.email.toLowerCase() === username || user.name.toLowerCase() === username) && user.password === password && user.role === role
  );
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    const username = normalizeValue(body.username);
    const password = String(body.password || '');
    const role = normalizeValue(body.role);

    // Logging for debugging (username, password, role, connection and DB lookup)
    console.log('[auth/login] incoming:', { username, password: password ? '***' : '', role });

    if (!username || !password || !role) {
      return NextResponse.json({ success: false, error: 'Missing username, password, or role.' }, { status: 400 });
    }

    let useLocalAuth = !process.env.MONGODB_URI;
    let userData: any = null;

    if (!useLocalAuth) {
      try {
        const db = await connectDB();
        const readyState = (db && (db as any).connection && (db as any).connection.readyState) || null;
        console.log('[auth/login] MongoDB readyState:', readyState);
        await seedDefaultUsers();

        // Use case-insensitive exact match for email/name to avoid casing issues
        const esc = escapeRegExp(username);
        const user = await User.findOne({
          $or: [{ email: { $regex: `^${esc}$`, $options: 'i' } }, { name: { $regex: `^${esc}$`, $options: 'i' } }],
        });
        console.log('[auth/login] User.findOne result:', user ? { email: user.email, name: user.name, role: user.role } : null);

        if (!user) {
          return NextResponse.json({ success: false, error: 'Invalid credentials or role.' }, { status: 401 });
        }

        // Check account status
        const status = (user.status as unknown) as string | undefined;
        if (status && status !== 'active') {
          return NextResponse.json({ success: false, error: 'Account is not active.' }, { status: 403 });
        }

        // Normalize stored role before comparing
        const storedRole = normalizeValue((user.role as unknown) as string);
        const match = await bcrypt.compare(password, user.password);
        if (!match || storedRole !== role) {
          return NextResponse.json({ success: false, error: 'Invalid credentials or role.' }, { status: 401 });
        }

        userData = user.toObject();
        delete userData.password;
        // issue JWT for authenticated sessions
        try {
          const token = jwt.sign({ id: user._id.toString(), role: user.role, email: user.email }, process.env.JWT_SECRET || 'devsecret', {
            expiresIn: '7d',
          });
          userData.token = token;
        } catch (e) {
          // ignore token errors
        }
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
    }

    return NextResponse.json({ success: true, data: userData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Login failed.' }, { status: 500 });
  }
}
