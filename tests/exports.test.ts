import { describe, expect, it } from "vitest";
import { fullReportMarkdown, revisionPlanCsv } from "@/lib/exports";
import { sampleProject, sampleResult } from "@/lib/sample-data";
describe("exports", () => {
  it("creates the required csv columns", () =>
    expect(revisionPlanCsv(sampleResult)).toContain("Source References"));
  it("creates a report containing client reply", () =>
    expect(fullReportMarkdown(sampleProject, sampleResult, "test")).toContain("## Client reply"));

  it("preserves edited task fields in both exports", () => {
    const edited = {
      ...sampleResult,
      revision_items: [
        {
          ...sampleResult.revision_items[0],
          priority: "low" as const,
          status: "blocked" as const,
          owner: "James",
        },
      ],
    };

    expect(revisionPlanCsv(edited)).toContain('"low","James","blocked"');
    expect(fullReportMarkdown(sampleProject, edited, "test")).toContain(
      "| R001 | Opening title | Opening | Increase the opening title size so it is the first visual focus. | low | James | blocked |",
    );
  });
});
