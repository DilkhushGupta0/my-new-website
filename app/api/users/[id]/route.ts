import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const user = await User.findById(id, '-password');
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const user = await User.findByIdAndUpdate(id, body, { new: true, select: '-password' });
    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    await User.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const action = String(body.action || '').trim();
    // Protect approve action: require Authorization: Bearer <jwt> and admin role
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    if (action === 'approve') {
      if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      try {
        const jwt = (await import('jsonwebtoken')).default;
        const secret = process.env.JWT_SECRET || 'devsecret';
        const decoded: any = jwt.verify(token, secret);
        if (!decoded || decoded.role !== 'admin') {
          return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
        }
      } catch (e) {
        return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
      }

      const user = await User.findByIdAndUpdate(id, { status: 'active' }, { new: true, select: '-password' });
      return NextResponse.json({ success: true, data: user });
    }
    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
