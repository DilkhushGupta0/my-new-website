import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createLocalUser, defaultUsers, normalizeValue, userExists, localUsers } from '@/lib/localAuth';

async function sendEmail(to: string, subject: string, text: string) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.log('[auth/register] sendEmail fallback:', { to, subject, text });
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
    console.log('[auth/register] sendEmail error:', error);
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
      console.log('[auth/register] sendSMS error:', error);
    }
  }
  console.log('[auth/register] sendSMS fallback:', { phone, text });
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
