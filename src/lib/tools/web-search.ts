/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import type { ToolDefinition } from "./types";

const DUCKDUCKGO_JSON_API = "https://api.duckduckgo.com/";
const DUCKDUCKGO_HTML_API = "https://html.duckduckgo.com/html/";

interface DDGJsonResult {
  Abstract?: string;
  AbstractText?: string;
  AbstractSource?: string;
  AbstractURL?: string;
  Answer?: string;
  AnswerType?: string;
  RelatedTopics?: Array<{
    Text?: string;
    FirstURL?: string;
  }>;
  Results?: Array<{
    Text?: string;
    FirstURL?: string;
  }>;
}

export const webSearchTool: ToolDefinition = {
  name: "web_search",
  description:
    "Search the web using DuckDuckGo. Returns formatted search results with titles, URLs, and snippets. Use this to find current information, facts, or answer questions about any topic.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query to look up on the web",
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results to return (default: 5)",
      },
    },
    required: ["query"],
  },
  execute: async (params: Record<string, unknown>) => {
    const query = String(params.query || "");
    const maxResults = Number(params.maxResults) || 5;

    if (!query.trim()) {
      return { success: false, output: "", error: "Query is required" };
    }

    const encodedQuery = encodeURIComponent(query.trim());

    try {
      // Try JSON API first
      const jsonUrl = `${DUCKDUCKGO_JSON_API}?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`;
      const jsonResponse = await fetch(jsonUrl, {
        headers: {
          "User-Agent": "OperiqAI/1.0",
        },
      });

      if (jsonResponse.ok) {
        const data: DDGJsonResult = await jsonResponse.json();
        const results = formatDDGJsonResults(data, maxResults);
        if (results) {
          return {
            success: true,
            output: results,
            metadata: { source: "duckduckgo_json_api", query },
          };
        }
      }

      // Fallback to HTML API
      const htmlUrl = `${DUCKDUCKGO_HTML_API}?q=${encodedQuery}`;
      const htmlResponse = await fetch(htmlUrl, {
        headers: {
          "User-Agent": "OperiqAI/1.0",
        },
      });

      if (htmlResponse.ok) {
        const html = await htmlResponse.text();
        const results = parseDDGHTML(html, maxResults);
        if (results) {
          return {
            success: true,
            output: results,
            metadata: { source: "duckduckgo_html", query },
          };
        }
      }

      return {
        success: false,
        output: "",
        error: "No search results found",
      };
    } catch (err) {
      return {
        success: false,
        output: "",
        error: err instanceof Error ? err.message : "Search request failed",
      };
    }
  },
};

function formatDDGJsonResults(
  data: DDGJsonResult,
  maxResults: number,
): string | null {
  const parts: string[] = [];

  // Instant answer
  if (data.Answer) {
    parts.push(`**Answer:** ${data.Answer}\n`);
  }
  if (data.AbstractText) {
    parts.push(`**Abstract:** ${data.AbstractText}`);
    if (data.AbstractURL) {
      parts.push(`Source: ${data.AbstractURL}`);
    }
    parts.push("");
  }

  // Results from Results array
  if (data.Results && data.Results.length > 0) {
    parts.push("**Web Results:**\n");
    for (const result of data.Results.slice(0, maxResults)) {
      const text = result.Text || "";
      const url = result.FirstURL || "";
      parts.push(`- [${text}](${url})`);
    }
  }

  // Related topics as additional results
  if (data.RelatedTopics && data.RelatedTopics.length > 0) {
    const topics = data.RelatedTopics.filter(
      (t): t is { Text: string; FirstURL: string } =>
        Boolean(t.Text && t.FirstURL),
    );
    if (topics.length > 0 && parts.length === 0) {
      parts.push("**Search Results:**\n");
      for (const topic of topics.slice(0, maxResults)) {
        parts.push(`- [${topic.Text}](${topic.FirstURL})`);
      }
    }
  }

  return parts.length > 0 ? parts.join("\n") : null;
}

function parseDDGHTML(html: string, maxResults: number): string | null {
  // Extract result links and snippets from DuckDuckGo HTML page
  const parts: string[] = [];
  const resultRegex =
    /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>\s*<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

  let match;
  let count = 0;

  while ((match = resultRegex.exec(html)) !== null && count < maxResults) {
    const url = decodeURIComponent(match[1].replace(/\/\/duckduckgo\.com\/l\/\?uddg=/, ""));
    const title = stripHtml(match[2]).trim();
    const snippet = stripHtml(match[3]).trim();

    if (title && url) {
      parts.push(`- **${title}**\n  ${snippet}\n  ${url}`);
      count++;
    }
  }

  if (parts.length === 0) {
    // Fallback: look for general result links
    const linkRegex = /<a[^>]*class="result__url"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    while ((match = linkRegex.exec(html)) !== null && count < maxResults) {
      const url = match[1];
      const text = stripHtml(match[2]).trim();
      if (text && url) {
        parts.push(`- [${text}](${url})`);
        count++;
      }
    }
  }

  return parts.length > 0 ? `**Search Results:**\n${parts.join("\n")}` : null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/\s+/g, " ");
}
