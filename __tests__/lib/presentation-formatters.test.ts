import { describe, expect, it } from "vitest";
import {
  formatDisplayDate,
  scoreColorClass,
} from "@/lib/utils";

describe("presentation formatters", () => {
  it("renders a missing or invalid submission timestamp as an em dash", () => {
    expect(formatDisplayDate(undefined)).toBe("—");
    expect(formatDisplayDate("not-a-date")).toBe("—");
  });

  it("uses the established score thresholds relative to maximum marks", () => {
    expect(scoreColorClass(10, 10)).toBe("text-success");
    expect(scoreColorClass(4, 10)).toBe("text-warning");
    expect(scoreColorClass(3.9, 10)).toBe("text-coral");
  });
});
