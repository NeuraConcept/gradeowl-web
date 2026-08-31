"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { OrganizationOnboarding } from "@/components/organization-onboarding";
import { useCurrentOrganization } from "@/components/organization-provider";
import { Sidebar } from "@/components/sidebar";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { isLoading, isNoMembership, isError, refetch } = useCurrentOrganization();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isNoMembership && pathname !== "/onboarding") router.replace("/onboarding");
  }, [isNoMembership, pathname, router]);

  if (isLoading) {
    return <main className="min-h-screen bg-cream p-8" aria-label="Loading school workspace" />;
  }
  if (isNoMembership) return <OrganizationOnboarding />;
  if (isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream p-8">
        <div className="space-y-3 text-center">
          <p>Unable to load your school workspace.</p>
          <button className="text-coral underline" onClick={() => refetch()}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-cream p-8">{children}</main>
    </div>
  );
}
