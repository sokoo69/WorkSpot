import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // Pass session to client
  const role = session?.user?.role || "user";

  return <DashboardClient role={role} session={session} />;
}
