/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import type { ToolDefinition } from "./types";

const MAX_CONTENT_LENGTH = 50000;
const FETCH_TIMEOUT_MS = 15000;

const REQUEST_HEADERS = {
  "User-Agent": "OperiqAI/1.0 (compatible; +https://operiq.ai)",
  Accept:
    "text/html,application/json,text/plain;q=0.9,*/*;q=0.8",
};

export const fetchUrlTool: ToolDefinition = {
  name: "fetch_url",
  description:
    "Fetch content from a URL and extract readable text. Use this to retrieve web pages, JSON data, or plain text documents. Handles HTML to text extraction automatically.",
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "The URL to fetch content from",
      },
      extract: {
        type: "string",
        enum: ["text", "full"],
        description:
          "Extraction mode: 'text' strips HTML tags and returns readable text, 'full' returns the raw content. Default: 'text'",
      },
    },
    required: ["url"],
  },
  execute: async (params: Record<string, unknown>) => {
    const url = String(params.url || "");
    const extract = String(params.extract || "text");

    if (!url.trim()) {
      return { success: false, output: "", error: "URL is required" };
    }

    // Basic URL validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return { success: false, output: "", error: "Invalid URL format" };
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return {
        success: false,
        output: "",
        error: "Only HTTP and HTTPS URLs are supported",
      };
    }

    // Basic robots.txt check
    const robotsAllowed = await checkRobotsTxt(parsedUrl);
    if (!robotsAllowed) {
      return {
        success: false,
        output: "",
        error: `Access to ${parsedUrl.pathname} is disallowed by robots.txt`,
      };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const response = await fetch(parsedUrl.toString(), {
        method: "GET",
        headers: REQUEST_HEADERS,
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return {
          success: false,
          output: "",
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const json = await response.json();
        const jsonStr = JSON.stringify(json, null, 2);
        return {
          success: true,
          output: limitContent(jsonStr),
          metadata: { url: parsedUrl.toString(), contentType, length: jsonStr.length },
        };
      }

      const raw = await response.text();

      if (extract === "full") {
        return {
          success: true,
          output: limitContent(raw),
          metadata: { url: parsedUrl.toString(), contentType, length: raw.length },
        };
      }

      // Extract text from HTML
      const extracted = contentType.includes("text/html")
        ? extractTextFromHtml(raw)
        : raw;

      return {
        success: true,
        output: limitContent(extracted),
        metadata: {
          url: parsedUrl.toString(),
          contentType,
          originalLength: raw.length,
          extractedLength: extracted.length,
        },
      };
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return {
          success: false,
          output: "",
          error: "Request timed out",
        };
      }
      return {
        success: false,
        output: "",
        error: err instanceof Error ? err.message : "Failed to fetch URL",
      };
    }
  },
};

function limitContent(text: string): string {
  if (text.length <= MAX_CONTENT_LENGTH) return text;
  const truncated = text.slice(0, MAX_CONTENT_LENGTH);
  return `${truncated}\n\n... [Content truncated at ${MAX_CONTENT_LENGTH} characters. Original length: ${text.length}]`;
}

async function checkRobotsTxt(parsedUrl: URL): Promise<boolean> {
  try {
    const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(robotsUrl, {
      headers: REQUEST_HEADERS,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) return true; // No robots.txt = allowed

    const text = await response.text();
    return isAllowedByRobots(text, parsedUrl.pathname);
  } catch {
    return true; // If we can't check, allow by default
  }
}

function isAllowedByRobots(robotsTxt: string, path: string): boolean {
  const lines = robotsTxt.split("\n");
  let currentAgent = "";
  let disallowed = false;

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();

    if (trimmed.startsWith("user-agent:")) {
      const agent = trimmed.slice("user-agent:".length).trim();
      currentAgent = agent;
    } else if (trimmed.startsWith("disallow:")) {
      const rule = trimmed.slice("disallow:".length).trim();

      if (
        currentAgent === "*" ||
        currentAgent === "operiqai" ||
        currentAgent.includes("operiq") ||
        currentAgent === ""
      ) {
        if (rule === "/") {
          disallowed = true;
          break;
        }
        if (rule && path.startsWith(rule)) {
          disallowed = true;
          break;
        }
      }
    }
  }

  return !disallowed;
}

function extractTextFromHtml(html: string): string {
  // Remove script and style elements
  let text = html.replace(
    /<(script|style|noscript|iframe|svg|canvas)[\s\S]*?<\/\1>/gi,
    " ",
  );

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, "");

  // Replace block elements with newlines
  text = text.replace(
    /<\/(div|p|h[1-6]|li|tr|article|section|header|footer|main|nav|aside|blockquote|pre|table|form|fieldset|figcaption|figure|details|summary|dialog)>/gi,
    "\n",
  );
  text = text.replace(/<(br|hr)[^>]*\/?>/gi, "\n");

  // Remove remaining HTML tags
  text = text.replace(/<[^>]*>/g, " ");

  // Decode HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));

  // Collapse whitespace
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n{3,}/g, "\n\n");
  text = text.trim();

  return text;
}
