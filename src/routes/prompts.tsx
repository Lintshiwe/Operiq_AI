/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Bookmark,
  Plus,
  Copy,
  Trash2,
  X,
  Search,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/prompts")({
  head: () => ({
    meta: [
      { title: "Prompt Library · Operiq AI" },
      { name: "description", content: "Save and reuse custom prompts" },
    ],
  }),
  component: PromptsPage,
});

const CATEGORIES = ["Email", "Meeting", "Planning", "Research", "Code", "Custom"];

const CATEGORY_COLORS: Record<string, string> = {
  Email: "bg-blue-100 text-blue-800",
  Meeting: "bg-purple-100 text-purple-800",
  Planning: "bg-green-100 text-green-800",
  Research: "bg-amber-100 text-amber-800",
  Code: "bg-rose-100 text-rose-800",
  Custom: "bg-gray-100 text-gray-800",
};

type Prompt = {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: number;
};

const STORAGE_KEY = "operiq-prompts";

function loadPrompts(): Prompt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Prompt[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePrompts(prompts: Prompt[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Custom");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    setPrompts(loadPrompts());
  }, []);

  const filtered = useMemo(() => {
    let result = prompts;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }
    return result.sort((a, b) => b.createdAt - a.createdAt);
  }, [prompts, search, selectedCategory]);

  function openAdd() {
    setEditingPrompt(null);
    setTitle("");
    setContent("");
    setCategory("Custom");
    setDialogOpen(true);
  }

  function openEdit(p: Prompt) {
    setEditingPrompt(p);
    setTitle(p.title);
    setContent(p.content);
    setCategory(p.category);
    setDialogOpen(true);
  }

  function handleSave() {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    const next = [...prompts];
    if (editingPrompt) {
      const idx = next.findIndex((p) => p.id === editingPrompt.id);
      if (idx !== -1) {
        next[idx] = { ...editingPrompt, title: title.trim(), content: content.trim(), category };
      }
    } else {
      next.push({
        id: "p_" + Date.now().toString(36),
        title: title.trim(),
        content: content.trim(),
        category,
        createdAt: Date.now(),
      });
    }
    setPrompts(next);
    savePrompts(next);
    setDialogOpen(false);
    toast.success(editingPrompt ? "Prompt updated" : "Prompt saved");
  }

  function handleDelete(id: string) {
    const next = prompts.filter((p) => p.id !== id);
    setPrompts(next);
    savePrompts(next);
    toast.success("Prompt deleted");
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard");
    });
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 lg:px-6 py-6 sm:py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Prompt Library</h1>
              <p className="mt-1 text-sm text-muted-foreground">Save and reuse your favorite prompts.</p>
            </div>
            <Button onClick={openAdd} className="shrink-0">
              <Plus className="size-4 mr-1.5" />
              Add prompt
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory("All")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                  selectedCategory === "All"
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                    selectedCategory === c
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Bookmark className="mx-auto size-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                {prompts.length === 0 ? "No prompts yet. Add your first one!" : "No prompts match your search."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="group rounded-xl border border-border bg-card p-4 flex flex-col gap-3 hover:border-muted-foreground/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-foreground truncate">{p.title}</h3>
                      <Badge variant="secondary" className={cn("mt-1 text-[10px]", CATEGORY_COLORS[p.category] || "")}>
                        <Tag className="size-3 mr-1" />
                        {p.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Edit"
                      >
                        <Bookmark className="size-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 flex-1">{p.content}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleCopy(p.content)}
                  >
                    <Copy className="size-3.5 mr-1.5" />
                    Copy to clipboard
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPrompt ? "Edit prompt" : "Add new prompt"}</DialogTitle>
            <DialogDescription>
              {editingPrompt ? "Update your saved prompt." : "Save a prompt you use often."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Follow-up email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your prompt text..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="size-4 mr-1.5" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Bookmark className="size-4 mr-1.5" />
              {editingPrompt ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
