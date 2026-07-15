"use client";

import { Upload } from "lucide-react";
import { useState } from "react";
import { parseFeedbackFile } from "@/lib/file-parsers";
import { MAX_FILE_BYTES, MAX_FILES } from "@/lib/validation";
import type { FeedbackSource } from "@/lib/types";

export function FileUpload({
  count,
  onAdd,
  onError,
}: {
  count: number;
  onAdd: (files: Omit<FeedbackSource, "id">[]) => void;
  onError: (message: string) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;

    const files = Array.from(fileList);
    if (count + files.length > MAX_FILES) {
      onError(`You can upload up to ${MAX_FILES} files in total.`);
      return;
    }

    try {
      const parsedFiles = await Promise.all(
        files.map(async (file) => {
          if (file.size > MAX_FILE_BYTES) {
            throw new Error(`${file.name} exceeds the 5 MB file limit.`);
          }

          return {
            name: file.name,
            channel: "Document" as const,
            author: "",
            authorRole: "",
            date: "",
            text: await parseFeedbackFile(file),
          };
        }),
      );

      onAdd(parsedFiles);
      setUploadMessage(
        `${parsedFiles.length} ${parsedFiles.length === 1 ? "file" : "files"} added and ready to edit.`,
      );
    } catch (error) {
      onError(error instanceof Error ? error.message : "A file could not be parsed.");
    }
  }

  return (
    <div
      className={`drop ${isDragging ? "dragging" : ""}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        void handleFiles(event.dataTransfer.files);
      }}
    >
      <Upload size={19} aria-hidden="true" />
      <strong>Drop feedback files here</strong>
      <div className="note">TXT, MD, CSV or DOCX · up to 5 MB each · 10 files maximum</div>
      <label className="btn small">
        <input
          type="file"
          multiple
          accept=".txt,.md,.csv,.docx"
          onChange={(event) => void handleFiles(event.target.files)}
        />
        Choose files
      </label>
      <p className="confirmation" role="status" aria-live="polite">
        {uploadMessage}
      </p>
    </div>
  );
}
