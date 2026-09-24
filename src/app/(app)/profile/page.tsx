import { getServerSession } from "next-auth";
import { CheckCircle2, Mail, ShieldCheck, User } from "lucide-react";
import { authOptions } from "@/lib/auth";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = session!.user;
  const role = user.role;
  const name = user.name || "MS Sir";
  const email = user.email || "admin@demo.loop";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const displayRole = role === "ADMIN" ? "Administrator" : role === "ANALYST" ? "Manager / Analyst" : "Analyst / User";

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
      <div className="glass-card p-6 rounded-2xl border border-[#3B1F4D] shadow-glow">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]"><User className="w-5 h-5" /></div>
          <div><h1 className="text-2xl font-black text-white tracking-tight">My Profile</h1><p className="text-xs text-[#A78BFA] mt-1">Your LOOP workspace identity and account details.</p></div>
        </div>
      </div>

      <section className="glass-card rounded-2xl p-6 border border-[#3B1F4D] shadow-glow space-y-5">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#1D1028] border border-[#3B1F4D]">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EF4444] flex items-center justify-center text-white font-black text-xl shadow-glow shrink-0">{initials}</div>
          <div className="min-w-0"><h2 className="text-lg font-black text-white leading-tight truncate">{name}</h2><p className="text-xs font-bold text-[#EF4444] mt-0.5">{displayRole}</p><div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-1"><CheckCircle2 className="w-3 h-3" /><span>Verified Workspace Profile</span></div></div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="p-3.5 rounded-xl bg-[#0D0712]/70 border border-[#3B1F4D] flex items-center justify-between gap-3"><span className="text-[#A78BFA] font-bold flex items-center gap-2 shrink-0"><User className="w-4 h-4 text-[#7C3AED]" /> Full Name</span><span className="text-white font-extrabold truncate">{name}</span></div>
          <div className="p-3.5 rounded-xl bg-[#0D0712]/70 border border-[#3B1F4D] flex items-center justify-between gap-3"><span className="text-[#A78BFA] font-bold flex items-center gap-2 shrink-0"><Mail className="w-4 h-4 text-[#7C3AED]" /> Email Address</span><span className="text-white font-mono font-bold truncate">{email}</span></div>
          <div className="p-3.5 rounded-xl bg-[#0D0712]/70 border border-[#3B1F4D] flex items-center justify-between gap-3"><span className="text-[#A78BFA] font-bold flex items-center gap-2 shrink-0"><ShieldCheck className="w-4 h-4 text-[#7C3AED]" /> Role Permission</span><span className="text-[#EF4444] font-black uppercase">{role}</span></div>
          <div className="p-3.5 rounded-xl bg-[#0D0712]/70 border border-[#3B1F4D] flex items-center justify-between gap-3"><span className="text-[#A78BFA] font-bold flex items-center gap-2 shrink-0"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Account Status</span><span className="text-emerald-400 font-extrabold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active</span></div>
        </div>
      </section>
    </div>
  );
}