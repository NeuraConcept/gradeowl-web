import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type {
  AdminDashboard,
  WaitlistEntry,
  AdminUser,
} from "@/lib/api/types";

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => apiClient.get<AdminDashboard>("/admin/dashboard"),
  });
}

export function useAdminWaitlist() {
  return useQuery({
    queryKey: ["admin", "waitlist"],
    queryFn: () => apiClient.get<WaitlistEntry[]>("/admin/waitlist"),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiClient.get<AdminUser[]>("/admin/users"),
  });
}
