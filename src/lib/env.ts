const requiredEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  ADMIN_DASHBOARD_KEY: process.env.ADMIN_DASHBOARD_KEY,
};

export function getServerEnv() {
  const missing = Object.entries(requiredEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing environment variables: ${missing.join(", ")}. Check .env.local.`,
    );
  }

  return {
    supabaseUrl: requiredEnv.NEXT_PUBLIC_SUPABASE_URL as string,
    supabaseServiceRoleKey: requiredEnv.SUPABASE_SERVICE_ROLE_KEY as string,
    adminDashboardKey: requiredEnv.ADMIN_DASHBOARD_KEY as string,
    storageBucket: process.env.SUPABASE_STORAGE_BUCKET || "portfolio-images",
  };
}
