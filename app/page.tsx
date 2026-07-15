"use client";

import { useState } from "react";
import { FileText, Plus, RotateCcw, Users } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { FeedbackSourceCard } from "@/components/feedback-source-card";
import { FileUpload } from "@/components/file-upload";
import { PrivacyDialog } from "@/components/privacy-dialog";
import { ResultsDashboard } from "@/components/results-dashboard";
import { sampleProject, sampleResult, sampleSources } from "@/lib/sample-data";
import type { AnalysisResult, FeedbackSource, ProjectContext, Usage } from "@/lib/types";
import {
  appendFeedbackSources,
  canAnalyse,
  nextFeedbackId,
  removeFeedbackSource,
  totalFeedbackCharacters,
} from "@/lib/validation";

const DEFAULT_MODEL = "openai/gpt-4o-2024-08-06";
const blankProject: ProjectContext = {
  name: "",
  type: "Video Production",
  description: "",
  currentVersion: "",
  team: [],
};
const blankSource = (id: string): FeedbackSource => ({
  id,
  name: "",
  channel: "Email",
  author: "",
  authorRole: "",
  date: "",
  text: "",
});
const projectTypes = [
  "Video Production",
  "Graphic Design",
  "UI/UX Design",
  "Web Development",
  "Software Development",
  "Social Media",
  "Photography",
  "Architecture",
  "Interior Design",
  "Other",
] as const;

