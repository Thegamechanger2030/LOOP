"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Inbox,
  TrendingUp,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Users,
  ChevronDown,
} from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/ask", label: "Ask LOOP", icon: MessageSquare, badge: "AI" },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as any;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Format user profile properties dynamically
  const name = user?.name || "MS Sir";
  const email = user?.email || "admin@demo.loop";
  const role = user?.role || "ADMIN";

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const displayRole =
    role === "ADMIN"
      ? "Administrator"
      : role === "ANALYST"
      ? "Manager / Analyst"
      : role === "VIEWER"
      ? "Analyst / User"
      : "Administrator";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#3B1F4D] bg-[#160D1F]/90 backdrop-blur-xl shadow-glow">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* LEFT: LOOP Logo & Branding (Aligned Far-Left) */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform group-hover:rotate-180 transition-transform duration-700" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="navLoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="50%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#navLoopGrad)"
                  strokeWidth="10"
                  strokeDasharray="180 60"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-black text-lg text-white tracking-tighter">L</span>
            </div>

            <div>
              <span className="text-xl font-black tracking-tight text-white">LOOP</span>
              <p className="text-[9px] font-extrabold tracking-widest text-[#A78BFA] uppercase">
                CUSTOMER INTELLIGENCE
              </p>
            </div>
          </Link>
        </div>

        {/* CENTER: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-[#0D0712]/70 p-1.5 rounded-2xl border border-[#3B1F4D]">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200",
                  isActive
                    ? "gradient-bg-purple-red text-white shadow-combinedGlow"
                    : "text-[#A78BFA] hover:text-white hover:bg-[#1D1028]"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-[#A78BFA]")} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: User Profile Button & Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#1D1028] border border-[#3B1F4D] hover:border-[#7C3AED] hover:bg-[#160D1F] transition text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EF4444] flex items-center justify-center font-black text-white text-xs shadow-md shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="font-extrabold text-white text-xs leading-none">{name}</p>
                <p className="text-[10px] text-[#A78BFA] font-medium mt-0.5">{displayRole}</p>
              </div>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-[#A78BFA] transition-transform duration-200",
                  dropdownOpen && "rotate-180 text-white"
                )}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#160D1F] border border-[#3B1F4D] shadow-combinedGlow p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Header User Summary */}
                <div className="px-3 py-2.5 flex items-center gap-3 bg-[#1D1028] rounded-xl border border-[#3B1F4D]/60 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EF4444] flex items-center justify-center font-black text-white text-sm shadow-md shrink-0">
                    {initials}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-extrabold text-white text-xs truncate">{name}</p>
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 mt-0.5">
                      {displayRole}
                    </span>
                  </div>
                </div>

                {/* Dropdown Items */}
                <div className="space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#A78BFA] hover:text-white hover:bg-[#7C3AED]/20 transition text-left"
                  >
                    <User className="w-4 h-4 text-[#A78BFA]" />
                    <span>My Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push("/settings");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#A78BFA] hover:text-white hover:bg-[#7C3AED]/20 transition text-left"
                  >
                    <Settings className="w-4 h-4 text-[#A78BFA]" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push("/login");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#A78BFA] hover:text-white hover:bg-[#7C3AED]/20 transition text-left"
                  >
                    <Users className="w-4 h-4 text-[#A78BFA]" />
                    <span>Switch Account</span>
                  </button>
                </div>

                <div className="border-t border-[#3B1F4D] my-1.5" />

                {/* Logout Action */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    signOut({ callbackUrl: "/login" });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#EF4444] hover:bg-[#EF4444]/15 transition text-left"
                >
                  <LogOut className="w-4 h-4 text-[#EF4444]" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl border border-[#3B1F4D] bg-[#1D1028] text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <nav className="lg:hidden p-4 border-t border-[#3B1F4D] bg-[#160D1F] space-y-2 animate-in fade-in">
          {LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition",
                  isActive
                    ? "gradient-bg-purple-red text-white shadow-combinedGlow"
                    : "text-[#A78BFA] hover:text-white hover:bg-[#1D1028]"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

    </header>
  );
}
