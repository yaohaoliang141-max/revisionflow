import { describe, expect, it } from "vitest";
import {
  appendFeedbackSources,
  nextFeedbackId,
  removeFeedbackSource,
  totalFeedbackCharacters,
} from "@/lib/validation";
import type { FeedbackSource } from "@/lib/types";

const source = (id: string): FeedbackSource => ({
  id,
  name: id,
  channel: "Email",
  author: "",
  authorRole: "",
  date: "",
  text: "Feedback",
});

describe("feedback validation", () => {
  it("uses the highest existing numeric ID plus one", () => {
    expect(nextFeedbackId([{ id: "F001" }, { id: "F004" }])).toBe("F005");
  });

  it("keeps remaining source IDs stable after a deletion", () => {
    expect(
      removeFeedbackSource([source("F001"), source("F002"), source("F003")], "F002").map(
        (item) => item.id,
      ),
    ).toEqual(["F001", "F003"]);
  });

  it("keeps IDs stable when sources are reordered", () => {
    const sources = [source("F001"), source("F003"), source("F004")];
    const reordered = [sources[2], sources[0], sources[1]];
    expect(reordered.map((item) => item.id)).toEqual(["F004", "F001", "F003"]);
  });

  it("gives a manual source the next highest ID after gaps", () => {
    expect(nextFeedbackId([source("F001"), source("F003")])).toBe("F004");
  });

  it("imports files without changing existing IDs", () => {
    const existing = [source("F001"), source("F003")];
    const imported = appendFeedbackSources(existing, [
      { ...source("unused"), name: "Imported notes" },
      { ...source("unused"), name: "Imported CSV" },
    ]);
    expect(imported.map((item) => item.id)).toEqual(["F001", "F003", "F004", "F005"]);
  });

  it("counts total input text", () => {
    expect(
      totalFeedbackCharacters([
        { text: "abc" } as FeedbackSource,
        { text: "de" } as FeedbackSource,
      ]),
    ).toBe(5);
  });
});
