import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

async function sendEmail(to: string, subject: string, text: string) {
  // Best-effort: use env SMTP if available, otherwise console.log
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.log('[auth/forgot] sendEmail (fallback):', { to, subject, text });
    return;
  }
    try {
      // lazy-require nodemailer to avoid bundler static analysis
      const req: any = eval('require');
      const nodemailer = req('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Boolean(process.env.SMTP_SECURE === 'true'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text });
    } catch (e) {
      console.log('[auth/forgot] sendEmail error:', e);
    }
}

async function sendSMS(phone: string, text: string) {
  if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
    try {
      const req: any = eval('require');
      const twilioLib = req('twilio');
      const twilio = twilioLib(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
      await twilio.messages.create({ body: text, from: process.env.TWILIO_FROM, to: phone });
      return;
    } catch (e) {
      console.log('[auth/forgot] sendSMS error:', e);
    }
  }
  console.log('[auth/forgot] sendSMS (fallback):', { phone, text });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    if (!email && !phone) return NextResponse.json({ success: false, error: 'Provide email or phone' }, { status: 400 });

    await connectDB();
    let user = null;
    if (email) user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
    if (!user && phone) user = await User.findOne({ phone });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const otpExpires = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
    const resetExpires = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

    user.phoneOTP = otp;
    user.phoneOTPExpires = otpExpires;
    user.resetToken = token;
    user.resetExpires = resetExpires;
    await user.save();

    if (user.email) {
      await sendEmail(user.email, 'Password reset for Zenzi Consultancy', `Use this link or code to reset your password. Code: ${otp} Token: ${token}`);
    }
    if (user.phone) {
      await sendSMS(user.phone, `Your Zenzi reset code: ${otp}`);
    }

    return NextResponse.json({ success: true, message: 'Reset instructions sent' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Unable to process request' }, { status: 500 });
  }
}
