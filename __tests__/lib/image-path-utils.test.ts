import { describe, expect, it } from "vitest";

import { imagePathToProxyUrl } from "@/lib/api/utils";

describe("imagePathToProxyUrl", () => {
  it("maps a custom local storage upload path without exposing its absolute prefix", () => {
    expect(
      imagePathToProxyUrl(
        "/tmp/gradeowl-investor-demo-storage/uploads/exams/1/qp/page.jpeg",
      ),
    ).toBe("/api/proxy/static/uploads/exams/1/qp/page.jpeg");
  });
});
