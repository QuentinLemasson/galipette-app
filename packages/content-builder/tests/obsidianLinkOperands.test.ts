import { describe, expect, it } from "vitest";
import { extractObsidianLinkLeftOperand } from "@galipette/content-parser";

describe("extractObsidianLinkLeftOperand", () => {
  it("returns the whole label when there is no pipe", () => {
    expect(extractObsidianLinkLeftOperand("etourdi")).toBe("etourdi");
  });

  it("returns the left operand when pipe is present", () => {
    expect(extractObsidianLinkLeftOperand("stunned|etourdi")).toBe("stunned");
  });

  it("trims whitespace", () => {
    expect(extractObsidianLinkLeftOperand("  stunned  |  etourdi  ")).toBe("stunned");
  });
});
