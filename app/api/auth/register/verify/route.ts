import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import { findLocalUserByEmailOrPhone, updateLocalUser } from '@/lib/localAuth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const otp = String(body.otp || '').trim();

    if ((!email && !phone) || !otp) {
      return NextResponse.json({ success: false, error: 'Provide email or phone and OTP.' }, { status: 400 });
    }

    let user: any = null;
    if (process.env.MONGODB_URI) {
      await connectDB();
      if (email) {
        user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
      }
      if (!user && phone) {
        user = await User.findOne({ phone });
      }
    } else {
      user = findLocalUserByEmailOrPhone(email, phone);
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    const now = new Date();
    if (!user.registrationOTP || user.registrationOTP !== otp || !user.registrationOTPExpires || user.registrationOTPExpires < now) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP.' }, { status: 400 });
    }

    if (user.role === 'hr') {
      user.status = 'pending';
    } else {
      user.status = 'active';
    }
    user.registrationOTP = undefined as any;
    user.registrationOTPExpires = undefined as any;
    user.verifiedEmail = Boolean(email && user.email);
    user.verifiedPhone = Boolean(phone && user.phone);

    if (process.env.MONGODB_URI) {
      await user.save();
    } else {
      updateLocalUser(user, {
        status: user.status,
        registrationOTP: undefined,
        registrationOTPExpires: undefined,
        verifiedEmail: user.verifiedEmail,
        verifiedPhone: user.verifiedPhone,
      });
    }

    return NextResponse.json({ success: true, data: { status: user.status, role: user.role }, message: user.role === 'hr' ? 'Verification complete. Your account is pending admin approval.' : 'Account verified and active. You can now log in.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unable to verify OTP.' }, { status: 500 });
  }
}
