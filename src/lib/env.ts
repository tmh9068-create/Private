export function validateProductionEnv() {
  const required = ["AUTH_SECRET", "AUTH_URL", "DATABASE_URL"] as const;
  const missing = required.filter((key) => !process.env[key]);

  if (process.env.NODE_ENV === "production" && missing.length > 0) {
    console.warn(`[env] Missing required variables: ${missing.join(", ")}`);
  }

  if (process.env.NODE_ENV === "production" && !process.env.AUTH_RESEND_KEY) {
    console.warn("[env] AUTH_RESEND_KEY is not set — magic link emails will fail");
  }
}
