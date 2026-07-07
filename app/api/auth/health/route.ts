import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const smtpConfigured = Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM
  );

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
  };

  return NextResponse.json({
    success: true,
    message: 'Auth service health check',
    data: details,
  });
}