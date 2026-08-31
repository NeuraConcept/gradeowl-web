import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OrganizationProvider, useCurrentOrganization } from "@/components/organization-provider";

const mocks = vi.hoisted(() => ({
  useOrganization: vi.fn(),
}));

vi.mock("@/lib/api/hooks/use-organization", () => ({
  useOrganization: mocks.useOrganization,
}));

function Consumer() {
  const { isNoMembership } = useCurrentOrganization();
  return <span>{isNoMembership ? "Needs school" : "Has school"}</span>;
}

describe("OrganizationProvider", () => {
  it("shares the no-membership state with dashboard children", () => {
    mocks.useOrganization.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      isNoMembership: true,
      refetch: vi.fn(),
    });

    render(
      <OrganizationProvider>
        <Consumer />
      </OrganizationProvider>,
    );

    expect(screen.getByText("Needs school")).toBeInTheDocument();
  });
});
