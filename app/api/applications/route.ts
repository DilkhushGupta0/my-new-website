import { connectDB } from '@/lib/db';
import { Application } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const applications = await Application.find()
      .populate('jobId', 'title company')
      .populate('userId', 'name email');
    return NextResponse.json({ success: true, data: applications });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const application = await Application.create(body);
    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
