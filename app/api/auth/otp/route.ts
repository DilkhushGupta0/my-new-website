import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSessionCookie } from '@/lib/serverAuth';

async function sendEmail(to: string, subject: string, text: string) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.log('[auth/otp] sendEmail (fallback):', { to, subject, text });
    return;
  }
  try {
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
  } catch (error) {
    console.log('[auth/otp] sendEmail error:', error);
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
    } catch (error) {
      console.log('[auth/otp] sendSMS error:', error);
    }
  }
  console.log('[auth/otp] sendSMS (fallback):', { phone, text });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = String(body.action || 'request').trim().toLowerCase();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const role = String(body.role || '').trim().toLowerCase();
    const otp = String(body.otp || '').trim();

    if (!email && !phone) {
      return NextResponse.json({ success: false, error: 'Provide email or phone to continue.' }, { status: 400 });
    }

    await connectDB();
    let user = null;
    if (email) {
      user = await User.findOne({ email: { $regex: `^${email}$`, $options: 'i' } });
    }
    if (!user && phone) {
      user = await User.findOne({ phone });
    }
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    if (role && String(user.role).trim().toLowerCase() !== role) {
      return NextResponse.json({ success: false, error: 'Selected role does not match this account.' }, { status: 403 });
    }

    if (action === 'request') {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 5 * 60 * 1000);
      user.phoneOTP = code;
      user.phoneOTPExpires = expires;
      await user.save();

      const message = `Your Zenzi login code is ${code}. It expires in 5 minutes.`;
      if (email && user.email) {
        await sendEmail(user.email, 'Zenzi Consultancy login code', message);
      }
      if (phone && user.phone) {
        await sendSMS(user.phone, message);
      }

      return NextResponse.json({ success: true, message: 'OTP sent to your email or phone.' });
    }

    if (action === 'verify') {
      if (!otp) {
        return NextResponse.json({ success: false, error: 'Provide the OTP to verify.' }, { status: 400 });
      }

      const now = new Date();
      if (!user.phoneOTP || user.phoneOTP !== otp || !user.phoneOTPExpires || user.phoneOTPExpires < now) {
        return NextResponse.json({ success: false, error: 'Invalid or expired OTP.' }, { status: 400 });
      }

      if (user.status && user.status !== 'active') {
        return NextResponse.json({ success: false, error: 'Account is not active.' }, { status: 403 });
      }

      user.phoneOTP = undefined as any;
      user.phoneOTPExpires = undefined as any;
      await user.save();

      const userData = user.toObject();
      delete userData.password;
      const response = NextResponse.json({ success: true, data: userData });
      try {
        createSessionCookie(response, { id: user._id.toString(), role: user.role, email: user.email });
      } catch {
        // ignore cookie creation failures
      }
      return response;
    }

    return NextResponse.json({ success: false, error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'OTP login failed.' }, { status: 500 });
  }
}
