import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/lib/stores/auth-store";

describe("auth store", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it("starts unauthenticated", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("sets user on setUser", () => {
    useAuthStore
      .getState()
      .setUser({ uid: "abc123", email: "test@test.com", name: "Test" });
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.email).toBe("test@test.com");
  });

  it("clears user on clearUser", () => {
    useAuthStore
      .getState()
      .setUser({ uid: "abc123", email: "test@test.com", name: "Test" });
    useAuthStore.getState().clearUser();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
