import { describe, expect, it } from "vitest";import { nextFeedbackId, totalFeedbackCharacters } from "@/lib/validation";
describe("feedback validation",()=>{it("generates sequential feedback ids",()=>expect(nextFeedbackId([{id:"F001"},{id:"F004"}])).toBe("F005"));it("counts total input text",()=>expect(totalFeedbackCharacters([{text:"abc"} as any,{text:"de"} as any])).toBe(5))});
