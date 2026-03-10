import { NextRequest } from "next/server";
import { getServerEnv } from "@/lib/env";

export function isAdminRequest(request: NextRequest) {
  const key = request.headers.get("x-admin-key");
  return key !== null && key === getServerEnv().adminDashboardKey;
}
