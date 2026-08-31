"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useOrganization } from "@/lib/api/hooks/use-organization";

type OrganizationContextValue = ReturnType<typeof useOrganization>;

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const organization = useOrganization();
  return (
    <OrganizationContext.Provider value={organization}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useCurrentOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useCurrentOrganization must be used inside OrganizationProvider");
  }
  return context;
}
