import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { createSessionCookie } from '@/lib/serverAuth';

async function sendEmail(to: string, subject: string, text: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    const error = new Error('SMTP is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, and SMTP_FROM.');
    console.error('[auth/otp] sendEmail configuration error:', error.message);
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
    console.error('[auth/otp] sendEmail error:', error?.message || error);
    throw new Error('Failed to deliver OTP email.');
  }
}

async function sendSMS(phone: string, text: string) {
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_TOKEN;
  const from = process.env.TWILIO_FROM;

  if (!sid || !token || !from) {
    const error = new Error('Twilio is not configured. Set TWILIO_SID, TWILIO_TOKEN, and TWILIO_FROM.');
    console.error('[auth/otp] sendSMS configuration error:', error.message);
    throw error;
  }

  try {
    const client = twilio(sid, token);
    await client.messages.create({ body: text, from, to: phone });
  } catch (error: any) {
    console.error('[auth/otp] sendSMS error:', error?.message || error);
    throw new Error('Failed to deliver OTP SMS.');
  }
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
      const deliveryPromises: Promise<void>[] = [];

      if (email && user.email) {
        deliveryPromises.push(sendEmail(user.email, 'Zenzi Consultancy login code', message));
      }
      if (phone && user.phone) {
        deliveryPromises.push(sendSMS(user.phone, message));
      }

      if (deliveryPromises.length === 0) {
        return NextResponse.json({ success: false, error: 'Unable to send OTP. No valid delivery target found.' }, { status: 400 });
      }

      try {
        await Promise.all(deliveryPromises);
      } catch (error: any) {
        console.error('[auth/otp] OTP delivery failure:', error?.message || error);
        return NextResponse.json({ success: false, error: error?.message || 'Failed to deliver OTP.' }, { status: 500 });
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
