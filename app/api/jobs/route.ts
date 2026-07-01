import { connectDB } from '@/lib/db';
import { Job } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

const localJobs: Array<any> = [
  {
    _id: 'job-1',
    title: 'Senior Product Designer',
    company: 'Zenzi Works',
    location: 'Mumbai, India',
    type: 'Full-time',
    salary: '₹16L - ₹20L',
    description: 'Design compelling user experiences for web and mobile products.',
    tags: ['Design', 'Product', 'Remote'],
    postedBy: 'system',
  },
  {
    _id: 'job-2',
    title: 'HR Business Partner',
    company: 'TalentBridge',
    location: 'Bengaluru, India',
    type: 'Full-time',
    salary: '₹10L - ₹13L',
    description: 'Partner with business leaders to hire talent and manage performance.',
    tags: ['HR', 'People Ops', 'Hybrid'],
    postedBy: 'system',
  },
];

function normalizeJob(job: any) {
  return {
    ...job,
    _id: job._id?.toString?.() || job._id,
    postedBy: job.postedBy?.toString?.() || job.postedBy,
  };
}

export async function GET() {
  try {
    let useLocalData = !process.env.MONGODB_URI;
    let jobs: any[] = [];

    if (!useLocalData) {
      try {
        await connectDB();
      } catch {
        useLocalData = true;
      }
    }

    if (useLocalData) {
      jobs = localJobs.map(normalizeJob);
    } else {
      jobs = (await Job.find().populate('postedBy', 'name email')).map(normalizeJob);
    }

    return NextResponse.json({ success: true, data: jobs });
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
      const newJob = { ...body, _id: `job-${Date.now()}`, postedBy: body.postedBy || 'system' };
      localJobs.unshift(newJob);
      return NextResponse.json({ success: true, data: normalizeJob(newJob) }, { status: 201 });
    }

    const job = await Job.create(body);
    return NextResponse.json({ success: true, data: normalizeJob(job) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
