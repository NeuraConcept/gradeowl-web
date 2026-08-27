import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminPage from "@/app/(dashboard)/admin/page";

const mocks = vi.hoisted(() => ({
  useCurrentOrganization: vi.fn(),
  useAdminDashboard: vi.fn(),
  useAdminWaitlist: vi.fn(),
  useAdminUsers: vi.fn(),
}));

vi.mock("@/components/organization-provider", () => ({
  useCurrentOrganization: mocks.useCurrentOrganization,
}));
vi.mock("@/lib/api/hooks/use-admin", () => ({
  useAdminDashboard: mocks.useAdminDashboard,
  useAdminWaitlist: mocks.useAdminWaitlist,
  useAdminUsers: mocks.useAdminUsers,
}));

describe("AdminPage", () => {
  it("keeps the admin dashboard out of reach for teachers", () => {
    mocks.useCurrentOrganization.mockReturnValue({
      organization: { role: "TEACHER" },
    });

    render(<AdminPage />);

    expect(screen.getByText("School admins only")).toBeInTheDocument();
    expect(mocks.useAdminDashboard).not.toHaveBeenCalled();
  });
});
