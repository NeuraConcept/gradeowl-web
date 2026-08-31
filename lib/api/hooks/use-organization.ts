import { useQuery } from "@tanstack/react-query";
import { ApiError, apiClient } from "@/lib/api/client";
import type { Organization } from "@/lib/api/types";

function isNoMembershipError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 403 || error.status === 404);
}

export function useOrganization() {
  const query = useQuery({
    queryKey: ["organization"],
    queryFn: () => apiClient.get<Organization>("/orgs/me"),
    retry: false,
  });

  return {
    ...query,
    isNoMembership: isNoMembershipError(query.error),
  };
}
