export function getAuthUrl() {
  if (process.env.AUTH_URL) return process.env.AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function validateProductionEnv() {
  const missing: string[] = [];

  if (!process.env.AUTH_SECRET) missing.push("AUTH_SECRET");
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!process.env.AUTH_URL && !process.env.VERCEL_URL) missing.push("AUTH_URL");

  if (process.env.NODE_ENV === "production" && missing.length > 0) {
    console.warn(`[env] Missing required variables: ${missing.join(", ")}`);
  }

  if (process.env.NODE_ENV === "production" && !process.env.AUTH_RESEND_KEY) {
    console.warn("[env] AUTH_RESEND_KEY is not set — magic link emails will fail");
  }
}
