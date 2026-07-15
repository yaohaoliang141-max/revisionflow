import { describe, expect, it } from "vitest";
import { parseFeedbackFile } from "@/lib/file-parsers";
describe("file parsers", () => {
  it("reads txt and markdown", async () => {
    expect(await parseFeedbackFile(new File(["# Note\nHello"], "a.md"))).toContain("Hello");
  });
  it("converts CSV rows to labelled text", async () => {
    const value = await parseFeedbackFile(
      new File(["author,comment\nSam,Make it larger"], "a.csv", { type: "text/csv" }),
    );
    expect(value).toContain("author: Sam");
    expect(value).toContain("comment: Make it larger");
  });
});
