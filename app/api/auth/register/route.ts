import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { createLocalUser, defaultUsers, normalizeValue, userExists, localUsers } from '@/lib/localAuth';

async function sendEmail(to: string, subject: string, text: string) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    const error = new Error('SMTP is not configured.');
    console.error('[auth/register] sendEmail configuration error:', error.message);
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
    console.error('[auth/register] sendEmail error:', error?.message || error);
    throw new Error('Failed to deliver registration OTP email.');
  }
}

async function sendSMS(phone: string, text: string) {
  const sid = process.env.TWILIO_SID;
  const token = process.env.TWILIO_TOKEN;
  const from = process.env.TWILIO_FROM;

  if (!sid || !token || !from) {
    const error = new Error('Twilio is not configured.');
    console.error('[auth/register] sendSMS configuration error:', error.message);
    throw error;
  }

  try {
    const client = twilio(sid, token);
    await client.messages.create({ body: text, from, to: phone });
  } catch (error: any) {
    console.error('[auth/register] sendSMS error:', error?.message || error);
    throw new Error('Failed to deliver registration OTP SMS.');
  }
}

async function seedDefaultUsers() {
  try {
    for (const defaultUser of defaultUsers) {
      const exists = await User.findOne({ $or: [{ email: defaultUser.email }, { name: defaultUser.name }] });
      if (!exists) {
        await User.create(defaultUser);
      }
    }
  } catch {
    // ignore seeding errors
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const name = String(body.name || '').trim();
    const password = String(body.password || '');
    const role = String(body.role || '').trim();

    if (!email || !name || !password || !role) {
      return NextResponse.json({ success: false, error: 'Missing registration fields.' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    const status = 'pending';
    const hashed = await bcrypt.hash(password, 10);

    let useLocalAuth = !process.env.MONGODB_URI;
    let userData: any;

    if (!useLocalAuth) {
      try {
        await connectDB();
        await seedDefaultUsers();

        if (role === 'admin') {
          const adminCount = await User.countDocuments({ role: 'admin' });
          if (adminCount >= 2) {
            return NextResponse.json({ success: false, error: 'Maximum number of admin accounts reached.' }, { status: 400 });
          }
        }

        const user = await User.create({
          email,
          phone,
          name,
          password: hashed,
          role,
          status,
          registrationOTP: otp,
          registrationOTPExpires: otpExpires,
        });
        userData = {
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
        };
      } catch (error: any) {
        const message = error?.message?.includes('duplicate key') ? 'User already exists.' : error?.message || 'Unable to register user.';
        return NextResponse.json({ success: false, error: message }, { status: 400 });
      }
    } else {
      if (userExists(email, name)) {
        return NextResponse.json({ success: false, error: 'User already exists.' }, { status: 400 });
      }
      const adminCount = localUsers.filter((u) => u.role === 'admin').length;
      if (role === 'admin' && adminCount >= 2) {
        return NextResponse.json({ success: false, error: 'Maximum number of admin accounts reached.' }, { status: 400 });
      }

      const newUser = createLocalUser({
        name,
        email,
        phone,
        password: hashed,
        role,
        status,
        registrationOTP: otp,
        registrationOTPExpires: otpExpires,
      });
      userData = { name: newUser.name, email: newUser.email, phone: newUser.phone, role: newUser.role, status: newUser.status };
    }

    const sendTarget = phone ? phone : email;
    const message = `Verification code sent to ${sendTarget}. It expires in 5 minutes.`;
    if (email) {
      await sendEmail(email, 'Verify your Zenzi Consultancy account', `Your verification code is ${otp}. It expires in 5 minutes.`);
    }
    if (phone) {
      await sendSMS(phone, `Your Zenzi sign-up OTP is ${otp}. It expires in 5 minutes.`);
    }

    return NextResponse.json({ success: true, data: userData, message, pendingVerification: true }, { status: 201 });
  } catch (error: any) {
    const message = error?.message === 'User already exists.' ? 'User already exists.' : error?.message || 'Unable to register user.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
