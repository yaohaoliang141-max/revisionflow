"use client";

import { useMemo, useState } from "react";
import { Download, FileJson, FileSpreadsheet, Mail, Plus, Search } from "lucide-react";
import type {
  AnalysisResult,
  FeedbackSource,
  Priority,
  ProjectContext,
  Status,
  Usage,
} from "@/lib/types";
import { fullReportMarkdown, revisionPlanCsv } from "@/lib/exports";
import { SourceViewer } from "./source-viewer";

const tabs = [
  "Revision Plan",
  "Duplicates",
  "Contradictions",
  "Clarification Questions",
  "Summary",
  "Client Reply",
] as const;
type Tab = (typeof tabs)[number];

function download(text: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

async function copyText(text: string) {
  await navigator.clipboard?.writeText(text);
}

export function ResultsDashboard({
  initial,
  project,
  sources,
  model,
  usage,
}: {
  initial: AnalysisResult;
  project: ProjectContext;
  sources: FeedbackSource[];
  model: string;
  usage?: Usage;
}) {
  const [result, setResult] = useState(initial);
  const [tab, setTab] = useState<Tab>("Revision Plan");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>();
  const [confirmation, setConfirmation] = useState("");
  const teamNames = project.team.map((member) => member.name.trim()).filter(Boolean);

  const filteredItems = useMemo(
    () =>
      result.revision_items.filter(
        (item) =>
          (!search || Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase())) &&
          (!priorityFilter || item.priority === priorityFilter) &&
          (!statusFilter || item.status === statusFilter),
      ),
    [result, search, priorityFilter, statusFilter],
  );
  const activeSource = sources.find((source) => source.id === selectedSource);

  function updateItem(id: string, change: Partial<AnalysisResult["revision_items"][number]>) {
    setResult((current) => ({
      ...current,
      revision_items: current.revision_items.map((item) =>
        item.id === id ? { ...item, ...change } : item,
      ),
    }));
  }

  async function copyWithConfirmation(text: string, message: string) {
    await copyText(text);
    setConfirmation(message);
  }

  function exportWithConfirmation(text: string, name: string, type: string) {
    download(text, name, type);
    setConfirmation(`${name} downloaded.`);
  }

  return (
    <section className="panel report-enter" aria-label="Revision report">
      <div className="panel-head">
        <div>
          <span className="step">STEP 3</span>
          <h2>Revision Report</h2>
        </div>
        <span className="muted">{result.meta.project_name}</span>
      </div>
      <div className="content">
        <p className="confirmation" role="status" aria-live="polite">
          {confirmation}
        </p>
        {usage && (
          <div className="note usage">
            Model: {model} · Prompt: {usage.prompt_tokens ?? "—"} · Completion:{" "}
            {usage.completion_tokens ?? "—"} · Total: {usage.total_tokens ?? "—"}
            {usage.cost !== undefined ? ` · Cost: $${usage.cost}` : ""}
          </div>
        )}
        <div className="export-row">
          <button
            className="btn small"
            onClick={() =>
              exportWithConfirmation(revisionPlanCsv(result), "revision-plan.csv", "text/csv")
            }
          >
            <FileSpreadsheet size={14} /> Export CSV
          </button>
          <button
            className="btn small"
            onClick={() =>
              exportWithConfirmation(
                fullReportMarkdown(project, result, model),
                "revisionflow-report.md",
                "text/markdown",
              )
            }
          >
            <Download size={14} /> Export Markdown
          </button>
          <button
            className="btn small"
            onClick={() =>
              exportWithConfirmation(
                JSON.stringify(result, null, 2),
                "revisionflow-result.json",
                "application/json",
              )
            }
          >
            <FileJson size={14} /> Export JSON
          </button>
          <button
            className="btn small"
            onClick={() =>
              void copyWithConfirmation(
                result.revision_summary.executive_summary,
                "Revision summary copied.",
              )
            }
          >
            Copy summary
          </button>
        </div>
        <div className="tabs" role="tablist">
          {tabs.map((tabName) => (
            <button
              role="tab"
              aria-selected={tab === tabName}
              className={`tab ${tab === tabName ? "active" : ""}`}
              key={tabName}
              onClick={() => setTab(tabName)}
            >
              {tabName}
            </button>
          ))}
        </div>
        <div className="tab-panel">
          {tab === "Revision Plan" && (
            <>
              <div className="toolbar">
                <div className="search-field">
                  <Search size={14} aria-hidden="true" />
                  <input
                    className="input"
                    aria-label="Search revision items"
                    placeholder="Search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <select
                  aria-label="Filter by priority"
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                >
                  <option value="">All priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  aria-label="Filter by status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="">All statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="needs_clarification">Needs clarification</option>
                  <option value="blocked">Blocked</option>
                </select>
                <button
                  className="btn small"
                  onClick={() =>
                    setResult((current) => ({
                      ...current,
                      revision_items: [
                        ...current.revision_items,
                        {
                          id: `R${String(current.revision_items.length + 1).padStart(3, "0")}`,
                          asset: null,
                          location: null,
                          requested_change: "New manual task",
                          rationale: null,
                          priority: "medium",
                          owner: "Unassigned",
                          status: "confirmed",
                          source_refs: [],
                          evidence_quotes: [],
                          confidence: 1,
                        },
                      ],
                    }))
                  }
                >
                  <Plus size={14} /> Add task
                </button>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <caption className="sr-only">Revision plan</caption>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Asset / location</th>
                      <th>Required change</th>
                      <th>Priority</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th>Sources</th>
                      <th>Confidence</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td>
                          <input
                            className="input"
                            aria-label={`${item.id} asset`}
                            value={item.asset ?? ""}
                            onChange={(event) =>
                              updateItem(item.id, { asset: event.target.value || null })
                            }
                          />
                          <input
                            className="input"
                            aria-label={`${item.id} location`}
                            value={item.location ?? ""}
                            onChange={(event) =>
                              updateItem(item.id, { location: event.target.value || null })
                            }
                          />
                        </td>
                        <td className="change">
                          <textarea
                            aria-label={`${item.id} required change`}
                            value={item.requested_change}
                            onChange={(event) =>
                              updateItem(item.id, { requested_change: event.target.value })
                            }
                          />
                        </td>
                        <td>
                          <select
                            aria-label={`${item.id} priority`}
                            value={item.priority}
                            onChange={(event) =>
                              updateItem(item.id, { priority: event.target.value as Priority })
                            }
                          >
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                        </td>
                        <td>
                          <select
                            aria-label={`${item.id} owner`}
                            value={teamNames.includes(item.owner) ? item.owner : "Unassigned"}
                            onChange={(event) => updateItem(item.id, { owner: event.target.value })}
                          >
                            <option>Unassigned</option>
                            {teamNames.map((name) => (
                              <option key={name}>{name}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            aria-label={`${item.id} status`}
                            value={item.status}
                            onChange={(event) =>
                              updateItem(item.id, { status: event.target.value as Status })
                            }
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="needs_clarification">Needs clarification</option>
                            <option value="blocked">Blocked</option>
                          </select>
                        </td>
                        <td>
                          {item.source_refs.length
                            ? item.source_refs.map((id) => (
                                <button
                                  className="source-link"
                                  key={id}
                                  onClick={() => setSelectedSource(id)}
                                >
                                  {id}{" "}
                                </button>
                              ))
                            : "—"}
                        </td>
                        <td>{Math.round(item.confidence * 100)}%</td>
                        <td>
                          <button
                            className="btn small danger"
                            onClick={() =>
                              setResult((current) => ({
                                ...current,
                                revision_items: current.revision_items.filter(
                                  (entry) => entry.id !== item.id,
                                ),
                              }))
                            }
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {tab === "Duplicates" && (
            <div className="cards">
              {result.duplicate_groups.map((group) => (
                <article className="card" key={group.id}>
                  <span className="eyebrow">{group.id}</span>
                  <h3>{group.summary}</h3>
                  <p>{group.explanation}</p>
                  <p>
                    {group.source_refs.map((id) => (
                      <button
                        className="source-link"
                        key={id}
                        onClick={() => setSelectedSource(id)}
                      >
                        {id}{" "}
                      </button>
                    ))}
                  </p>
                </article>
              ))}
            </div>
          )}
          {tab === "Contradictions" && (
            <div className="cards">
              {result.contradictions.map((contradiction) => (
                <article className="card" key={contradiction.id}>
                  <span className="eyebrow">{contradiction.id} · CONTRADICTION</span>
                  <h3>{contradiction.topic}</h3>
                  {contradiction.statements.map((statement, index) => (
                    <p key={index}>
                      <button
                        className="source-link"
                        onClick={() => setSelectedSource(statement.source_ref)}
                      >
                        {statement.source_ref}
                      </button>{" "}
                      — {statement.statement}
                    </p>
                  ))}
                  <p>
                    <b>Why:</b> {contradiction.why_conflicting}
                  </p>
                  <p>
                    <b>Suggested resolution:</b>{" "}
                    {contradiction.suggested_resolution ?? "No resolution suggested."}
                  </p>
                </article>
              ))}
            </div>
          )}
          {tab === "Clarification Questions" && (
            <div className="cards">
              {(["before_work", "before_delivery", "optional"] as const).map((urgency) => (
                <div key={urgency}>
                  <h3 className="urgency-heading">{urgency.replaceAll("_", " ")}</h3>
                  {result.clarification_questions
                    .filter((question) => question.urgency === urgency)
                    .map((question) => (
                      <article className="card" key={question.id}>
                        <b>{question.id}</b>
                        <p>{question.question}</p>
                        <p>
                          {question.related_source_refs.map((id) => (
                            <button
                              className="source-link"
                              key={id}
                              onClick={() => setSelectedSource(id)}
                            >
                              {id}{" "}
                            </button>
                          ))}{" "}
                          {question.related_revision_ids.join(", ")}
                        </p>
                        <button
                          className="btn small"
                          onClick={() =>
                            void copyWithConfirmation(
                              question.question,
                              "Clarification question copied.",
                            )
                          }
                        >
                          Copy question
                        </button>
                      </article>
                    ))}
                </div>
              ))}
            </div>
          )}
          {tab === "Summary" && (
            <>
              <div className="meta-grid">
                {[
                  [result.revision_items.length, "Total items"],
                  [result.revision_summary.confirmed_count, "Confirmed"],
                  [result.revision_summary.needs_clarification_count, "Needs clarification"],
                  [result.revision_summary.blocked_count, "Blocked"],
                  [result.revision_summary.contradiction_count, "Contradictions"],
                ].map(([value, label]) => (
                  <div className="metric" key={String(label)}>
                    <b>{value}</b>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <article className="card">
                <h3>Executive summary</h3>
                <p>{result.revision_summary.executive_summary}</p>
                <h3>Recommended next actions</h3>
                <ul>
                  {result.revision_summary.next_actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </article>
            </>
          )}
          {tab === "Client Reply" && (
            <article className="card">
              <label className="field">
                <span>Subject</span>
                <input
                  className="input"
                  value={result.client_reply.subject}
                  onChange={(event) =>
                    setResult((current) => ({
                      ...current,
                      client_reply: { ...current.client_reply, subject: event.target.value },
                    }))
                  }
                />
              </label>
              <label className="field">
                <span>Email body</span>
                <textarea
                  className="email-body"
                  value={result.client_reply.body}
                  onChange={(event) =>
                    setResult((current) => ({
                      ...current,
                      client_reply: { ...current.client_reply, body: event.target.value },
                    }))
                  }
                />
              </label>
              <button
                className="btn small"
                onClick={() =>
                  void copyWithConfirmation(result.client_reply.subject, "Email subject copied.")
                }
              >
                Copy subject
              </button>{" "}
              <button
                className="btn small"
                onClick={() =>
                  void copyWithConfirmation(
                    `${result.client_reply.subject}\n\n${result.client_reply.body}`,
                    "Client email copied.",
                  )
                }
              >
                <Mail size={14} /> Copy email
              </button>
            </article>
          )}
        </div>
      </div>
      {activeSource && (
        <SourceViewer
          source={activeSource}
          items={result.revision_items}
          onClose={() => setSelectedSource(undefined)}
        />
      )}
    </section>
  );
}
