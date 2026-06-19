/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  output: isStaticExport ? "export" : undefined,
  trailingSlash: isStaticExport,
  basePath: isGitHubPages ? "/Private" : "",
  assetPrefix: isGitHubPages ? "/Private/" : undefined,
  images: {
    unoptimized: isStaticExport,
  },
};

export default nextConfig;

