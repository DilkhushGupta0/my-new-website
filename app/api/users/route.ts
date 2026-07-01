import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

const localUsers = [
  { _id: 'user-1', name: 'candidate', email: 'candidate@example.com', password: 'candidate123', role: 'candidate' },
  { _id: 'user-2', name: 'hr', email: 'hr@example.com', password: 'hr123', role: 'hr' },
  { _id: 'user-3', name: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
];

function serializeUser(user: any) {
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}

export async function GET() {
  try {
    let useLocalData = !process.env.MONGODB_URI;

    if (!useLocalData) {
      try {
        await connectDB();
      } catch {
        useLocalData = true;
      }
    }

    if (useLocalData) {
      return NextResponse.json({ success: true, data: localUsers.map(serializeUser) });
    }

    const users = await User.find({}, '-password');
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let useLocalData = !process.env.MONGODB_URI;

    if (!useLocalData) {
      try {
        await connectDB();
      } catch {
        useLocalData = true;
      }
    }

    if (useLocalData) {
      const exists = localUsers.some((user) => user.email === body.email || user.name === body.name);
      if (exists) {
        return NextResponse.json({ success: false, error: 'User already exists.' }, { status: 400 });
      }
      const newUser = { _id: `user-${Date.now()}`, ...body };
      localUsers.push(newUser);
      return NextResponse.json({ success: true, data: serializeUser(newUser) }, { status: 201 });
    }

    const user = await User.create(body);
    const userObject = user.toObject();
    delete userObject.password;
    return NextResponse.json({ success: true, data: userObject }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
