import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Nav } from "@/components/nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0712] text-[#F8FAFC]">
      <Nav />
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {children}
      </main>
    </div>
  );
}
