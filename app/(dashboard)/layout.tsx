import { DashboardShell } from "@/components/dashboard-shell";
import { OrganizationProvider } from "@/components/organization-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrganizationProvider>
      <DashboardShell>{children}</DashboardShell>
    </OrganizationProvider>
  );
}
