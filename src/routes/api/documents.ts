/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 *
 * Document upload API route for file upload and AI summarization.
 * Accepts multipart form data via POST at /api/documents.
 */

import { createFileRoute } from "@tanstack/react-router";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const SUPPORTED_EXTENSIONS = [".txt", ".md", ".json"];

const CONVEX_URL =
  process.env.CONVEX_URL ?? process.env.VITE_CONVEX_URL ?? "";

export const Route = createFileRoute("/api/documents")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Check content type
        const contentType = request.headers.get("content-type") || "";
        if (!contentType.includes("multipart/form-data")) {
          return Response.json(
            { error: "Content-Type must be multipart/form-data" },
            { status: 400 },
          );
        }

        // Get cookies from the client request for Convex auth
        const cookies = request.headers.get("cookie") || "";

        try {
          const formData = await request.formData();
          const file = formData.get("file");

          if (!file || !(file instanceof File)) {
            return Response.json(
              { error: "No file provided. Send a 'file' field in multipart form data." },
              { status: 400 },
            );
          }

          // Validate file extension
          const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
          if (!SUPPORTED_EXTENSIONS.includes(ext)) {
            return Response.json(
              {
                error: `Unsupported file type: ${ext}. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}`,
              },
              { status: 400 },
            );
          }

          // Validate file size
          if (file.size > MAX_FILE_SIZE) {
            return Response.json(
              { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.` },
              { status: 400 },
            );
          }

          // Extract text content
          let content: string;
          try {
            content = await file.text();
          } catch {
            return Response.json(
              { error: "Failed to read file content" },
              { status: 400 },
            );
          }

          if (!content.trim()) {
            return Response.json(
              { error: "File is empty" },
              { status: 400 },
            );
          }

          // Call Convex upload mutation
          if (!CONVEX_URL) {
            return Response.json(
              { error: "Backend not configured" },
              { status: 500 },
            );
          }

          const resp = await fetch(`${CONVEX_URL}/api/mutation`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              cookie: cookies,
            },
            body: JSON.stringify({
              path: "documents:upload",
              args: {
                filename: file.name,
                content,
              },
              format: "json",
            }),
          });

          if (!resp.ok) {
            const errorText = await resp.text();
            return Response.json(
              { error: `Upload failed: ${errorText}` },
              { status: resp.status },
            );
          }

          const data = (await resp.json()) as {
            value?: { documentId: string; summary: string | null };
          };

          if (!data.value) {
            return Response.json(
              { error: "Upload failed — no response from backend" },
              { status: 500 },
            );
          }

          return Response.json({
            success: true,
            documentId: data.value.documentId,
            summary: data.value.summary,
          });
        } catch (err) {
          console.error("Document upload error:", err);
          return Response.json(
            { error: err instanceof Error ? err.message : "Upload failed" },
            { status: 500 },
          );
        }
      },
    },
  },
});
