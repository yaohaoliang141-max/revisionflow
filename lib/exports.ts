import type { AnalysisResult, ProjectContext } from "./types";
const esc = (v: string | number | null | undefined) => `"${String(v ?? "").replaceAll('"', '""')}"`;
export function revisionPlanCsv(result: AnalysisResult) {
  const header = [
    "ID",
    "Asset",
    "Location",
    "Required Change",
    "Priority",
    "Owner",
    "Status",
    "Source References",
    "Confidence",
  ];
  const rows = result.revision_items.map((x) => [
    x.id,
    x.asset,
    x.location,
    x.requested_change,
    x.priority,
    x.owner,
    x.status,
    x.source_refs.join(", "),
    x.confidence,
  ]);
  return [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
}
export function fullReportMarkdown(
  project: ProjectContext,
  result: AnalysisResult,
  model: string,
  generatedAt = new Date(),
) {
  const lines = [
    `# RevisionFlow report`,
    "",
    `## Project information`,
    `- **Project:** ${project.name}`,
    `- **Type:** ${project.type}`,
    `- **Version:** ${project.currentVersion || "Not supplied"}`,
    "",
    "## Revision plan",
    "",
    "| ID | Asset | Location | Required change | Priority | Owner | Status | Sources | Confidence |",
    "|---|---|---|---|---|---|---|---|---|",
  ];
  result.revision_items.forEach((x) =>
    lines.push(
      `| ${x.id} | ${x.asset ?? "—"} | ${x.location ?? "—"} | ${x.requested_change} | ${x.priority} | ${x.owner} | ${x.status} | ${x.source_refs.join(", ")} | ${x.confidence} |`,
    ),
  );
  lines.push(
    "",
    "## Duplicate feedback",
    ...result.duplicate_groups.map(
      (x) => `- **${x.id}:** ${x.summary} (${x.source_refs.join(", ")}) — ${x.explanation}`,
    ),
    "",
    "## Contradictions",
    ...result.contradictions.map((x) => `- **${x.topic}:** ${x.why_conflicting}`),
    "",
    "## Clarification questions",
    ...result.clarification_questions.map((x) => `- ${x.question}`),
    "",
    "## Summary",
    result.revision_summary.executive_summary,
    "",
    "### Next actions",
    ...result.revision_summary.next_actions.map((x) => `- ${x}`),
    "",
    "## Client reply",
    `**Subject:** ${result.client_reply.subject}`,
    "",
    result.client_reply.body,
    "",
    `Generated model: ${model}`,
    `Generated time: ${generatedAt.toISOString()}`,
  );
  return lines.join("\n");
}
