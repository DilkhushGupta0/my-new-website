import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep server-side email/SMS dependencies inside the normal Next.js bundle.
  // This avoids runtime resolution failures on platforms like Vercel.
};

export default nextConfig;
