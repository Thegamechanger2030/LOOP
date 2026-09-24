import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Root just routes to the right place — no marketing page needed for an
// internal tool.
export default async function HomePage() {
  const session = await getServerSession(authOptions);
  redirect(session ? "/dashboard" : "/login");
}
