import { NextRequest, NextResponse } from "next/server";
import { analysisJsonSchema, analysisRequestSchema, analysisResultSchema } from "@/lib/schema";
import { formatAnalysisInput, SYSTEM_PROMPT } from "@/lib/prompt";
import { MAX_TOTAL_CHARS, totalFeedbackCharacters } from "@/lib/validation";
import { safeOpenRouterError } from "@/lib/openrouter";
import type { FeedbackSource, ProjectContext } from "@/lib/types";
const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: NextRequest) {
  const key = request.headers.get("x-openrouter-key");
  if (!key)
    return json(
      {
        success: false,
        error: { code: "INVALID_INPUT", message: "Enter an OpenRouter API key before analysing." },
      },
      400,
    );
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(
      {
        success: false,
        error: { code: "INVALID_INPUT", message: "The analysis request was invalid." },
      },
      400,
    );
  }
  const parsed = analysisRequestSchema.safeParse(body);
  if (!parsed.success)
    return json(
      {
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Add a project name, model and at least one non-empty feedback source.",
        },
      },
      400,
    );
  if (totalFeedbackCharacters(parsed.data.sources as FeedbackSource[]) > MAX_TOTAL_CHARS)
    return json(
      {
        success: false,
        error: {
          code: "INPUT_TOO_LARGE",
          message:
            "Feedback exceeds the 80,000 character limit. Remove or shorten feedback before analysing.",
        },
      },
      400,
    );
  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: parsed.data.model,
        temperature: 0.1,
        max_tokens: 6000,
        provider: { require_parameters: true },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: formatAnalysisInput(
              parsed.data.project as ProjectContext,
              parsed.data.sources as FeedbackSource[],
            ),
          },
        ],
        response_format: { type: "json_schema", json_schema: analysisJsonSchema },
      }),
      cache: "no-store",
    });
    if (!upstream.ok) {
      const error = safeOpenRouterError(upstream.status);
      return json({ success: false, error }, upstream.status);
    }
    const response = await upstream.json();
    const content = response?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string")
      return json(
        {
          success: false,
          error: {
            code: "INVALID_MODEL_RESPONSE",
            message:
              "The selected model returned an empty response. Try a model that supports strict structured output.",
          },
        },
        422,
      );
    let data: unknown;
    try {
      data = JSON.parse(content);
    } catch {
      return json(
        {
          success: false,
          error: {
            code: "INVALID_MODEL_RESPONSE",
            message:
              "The selected model did not return valid structured data. Choose a model that supports strict JSON schema output.",
          },
        },
        422,
      );
    }
    const verified = analysisResultSchema.safeParse(data);
    if (!verified.success)
      return json(
        {
          success: false,
          error: {
            code: "STRUCTURED_OUTPUT_UNSUPPORTED",
            message:
              "The selected model did not return the required structured revision report. Choose a model with strict JSON schema support.",
          },
        },
        422,
      );
    return json({
      success: true,
      data: verified.data,
      usage: response.usage ?? {},
      model: response.model ?? parsed.data.model,
    });
  } catch {
    return json(
      {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Could not reach OpenRouter. Check your connection and try again.",
        },
      },
      503,
    );
  }
}
