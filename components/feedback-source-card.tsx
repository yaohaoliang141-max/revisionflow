"use client";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { Channel, FeedbackSource } from "@/lib/types";
const channels: Channel[] = [
  "Email",
  "Meeting Notes",
  "Slack",
  "Discord",
  "Client Call",
  "Frame.io",
  "Document",
  "Other",
];
export function FeedbackSourceCard({
  source,
  onChange,
  onRemove,
  onMove,
  first,
  last,
}: {
  source: FeedbackSource;
  onChange: (s: FeedbackSource) => void;
  onRemove: () => void;
  onMove: (d: -1 | 1) => void;
  first: boolean;
  last: boolean;
}) {
  const set = (key: keyof FeedbackSource, value: string) => onChange({ ...source, [key]: value });
  return (
    <article className="source">
      <div className="source-head">
        <span className="source-id">{source.id}</span>
        <div className="source-actions">
          <button
            className="btn small"
            disabled={first}
            aria-label={`Move ${source.id} up`}
            onClick={() => onMove(-1)}
          >
            <ChevronUp size={14} />
          </button>
          <button
            className="btn small"
            disabled={last}
            aria-label={`Move ${source.id} down`}
            onClick={() => onMove(1)}
          >
            <ChevronDown size={14} />
          </button>
          <button
            className="btn small danger"
            aria-label={`Delete ${source.id}`}
            onClick={onRemove}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="grid">
        <div className="field">
          <label htmlFor={`${source.id}-name`}>Source name</label>
          <input
            id={`${source.id}-name`}
            className="input"
            value={source.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Design review email"
          />
        </div>
        <div className="field">
          <label htmlFor={`${source.id}-channel`}>Channel</label>
          <select
            id={`${source.id}-channel`}
            value={source.channel}
            onChange={(e) => set("channel", e.target.value)}
          >
            {channels.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${source.id}-author`}>Author</label>
          <input
            id={`${source.id}-author`}
            className="input"
            value={source.author}
            onChange={(e) => set("author", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor={`${source.id}-role`}>Author role</label>
          <input
            id={`${source.id}-role`}
            className="input"
            value={source.authorRole}
            onChange={(e) => set("authorRole", e.target.value)}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor={`${source.id}-date`}>Date</label>
        <input
          id={`${source.id}-date`}
          className="input"
          type="date"
          value={source.date}
          onChange={(e) => set("date", e.target.value)}
        />
      </div>
      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor={`${source.id}-text`}>Feedback text</label>
        <textarea
          id={`${source.id}-text`}
          value={source.text}
          onChange={(e) => set("text", e.target.value)}
          placeholder="Paste client feedback here…"
        />
      </div>
    </article>
  );
}
