# RevisionFlow

> Open-source MVP for turning scattered, duplicated, and contradictory client feedback into a traceable revision plan.

![Screenshot placeholder](docs/screenshot-placeholder.png)

RevisionFlow is a single-page workspace for creative and delivery teams. Paste feedback or upload source files, add a little project context, then use your own OpenRouter key to receive a strict, editable revision report.

## Features

- Project context and an optional owner-safe team list
- Multiple editable feedback sources with stable `F001` identifiers, reordering, and removal
- Browser-side TXT, Markdown, CSV, and DOCX extraction
- OpenRouter Chat Completions integration using strict JSON Schema output and server-side Zod validation
- Traceable revision items with direct source evidence
- Duplicate groups, contradictions, clarification questions, executive summary, and a client reply
- Editable revision items and client email
- Local CSV, Markdown, and JSON exports
- Built-in project and report preview that works without an API key

## How it works

1. Add the project name, type, context, and optional team members.
2. Paste feedback, add sources, or upload supported files.
3. Enter a current OpenRouter API key and a model ID with strict structured-output support.
4. Run analysis. The API validates the model result before it is shown.
5. Review, edit, trace evidence, and export locally.

## Privacy model

There are no accounts, databases, cookies, browser storage, or saved project history. The API key remains only in current React state and is cleared on refresh. When analysis is requested, extracted project content and the key are sent through the server route to OpenRouter and the chosen model provider. Provider data policies apply; do not submit confidential information unless those policies are acceptable.

## Supported file types

| Type | Handling |
| --- | --- |
| `.txt`, `.md` | Plain text extraction |
| `.csv` | Browser-side Papa Parse conversion to labelled rows |
| `.docx` | Browser-side Mammoth raw-text extraction |

Files are limited to 5 MB each, 10 files total, and 80,000 extracted characters across all feedback.

## Local installation

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## OpenRouter API key

Use your own key in the workspace for the current analysis only. Select a model that supports OpenRouter strict JSON Schema output; RevisionFlow intentionally does not silently switch models or fall back to freeform text.

## Development commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run start
```

## Deployment

This is a standard Next.js application. Deploy it to Vercel, a Node-compatible container, or another Next.js host. No environment variables are required because the user supplies the OpenRouter key per analysis. Ensure the host permits outbound HTTPS requests to `openrouter.ai`.

## Limitations

This is an open-source MVP, not a hosted collaboration platform. It has no user accounts, persistence, team collaboration, PDFs/OCR/audio/video parsing, provider integrations, or automated edits or emails. Model output quality depends on the chosen provider and supplied feedback.

## Roadmap

- Gmail, Slack, and Frame.io integrations
- Jira, Trello, and Notion export
- Shared team projects and saved project history
- Client review portal and organisation templates

## Contributing

Issues and focused pull requests are welcome. Please run linting, type checks, and tests before opening a change.

## License

[MIT](LICENSE)

## Disclaimer

RevisionFlow organises supplied project feedback. It does not replace project judgment, client approval, or legal review.

## 简短中文说明

这是一个开源 MVP：将客户反馈整理为可追溯、可编辑、可导出的修改计划。请使用自己的 OpenRouter Key，并了解所选模型提供商的数据政策。
