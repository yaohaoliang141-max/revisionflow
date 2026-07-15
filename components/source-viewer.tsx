"use client";
import { X } from "lucide-react";
import type { FeedbackSource, RevisionItem } from "@/lib/types";
export function SourceViewer({
  source,
  items,
  onClose,
}: {
  source: FeedbackSource;
  items: RevisionItem[];
  onClose: () => void;
}) {
  const quotes = items.flatMap((i) => i.evidence_quotes.filter((q) => q.source_ref === source.id));
  return (
    <div className="sideback" onMouseDown={onClose}>
      <aside
        className="side"
        role="dialog"
        aria-modal="true"
        aria-label={`Source ${source.id}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="btn small" style={{ float: "right" }} onClick={onClose}>
          <X size={14} /> Close
        </button>
        <span className="eyebrow">SOURCE {source.id}</span>
        <h2 style={{ marginTop: 7 }}>{source.name}</h2>
        <p className="muted">
          {source.channel} · {source.author || "Unknown author"}{" "}
          {source.authorRole && `(${source.authorRole})`} {source.date && `· ${source.date}`}
        </p>
        <h3>Original feedback</h3>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{source.text}</p>
        <h3>Evidence used in the report</h3>
        {quotes.length ? (
          quotes.map((q, i) => (
            <p className="quote" key={i}>
              {q.quote}
            </p>
          ))
        ) : (
          <p className="muted">
            No evidence quote from this source is attached to a revision item.
          </p>
        )}
      </aside>
    </div>
  );
}
