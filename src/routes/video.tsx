/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Film,
  Sparkles,
  Loader2,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const Route = createFileRoute("/video")({
  head: () => ({
    meta: [
      { title: "Video Studio \u00b7 Operiq AI" },
      {
        name: "description",
        content: "Generate AI videos from text descriptions.",
      },
    ],
  }),
  component: VideoPage,
});

const STYLES = ["Cinematic", "Animation", "Realistic", "Abstract"] as const;

function VideoPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<string>("Cinematic");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [modKey, setModKey] = useState("\u2318");
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setModKey(navigator.platform?.includes("Mac") ? "\u2318" : "Ctrl");
  }, []);

  const generateVideo = useCallback(async () => {
    const p = prompt.trim();
    if (!p || loading) return;
    setLoading(true);
    setVideoUrl(null);
    setError(null);
    try {
      const response = await fetch("/api/huggingface-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `${style}: ${p}` }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Failed");
      setVideoUrl(data.video);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to generate video";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [prompt, style, loading]);

  async function copy() {
    if (!videoUrl) return;
    try {
      await navigator.clipboard.writeText(videoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  }

  // Keyboard shortcut: Cmd+Enter to generate
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        generateVideo();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [generateVideo]);

  // Scroll to result when video appears
  useEffect(() => {
    if (videoUrl && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [videoUrl]);

  function pillClass(active: boolean) {
    return active
      ? "bg-accent text-accent-foreground shadow-sm"
      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50";
  }

  return (
    <AppShell>
      <div className="h-full flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-[680px] space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Video Studio</h1>
            <p className="text-sm text-muted-foreground">Generate AI videos from text descriptions</p>
          </div>

          {/* Style pills */}
          <div className="flex flex-wrap justify-center items-center gap-2">
            {STYLES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStyle(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${pillClass(style === s)}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Prompt textarea */}
          <Textarea
            ref={promptRef}
            placeholder="Describe the video you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full bg-card/50 border border-border/60 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 resize-vertical focus:outline-none focus:border-accent/40 transition-colors"
          />

          {/* Generate button - centered pill */}
          <div className="flex justify-center">
            <Button
              onClick={generateVideo}
              disabled={loading || !prompt.trim()}
              className="rounded-full px-8 bg-accent/80 hover:bg-accent text-accent-foreground"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Film className="size-4 mr-2" /> Generate Video
                </>
              )}
            </Button>
          </div>

          {/* Keyboard shortcut hint */}
          <div className="text-center">
            <span className="text-xs text-muted-foreground">
              Press{" "}
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/30 text-[11px] font-mono text-muted-foreground">
                {modKey}+Enter
              </kbd>{" "}
              to generate
            </span>
          </div>

          {/* Loading skeleton */}
          {loading && !videoUrl && (
            <div className="mt-10 space-y-3 animate-pulse">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-7 rounded-lg bg-muted/50" />
                <div className="h-3 w-40 rounded bg-muted/50" />
                <div className="h-3 w-16 rounded bg-muted/30" />
              </div>
              {[85, 70, 90, 55, 75, 60, 80].map((w, i) => (
                <div key={i} className="h-2.5 rounded bg-muted/40" style={{ width: `${w}%` }} />
              ))}
            </div>
          )}

          {/* Result */}
          {videoUrl && (
            <div ref={resultRef} className="rounded-xl border border-border bg-card p-6 space-y-3">
              {/* AI header bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">Operiq AI</span>
                  <span className="text-[10px] text-muted-foreground/50">&middot;</span>
                  <span className="text-[11px] text-muted-foreground/50">Just now</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copy}
                    className="h-7 px-2 text-xs gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-accent" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" /> Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Video content */}
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <video
                  controls
                  src={videoUrl}
                  className="w-full object-contain"
                />
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 rounded-lg px-3 py-2 text-[11px] text-muted-foreground/60">
                <ShieldCheck className="size-3 mt-0.5 shrink-0" />
                <p>
                  AI-generated video. Review for accuracy, appropriateness, and potential bias before using or distributing it.
                </p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && !videoUrl && !loading && (
            <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Subtle empty hint */}
          {!videoUrl && !loading && !error && (
            <div className="mt-16 text-center">
              <div className="size-10 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="size-4 text-accent/60" />
              </div>
              <p className="text-sm text-muted-foreground/50">
                Describe the video you want and click Generate
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
