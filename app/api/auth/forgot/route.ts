import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

async function sendEmail(to: string, subject: string, text: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    const error = new Error('SMTP is not configured.');
    console.error('[auth/forgot] sendEmail configuration error:', error.message);
    throw error;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Boolean(process.env.SMTP_SECURE === 'true'),
      auth: { user, pass },
    });
    await transporter.sendMail({ from, to, subject, text });
  } catch (error: any) {
    console.error('[auth/forgot] sendEmail error:', error?.message || error);
    throw new Error('Failed to deliver password reset email.');
  }
}

async function sendSMS(phone: string, text: string) {
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_TOKEN;
  const from = process.env.TWILIO_FROM;

  if (!sid || !token || !from) {
    const error = new Error('Twilio is not configured.');
    console.error('[auth/forgot] sendSMS configuration error:', error.message);
    throw error;
  }

  try {
    const client = twilio(sid, token);
    await client.messages.create({ body: text, from, to: phone });
  } catch (error: any) {
    console.error('[auth/forgot] sendSMS error:', error?.message || error);
    throw new Error('Failed to deliver password reset SMS.');
  }
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
