/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel / Node.js デプロイ向け（デフォルト）
  output: process.env.STATIC_EXPORT === "true" ? "export" : undefined,
  images: {
    unoptimized: process.env.STATIC_EXPORT === "true",
  },
};

export default nextConfig;

