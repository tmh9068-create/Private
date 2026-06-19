/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const isGitHubPages = process.env.GITHUB_PAGES === "true";
const isSupabaseStorage = process.env.SUPABASE_STORAGE === "true";

const supabaseBasePath = "/storage/v1/object/public/drill-web";

const nextConfig = {
  output: isStaticExport ? "export" : undefined,
  trailingSlash: isStaticExport,
  basePath: isGitHubPages ? "/Private" : isSupabaseStorage ? supabaseBasePath : "",
  assetPrefix: isGitHubPages ? "/Private/" : isSupabaseStorage ? `${supabaseBasePath}/` : undefined,
  images: {
    unoptimized: isStaticExport,
  },
};

export default nextConfig;