export default function Home() {
  const [project, setProject] = useState<ProjectContext>(blankProject);
  const [sources, setSources] = useState<FeedbackSource[]>([blankSource("F001")]);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [result, setResult] = useState<AnalysisResult>();
  const [usage, setUsage] = useState<Usage>();
  const [resultModel, setResultModel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  const totalCharacters = totalFeedbackCharacters(sources);
  const canRunAnalysis = canAnalyse(project, sources, apiKey, model);

  function updateTeam(index: number, key: "name" | "role", value: string) {
    setProject((current) => ({
      ...current,
      team: current.team.map((person, personIndex) =>
        personIndex === index ? { ...person, [key]: value } : person,
      ),
    }));
  }

  function loadSample() {
    setProject(sampleProject);
    setSources(sampleSources);
    setResult(undefined);
    setError("");
  }

  async function analyse() {
    if (!canRunAnalysis) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-openrouter-key": apiKey,
        },
        body: JSON.stringify({
          project,
          sources: sources.filter((source) => source.text.trim()),
          model,
        }),
      });
      const payload = await response.json();

      if (!payload.success) {
        setError(payload.error?.message || "Analysis could not be completed.");
        return;
      }

      setResult(payload.data);
      setUsage(payload.usage);
      setResultModel(payload.model);
    } catch {
      setError("Could not connect to the analysis service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <AppHeader onPrivacy={() => setPrivacy(true)} />
      <section className="hero">
        <div className="eyebrow">REVISION OPERATIONS, SIMPLIFIED</div>
        <h1>Turn messy client feedback into a clear revision plan.</h1>
        <p>
          Consolidate comments, detect contradictions, identify missing decisions and generate an
          actionable revision report.
        </p>
      </section>

      <div className="layout">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="step">STEP 1</span>
              <h2>Project Context</h2>
            </div>
            <button className="btn small" onClick={loadSample}>
              Load sample project
            </button>
          </div>
          <div className="section">
            <div className="grid">
              <label className="field">
                Project name *
                <input
                  className="input"
                  value={project.name}
                  onChange={(event) => setProject({ ...project, name: event.target.value })}
                  placeholder="e.g. Spring Campaign Launch"
                />
              </label>
              <label className="field">
                Project type
                <select
                  value={project.type}
                  onChange={(event) =>
                    setProject({ ...project, type: event.target.value as ProjectContext["type"] })
                  }
                >
                  {projectTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              Project description
              <textarea
                value={project.description}
                onChange={(event) => setProject({ ...project, description: event.target.value })}
                placeholder="Describe the project, deliverables, current version and the main objective."
              />
            </label>
            <label className="field">
              Current version
              <input
                className="input"
                value={project.currentVersion}
                onChange={(event) => setProject({ ...project, currentVersion: event.target.value })}
                placeholder="e.g. Rough Cut 04"
              />
            </label>
            <h3>
              <Users size={15} aria-hidden="true" /> Team members
            </h3>
            <p className="help">
              Owners can only be assigned from this list. Without a team, reports use Unassigned.
            </p>
            {project.team.map((person, index) => (
              <div className="team-row" key={person.id}>
                <input
                  className="input"
                  aria-label={`Team member ${index + 1} name`}
                  placeholder="Name"
                  value={person.name}
                  onChange={(event) => updateTeam(index, "name", event.target.value)}
                />
                <input
                  className="input"
                  aria-label={`Team member ${index + 1} role`}
                  placeholder="Role"
                  value={person.role}
                  onChange={(event) => updateTeam(index, "role", event.target.value)}
                />
                <button
                  className="btn small danger"
                  onClick={() =>
                    setProject((current) => ({
                      ...current,
                      team: current.team.filter((_, personIndex) => personIndex !== index),
                    }))
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              className="btn small"
              onClick={() =>
                setProject((current) => ({
                  ...current,
                  team: [...current.team, { id: crypto.randomUUID(), name: "", role: "" }],
                }))
              }
            >
              <Plus size={14} /> Add team member
            </button>
          </div>

          <div className="panel-head">
            <div>
              <span className="step">STEP 2</span>
              <h2>Feedback Sources</h2>
            </div>
            <button
              className="btn small danger"
              onClick={() => {
                setSources([blankSource("F001")]);
                setError("");
              }}
            >
              <RotateCcw size={14} /> Clear all feedback
            </button>
          </div>
          <div className="section">
            <FileUpload
              count={sources.length}
              onAdd={(files) => {
                setSources((current) => appendFeedbackSources(current, files));
                setError("");
              }}
              onError={setError}
            />
            <p className="note">
              Extracted content stays editable. Total: {totalCharacters.toLocaleString()} / 80,000
              characters.
            </p>
            {sources.map((source, index) => (
              <FeedbackSourceCard
                key={source.id}
                source={source}
                first={index === 0}
                last={index === sources.length - 1}
                onChange={(value) =>
                  setSources((current) =>
                    current.map((item, itemIndex) => (itemIndex === index ? value : item)),
                  )
                }
                onRemove={() => setSources((current) => removeFeedbackSource(current, source.id))}
                onMove={(direction) =>
                  setSources((current) => {
                    const next = [...current];
                    [next[index], next[index + direction]] = [next[index + direction], next[index]];
                    return next;
                  })
                }
              />
            ))}
            <button
              className="btn small"
              onClick={() =>
                setSources((current) => [...current, blankSource(nextFeedbackId(current))])
              }
            >
              <Plus size={14} /> Add feedback source
            </button>
          </div>

          <div className="section">
            <span className="step">API SETTINGS</span>
            <h3>OpenRouter analysis</h3>
            <p className="help">
              Your API key is used only for the current analysis. RevisionFlow does not save it to a
              database, file, cookie or browser storage.
            </p>
            <label className="field">
              OpenRouter API key
              <input
                className="input"
                type="password"
                autoComplete="off"
                value={apiKey}
                onChange={(event) => setApiKey(event.target.value)}
                placeholder="sk-or-…"
              />
            </label>
            <label className="field">
              Model ID
              <input
                className="input"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                placeholder={DEFAULT_MODEL}
              />
            </label>
            <p className="note">
              Default: {DEFAULT_MODEL}, a model verified by OpenRouter to support strict structured
              outputs. You may choose another compatible model.
            </p>
            <p className="note">
              Project content is sent to OpenRouter and the selected model provider for analysis.
              Provider data policies may apply.
            </p>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="actionbar">
            <span className="note">
              {totalCharacters > 80000
                ? "Reduce feedback below 80,000 characters."
                : "All required fields are needed to analyse."}
            </span>
            <button
              className="btn primary"
              disabled={!canRunAnalysis || loading}
              onClick={() => void analyse()}
            >
              {loading ? "Analysing feedback…" : "Analyse Feedback"}
            </button>
          </div>
        </section>

        {loading ? (
          <section className="panel loading" aria-live="polite">
            <div className="spinner" />
            <b>Analysing feedback</b>
            <p className="muted">Preparing a traceable revision report. This may take a moment.</p>
          </section>
        ) : result ? (
          <ResultsDashboard
            initial={result}
            project={project}
            sources={sources}
            model={resultModel || model}
            usage={usage}
          />
        ) : (
          <section className="panel report-empty">
            <FileText size={34} />
            <h2>Your revision report will appear here</h2>
            <p>
              Add feedback and an API key to run a real analysis, or preview the complete interface
              with the built-in sample.
            </p>
            <button
              className="btn primary"
              onClick={() => {
                loadSample();
                setResult(sampleResult);
                setResultModel("Built-in sample");
              }}
            >
              Preview sample report
            </button>
          </section>
        )}
      </div>
      {privacy && <PrivacyDialog onClose={() => setPrivacy(false)} />}
    </main>
  );
}
