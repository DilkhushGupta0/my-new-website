import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM);
  const twilioConfigured = Boolean(process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_FROM);

  const details = {
    smtp: {
      enabled: smtpConfigured,
      missing: [
        !process.env.SMTP_HOST && 'SMTP_HOST',
        !process.env.SMTP_USER && 'SMTP_USER',
        !process.env.SMTP_PASS && 'SMTP_PASS',
        !process.env.SMTP_FROM && 'SMTP_FROM',
      ].filter(Boolean),
    },
    twilio: {
      enabled: twilioConfigured,
      missing: [
        !process.env.TWILIO_SID && 'TWILIO_SID',
        !process.env.TWILIO_TOKEN && 'TWILIO_TOKEN',
        !process.env.TWILIO_FROM && 'TWILIO_FROM',
      ].filter(Boolean),
    },
  };

  return NextResponse.json({ success: true, message: 'Auth service health check', data: details });
}
