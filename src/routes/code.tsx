/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Loader2, Code2, Cpu } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CODE_MODELS, CODE_MODEL_STORAGE_KEY, MODEL_MAP } from "@/lib/models";

export const Route = createFileRoute("/code")({
  head: () => ({
    meta: [
      { title: "Operiq Code \u00b7 Operiq AI" },
      {
        name: "description",
        content: "AI-powered coding assistant — write, debug, and review code.",
      },
    ],
  }),
  component: CodePage,
});



function CodePage() {
  const [selectedModel, setSelectedModel] = useState(() => {
    if (typeof window === "undefined") return CODE_MODELS[3].id;
    return window.localStorage.getItem(CODE_MODEL_STORAGE_KEY) || CODE_MODELS[3].id;
  });
  const modelRef = useRef(selectedModel);

  useEffect(() => {
    modelRef.current = selectedModel;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CODE_MODEL_STORAGE_KEY, selectedModel);
    }
  }, [selectedModel]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/code",
        headers: () => ({ "x-operiq-model": MODEL_MAP[modelRef.current] || modelRef.current }),
      }),
    []
  );

  const { messages, sendMessage, status, error } = useChat({
    transport,
  });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function onSend() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    sendMessage(trimmed);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 lg:px-8 h-14 border-b border-border shrink-0">
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Code2 className="size-4" />
          </span>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Operiq Code</h1>
            <p className="text-[11px] text-muted-foreground">AI coding assistant</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6">
          <div className="max-w-[720px] mx-auto py-6 space-y-6">
            {messages.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center text-center pt-16 pb-8">
                <div className="size-12 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center mb-4">
                  <Code2 className="size-6 text-accent/60" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-1">What are you building?</h2>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Ask me to create a project, write code, debug errors, or review your work.
                </p>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "assistant" && (
                  <div className="size-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="size-2 rounded-full bg-accent" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] ${
                    m.role === "user"
                      ? "bg-accent/10 text-foreground rounded-2xl rounded-tr-md px-4 py-2.5"
                      : "text-foreground"
                  }`}
                >
                  {m.role === "user" ? (
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <div className="prose-flow text-sm">
                      <MarkdownView>{m.content}</MarkdownView>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-3">
                <div className="size-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="size-2 rounded-full bg-accent animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="text-sm">Thinking</span>
                  <span className="flex gap-0.5">
                    <span className="size-1 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="size-1 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="size-1 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                Something went wrong. Please try again.
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-border shrink-0 px-4 lg:px-6 py-4">
          <div className="max-w-[720px] mx-auto">
            <div className="relative rounded-xl border border-border bg-card shadow-sm focus-within:border-muted-foreground/50 transition-colors">
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-3 pt-2 pb-1">
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="h-7 w-auto min-w-0 px-2 py-0 text-[11px] rounded-md bg-transparent border-0 text-muted-foreground hover:text-foreground hover:bg-muted focus:ring-0 gap-1 shrink-0">
                    <Cpu className="size-3.5" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border min-w-[200px]">
                    {CODE_MODELS.map((m) => (
                      <SelectItem key={m.id} value={m.id} className="text-sm cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-medium">{m.label}</span>
                          <span className="text-[11px] text-muted-foreground">{m.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask a coding question..."
                rows={1}
                disabled={isLoading}
                className="w-full min-h-[44px] max-h-[200px] bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/40 resize-none disabled:opacity-50 px-3 py-3 pr-12"
              />
              <button
                onClick={onSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 bottom-1.5 size-8 rounded-lg bg-foreground text-background hover:bg-foreground/90 flex items-center justify-center shrink-0 transition-opacity disabled:opacity-30"
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground/50 mt-2 text-center">
              Operiq Code can make mistakes. Review generated code before using it.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}