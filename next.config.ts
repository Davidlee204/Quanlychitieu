import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  typescript: {
    // Cho phép build hoàn tất ngay cả khi dự án có lỗi TypeScript.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Cho phép build hoàn tất ngay cả khi dự án có lỗi ESLint.
    ignoreDuringBuilds: true,
  },
}
export default nextConfig