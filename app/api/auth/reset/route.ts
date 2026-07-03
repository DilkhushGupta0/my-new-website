import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const token = String(body.token || '').trim();
    const otp = String(body.otp || '').trim();
    const newPassword = String(body.newPassword || '');
    if (!newPassword || (!token && !otp) || !email) return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });

    await connectDB();
    const user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const now = new Date();
    if (token) {
      if (!user.resetToken || user.resetToken !== token || !user.resetExpires || user.resetExpires < now) {
        return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 400 });
      }
    } else if (otp) {
      if (!user.phoneOTP || user.phoneOTP !== otp || !user.phoneOTPExpires || user.phoneOTPExpires < now) {
        return NextResponse.json({ success: false, error: 'Invalid or expired OTP' }, { status: 400 });
      }
    }

    user.password = newPassword;
    user.resetToken = undefined as any;
    user.resetExpires = undefined as any;
    user.phoneOTP = undefined as any;
    user.phoneOTPExpires = undefined as any;
    await user.save();

    return NextResponse.json({ success: true, message: 'Password reset successful' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unable to reset password' }, { status: 500 });
  }
}
