import type { FeedbackSource, ProjectContext } from "./types";

export const MAX_FILES = 10;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_TOTAL_CHARS = 80000;

export const nextFeedbackId = (sources: Pick<FeedbackSource, "id">[]) => {
  const highestId = sources.reduce(
    (max, source) => Math.max(max, Number(source.id.slice(1)) || 0),
    0,
  );

  return `F${String(highestId + 1).padStart(3, "0")}`;
};

export const removeFeedbackSource = (sources: FeedbackSource[], id: string) =>
  sources.filter((source) => source.id !== id);

export const appendFeedbackSources = (
  sources: FeedbackSource[],
  incoming: Omit<FeedbackSource, "id">[],
) => {
  let nextId = nextFeedbackId(sources);

  return [
    ...sources,
    ...incoming.map((source) => {
      const result = { ...source, id: nextId };
      nextId = nextFeedbackId([...sources, result]);
      return result;
    }),
  ];
};

export function totalFeedbackCharacters(sources: FeedbackSource[]) {
  return sources.reduce((total, source) => total + source.text.length, 0);
}

export function canAnalyse(
  project: ProjectContext,
  sources: FeedbackSource[],
  key: string,
  model: string,
) {
  return Boolean(
    project.name.trim() &&
    sources.some((source) => source.text.trim()) &&
    key.trim() &&
    model.trim() &&
    totalFeedbackCharacters(sources) <= MAX_TOTAL_CHARS,
  );
}
