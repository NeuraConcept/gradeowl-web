"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getFirebaseAuth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

const navItems: {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
}[] = [
  { label: "Exams", href: "/", icon: ClipboardList },
  { label: "Settings", href: "#", icon: Settings, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clearUser } = useAuthStore();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      await signOut(getFirebaseAuth());
      clearUser();
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  }

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-card">
      <div className="p-6">
        <Link href="/" className="text-xl font-bold text-coral">
          GradeOwl
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.disabled ? "#" : item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === item.href
                ? "bg-coral text-white"
                : "text-muted-foreground hover:bg-warm-yellow",
              item.disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-warm-yellow"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
