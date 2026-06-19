/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.STATIC_EXPORT === "true" ? "export" : undefined,
  images: {
    unoptimized: process.env.STATIC_EXPORT === "true",
  },
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;

