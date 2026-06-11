/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import {
  ArrowLeft,
  Check,
  CreditCard,
  ExternalLink,
  Globe,
  HardDrive,
  Loader2,
  Mail,
  Moon,
  Palette,
  RefreshCw,
  Settings,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · Operiq AI" },
      { name: "description", content: "Operiq AI settings" },
    ],
  }),
  component: SettingsPage,
});

type Section = "general" | "personalization" | "billing" | "storage" | "contact";

const SECTIONS: {
  id: Section;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string;
}[] = [
  { id: "general", label: "General", icon: Settings },
  { id: "personalization", label: "Personalization", icon: Palette },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "contact", label: "Contact", icon: User },
];

const ACCENT_COLORS = [
  { value: "#10a37f", label: "Green" },
  { value: "#2563eb", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
];

function SettingsPage() {
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("general");
  const [accentColor, setAccentColor] = useState("#10a37f");
  const [contrast, setContrast] = useState<"default" | "high">("default");
  const [enableDictation, setEnableDictation] = useState(false);
  const [separateVoice, setSeparateVoice] = useState(false);
  const [language, setLanguage] = useState("en");
  const [spokenLanguage, setSpokenLanguage] = useState("English");
  const [voice, setVoice] = useState("Aria");
  const [referenceMemories, setReferenceMemories] = useState(false);
  const [referenceHistory, setReferenceHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("operiq-theme");
    if (saved === "dark") {
      setIsDark(true);
    } else if (saved === "light") {
      setIsDark(false);
    } else {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
    setLanguage(localStorage.getItem("operiq-language") || "en");
    setSpokenLanguage(localStorage.getItem("operiq-spoken-language") || "English");
    setVoice(localStorage.getItem("operiq-voice") || "Aria");
    setReferenceMemories(localStorage.getItem("operiq-reference-memories") === "true");
    setReferenceHistory(localStorage.getItem("operiq-reference-history") === "true");
  }, []);

  function toggleDarkMode() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("operiq-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("operiq-theme", "light");
    }
  }

  return (
    <div className="flex h-dvh w-full bg-background text-foreground">
      {/* Settings sidebar */}
      <aside className="hidden md:flex w-[260px] shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex items-center gap-2 px-3 h-14">
          <img src="/logo-icon.png" alt="Operiq AI" className="size-9 rounded-lg" />
          <span className="font-semibold text-sm">Operiq</span>
          <span className="text-sm text-muted-foreground">AI</span>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          <Link
            to="/assistant"
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} />
            Back to assistant
          </Link>
          <div className="mt-4 space-y-0.5">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-left transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                  <span className="flex-1">{s.label}</span>
                  {s.badge && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {s.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Mobile header */}
        <header className="md:hidden h-14 flex items-center justify-between px-4 border-b border-border/60">
          <Link to="/assistant" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <NotificationBell />
        </header>

        {/* Mobile section selector */}
        <div className="md:hidden flex items-center gap-2 px-4 py-2 border-b border-border/60 overflow-x-auto">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="size-3.5" strokeWidth={1.75} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Desktop top bar with notification bell */}
        <div className="hidden md:flex items-center justify-end px-4 lg:px-6 h-12 border-b border-border/40">
          <NotificationBell />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-4 lg:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
            {activeSection === "general" && (
              <GeneralSection
                isDark={isDark}
                toggleDarkMode={toggleDarkMode}
                contrast={contrast}
                setContrast={setContrast}
                accentColor={accentColor}
                setAccentColor={setAccentColor}
                enableDictation={enableDictation}
                setEnableDictation={setEnableDictation}
                separateVoice={separateVoice}
                setSeparateVoice={setSeparateVoice}
                language={language}
                setLanguage={setLanguage}
                spokenLanguage={spokenLanguage}
                setSpokenLanguage={setSpokenLanguage}
                voice={voice}
                setVoice={setVoice}
              />
            )}
            {activeSection === "personalization" && (
              <PersonalizationSection
                referenceMemories={referenceMemories}
                setReferenceMemories={setReferenceMemories}
                referenceHistory={referenceHistory}
                setReferenceHistory={setReferenceHistory}
              />
            )}
            {activeSection === "billing" && <BillingSection />}
            {activeSection === "storage" && <StorageSection />}
            {activeSection === "contact" && <ContactSection />}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  General section                                                   */
/* ------------------------------------------------------------------ */

function GeneralSection({
  isDark,
  toggleDarkMode,
  contrast,
  setContrast,
  accentColor,
  setAccentColor,
  enableDictation,
  setEnableDictation,
  separateVoice,
  setSeparateVoice,
  language,
  setLanguage,
  spokenLanguage,
  setSpokenLanguage,
  voice,
  setVoice,
}: {
  isDark: boolean;
  toggleDarkMode: () => void;
  contrast: "default" | "high";
  setContrast: (v: "default" | "high") => void;
  accentColor: string;
  setAccentColor: (v: string) => void;
  enableDictation: boolean;
  setEnableDictation: (v: boolean) => void;
  separateVoice: boolean;
  setSeparateVoice: (v: boolean) => void;
  language: string;
  setLanguage: (v: string) => void;
  spokenLanguage: string;
  setSpokenLanguage: (v: string) => void;
  voice: string;
  setVoice: (v: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your preferences and account settings.</p>
      </div>

      {/* Appearance */}
      <section className="space-y-4">
        <SectionHeader icon={Palette} title="Appearance" />
        <div className="rounded-xl border border-border bg-card p-4 space-y-5">
          {/* Dark mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">Dark mode</p>
              <p className="text-xs text-muted-foreground">Toggle between light and dark interface themes.</p>
            </div>
            <ToggleSwitch checked={isDark} onCheckedChange={toggleDarkMode} />
          </div>

          <Separator />

          {/* Contrast */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Contrast</p>
            <div className="flex gap-2">
              <ContrastButton active={contrast === "default"} onClick={() => setContrast("default")}>
                Default
              </ContrastButton>
              <ContrastButton active={contrast === "high"} onClick={() => setContrast("high")}>
                High
              </ContrastButton>
            </div>
          </div>

          <Separator />

          {/* Accent color */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Accent color</p>
            <div className="flex items-center gap-3">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setAccentColor(c.value)}
                  aria-label={c.label}
                  className={cn(
                    "relative size-7 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
                    accentColor === c.value && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                  )}
                  style={{ backgroundColor: c.value }}
                >
                  {accentColor === c.value && (
                    <Check className="absolute inset-0 m-auto size-4 text-white" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Language & Speech */}
      <section className="space-y-4">
        <SectionHeader icon={Globe} title="Language & Speech" />
        <div className="rounded-xl border border-border bg-card p-4 space-y-5">
          {/* Language */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Language</p>
            <Select
              value={language}
              onValueChange={(v) => {
                setLanguage(v);
                localStorage.setItem("operiq-language", v);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (en)</SelectItem>
                <SelectItem value="es">Spanish (es)</SelectItem>
                <SelectItem value="fr">French (fr)</SelectItem>
                <SelectItem value="de">German (de)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Enable Dictation */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">Enable Dictation</p>
              <p className="text-xs text-muted-foreground">Use dictation in the chat composer.</p>
            </div>
            <ToggleSwitch checked={enableDictation} onCheckedChange={setEnableDictation} />
          </div>

          <Separator />

          {/* Spoken language */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Spoken language</p>
            <p className="text-xs text-muted-foreground">
              For best results, select the language you mainly speak. If it&apos;s not listed, it may still be supported
              via auto-detection.
            </p>
            <Select
              value={spokenLanguage}
              onValueChange={(v) => {
                setSpokenLanguage(v);
                localStorage.setItem("operiq-spoken-language", v);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select spoken language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="German">German</SelectItem>
                <SelectItem value="Japanese">Japanese</SelectItem>
                <SelectItem value="Korean">Korean</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Voice */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Voice</p>
            <Select
              value={voice}
              onValueChange={(v) => {
                setVoice(v);
                localStorage.setItem("operiq-voice", v);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Aria">Aria (Female)</SelectItem>
                <SelectItem value="Roger">Roger (Male)</SelectItem>
                <SelectItem value="Sarah">Sarah (Female)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Separate Voice */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground">Separate Voice</p>
              <p className="text-xs text-muted-foreground">
                Keep Operiq Voice in a separate full screen, without real time transcripts and visuals.
              </p>
            </div>
            <ToggleSwitch checked={separateVoice} onCheckedChange={setSeparateVoice} />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Personalization section                                           */
/* ------------------------------------------------------------------ */

function PersonalizationSection({
  referenceMemories,
  setReferenceMemories,
  referenceHistory,
  setReferenceHistory,
}: {
  referenceMemories: boolean;
  setReferenceMemories: (v: boolean) => void;
  referenceHistory: boolean;
  setReferenceHistory: (v: boolean) => void;
}) {
  const profile = useQuery(api.profiles.getProfile);
  const updateProfile = useMutation(api.profiles.updateProfile);
  const [customInstructions, setCustomInstructions] = useState("");
  const [nickname, setNickname] = useState("");
  const [occupation, setOccupation] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    setCustomInstructions(localStorage.getItem("operiq-custom-instructions") || "");
    setOccupation(localStorage.getItem("operiq-occupation") || "");
    setAboutMe(localStorage.getItem("operiq-about-me") || "");
  }, []);

  useEffect(() => {
    if (profile?.displayName) {
      setNickname(profile.displayName);
    }
  }, [profile]);

  async function handleNicknameSave() {
    if (!nickname.trim()) return;
    setSavingProfile(true);
    try {
      await updateProfile({ displayName: nickname.trim() });
      toast.success("Nickname saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save nickname");
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Personalization</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set how Operiq AI responds to you based on your preferences.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-5">
        {/* Custom instructions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Custom instructions</p>
          <Textarea
            value={customInstructions}
            onChange={(e) => {
              setCustomInstructions(e.target.value);
              localStorage.setItem("operiq-custom-instructions", e.target.value);
            }}
            placeholder="Tell Operiq how you want it to respond..."
            rows={4}
          />
        </div>
        <Separator />

        {/* Nickname */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Nickname</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNicknameSave}
              disabled={savingProfile || !nickname.trim()}
              className="h-7 text-xs hover:bg-accent/10 hover:text-accent"
            >
              {savingProfile ? <Loader2 className="size-3.5 animate-spin" /> : "Save"}
            </Button>
          </div>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your nickname"
          />
        </div>
        <Separator />

        {/* Occupation */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Occupation</p>
          <Input
            value={occupation}
            onChange={(e) => {
              setOccupation(e.target.value);
              localStorage.setItem("operiq-occupation", e.target.value);
            }}
            placeholder="Your occupation"
          />
        </div>
        <Separator />

        {/* More about you */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">More about you</p>
          <Textarea
            value={aboutMe}
            onChange={(e) => {
              setAboutMe(e.target.value);
              localStorage.setItem("operiq-about-me", e.target.value);
            }}
            placeholder="Share a bit more about yourself..."
            rows={4}
          />
        </div>
        <Separator />

        {/* Learn more */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Learn more</p>
          <Link
            to="/docs"
            className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
          >
            Read documentation
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
        <Separator />

        {/* Reference saved memories */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Reference saved memories</p>
            <p className="text-xs text-muted-foreground">Let Operiq save and use memories when responding.</p>
          </div>
          <Switch
            checked={referenceMemories}
            onCheckedChange={(v) => {
              setReferenceMemories(v);
              localStorage.setItem("operiq-reference-memories", String(v));
            }}
          />
        </div>
        <Separator />

        {/* Reference chat history */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Reference chat history</p>
            <p className="text-xs text-muted-foreground">Let Operiq reference recent conversations when responding.</p>
          </div>
          <Switch
            checked={referenceHistory}
            onCheckedChange={(v) => {
              setReferenceHistory(v);
              localStorage.setItem("operiq-reference-history", String(v));
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Billing section                                                   */
/* ------------------------------------------------------------------ */

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "R0",
    features: [
      "50 AI requests/day",
      "5 image generations/day",
      "50MB storage",
      "Basic support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "R19/month",
    features: [
      "500 AI requests/day",
      "50 image generations/day",
      "500MB storage",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "R99/month",
    features: [
      "Unlimited AI requests",
      "Unlimited image generations",
      "5GB storage",
      "Dedicated support",
    ],
  },
];

function BillingSection() {
  const billing = useQuery(api.billing.getBilling);
  const upgrade = useMutation(api.billing.upgradePlan);
  const cancel = useMutation(api.billing.cancelSubscription);
  const [upgradingId, setUpgradingId] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [billingTimedOut, setBillingTimedOut] = useState(false);
  const billingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (billing !== undefined) {
      setBillingTimedOut(false);
      if (billingTimeoutRef.current) clearTimeout(billingTimeoutRef.current);
      return;
    }
    billingTimeoutRef.current = setTimeout(() => setBillingTimedOut(true), 5000);
    return () => {
      if (billingTimeoutRef.current) clearTimeout(billingTimeoutRef.current);
    };
  }, [billing]);

  const currentPlan = (billing?.plan as string) || "free";

  async function handleUpgrade(planId: string) {
    setUpgradingId(planId);
    setBillingError(null);
    try {
      await upgrade({ plan: planId });
    } catch (e) {
      setBillingError(e instanceof Error ? e.message : "Failed to upgrade plan");
    } finally {
      setUpgradingId(null);
    }
  }

  async function handleCancel() {
    setBillingError(null);
    try {
      await cancel();
    } catch (e) {
      setBillingError(e instanceof Error ? e.message : "Failed to cancel subscription");
    }
  }

  if (billingTimedOut) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your billing and subscription settings.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Could not load billing. Please sign in again.
          </p>
          <Button variant="outline" onClick={() => { setBillingTimedOut(false); }}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (billing === undefined) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your billing and subscription settings.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-16" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your billing and subscription settings.</p>
      </div>

      {/* Current plan badge */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
        <div className="p-2 rounded-md bg-accent/10 text-accent">
          <CreditCard className="size-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Current plan</p>
          <p className="text-sm text-muted-foreground capitalize">{currentPlan}</p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {currentPlan}
        </Badge>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isPro = plan.id === "pro";
          return (
            <div
              key={plan.id}
              className={cn(
                "rounded-xl border bg-card p-6 space-y-4 flex flex-col",
                isPro && "border-accent/50 ring-1 ring-accent/20",
              )}
            >
              <div>
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="text-2xl font-bold text-foreground mt-1">{plan.price}</p>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-accent shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                variant={isCurrent ? "secondary" : "default"}
                disabled={isCurrent || upgradingId === plan.id}
                onClick={() => !isCurrent && handleUpgrade(plan.id)}
                className={cn(isCurrent ? "cursor-default" : "bg-accent text-accent-foreground hover:bg-accent/90")}
              >
                {upgradingId === plan.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : isCurrent ? (
                  "Current plan"
                ) : (
                  "Upgrade"
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {billingError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {billingError}
        </div>
      )}

      {currentPlan !== "free" && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={handleCancel}>
            Cancel subscription
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Demo billing — no real payments are processed.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Storage section                                                   */
/* ------------------------------------------------------------------ */

function StorageSection() {
  const billing = useQuery(api.billing.getBilling);
  const storageUsed = Number(billing?.storageUsed ?? 0);
  const storageLimit = Number(billing?.storageLimit ?? 50);
  const percentUsed = storageLimit > 0 ? Math.round((storageUsed / storageLimit) * 100) : 0;
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  function handleClearAllData() {
    const keysToClear = [
      "operiq-theme",
      "operiq-language",
      "operiq-spoken-language",
      "operiq-voice",
      "operiq-custom-instructions",
      "operiq-occupation",
      "operiq-about-me",
      "operiq-reference-memories",
      "operiq-reference-history",
      "operiq-linkedin",
      "operiq-github",
      "operiq-agent-mode",
      "operiq-model",
    ];
    for (const key of keysToClear) {
      localStorage.removeItem(key);
    }
    toast.success("Local data cleared successfully");
    setClearDialogOpen(false);
  }

  if (billing === undefined) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Storage</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your data storage and files.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Storage</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your data storage and files.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Storage used</span>
            <span className="text-sm text-muted-foreground">
              {storageUsed}MB / {storageLimit}MB
            </span>
          </div>
          <Progress value={percentUsed} />
          <p className="text-xs text-muted-foreground">{percentUsed}% used</p>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-foreground">Files</span>
          <p className="text-sm text-muted-foreground">No files uploaded yet</p>
        </div>

        <Button variant="outline" onClick={() => setClearDialogOpen(true)}>
          <Trash2 className="size-3.5 mr-1.5" />
          Clear all data
        </Button>
      </div>

      {/* Clear all data confirmation dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all local data</DialogTitle>
            <DialogDescription>
              This will clear all locally stored preferences and settings. Your Convex data (threads, profile) will remain intact.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAllData}>
              Clear data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Contact / Profile section                                         */
/* ------------------------------------------------------------------ */

function ContactSection() {
  const user = useQuery(api.users.me);
  const updateProfile = useMutation(api.profiles.updateProfile);
  const { signOut } = useAuthActions();
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLinkedIn, setEditLinkedIn] = useState("");
  const [editGitHub, setEditGitHub] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setEditLinkedIn(localStorage.getItem("operiq-linkedin") || "");
    setEditGitHub(localStorage.getItem("operiq-github") || "");
  }, []);

  if (user === undefined) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Contact</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your profile and public information.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Contact</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your profile and public information.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const name = user.name || user.email || "User";
  const initial = name.charAt(0).toUpperCase();
  const linkedInUrl = localStorage.getItem("operiq-linkedin") || "https://linkedin.com";
  const githubUrl = localStorage.getItem("operiq-github") || "https://github.com";

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      if (editName.trim()) {
        await updateProfile({ displayName: editName.trim() });
      }
      localStorage.setItem("operiq-linkedin", editLinkedIn.trim());
      localStorage.setItem("operiq-github", editGitHub.trim());
      toast.success("Profile updated successfully");
      setEditOpen(false);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Failed to update profile";
      setSaveError(errMsg);
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  }

  const deleteAccount = useMutation(api.users.deleteAccount);

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      // Delete Convex data
      await deleteAccount({});
      // Clear all localStorage
      localStorage.clear();
      // Sign out
      await signOut();
      toast.success("Account deleted. Goodbye!");
      // Redirect to login
      window.location.href = "/login";
    } catch (e) {
      toast.error("Failed to delete account. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Contact</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your profile and public information.</p>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Avatar className="size-12">
            <AvatarFallback className="bg-accent text-accent-foreground text-lg font-medium">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-base font-semibold text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditName(user.name || "");
              setEditLinkedIn(localStorage.getItem("operiq-linkedin") || "");
              setEditGitHub(localStorage.getItem("operiq-github") || "");
              setSaveError(null);
              setEditOpen(true);
            }}
          >
            Edit profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.location.reload();
            }}
            className="text-muted-foreground"
            title="Refresh profile"
          >
            <RefreshCw className="size-3.5" />
          </Button>
        </div>

        {/* Social links note */}
        <p className="text-xs text-muted-foreground">
          (set your links in profile)
        </p>

        {/* Links */}
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-foreground hover:text-accent transition-colors"
            title="LinkedIn"
          >
            <LinkedinIcon className="size-4 text-muted-foreground" />
            <span className="hidden sm:inline">LinkedIn</span>
            <ExternalLink className="size-3 text-muted-foreground" strokeWidth={1.75} />
          </a>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-foreground hover:text-accent transition-colors"
            title="GitHub"
          >
            <GithubIcon className="size-4 text-muted-foreground" />
            <span className="hidden sm:inline">GitHub</span>
            <ExternalLink className="size-3 text-muted-foreground" strokeWidth={1.75} />
          </a>
          <a
            href={`mailto:${user.email}`}
            className="flex items-center gap-1.5 text-sm text-foreground hover:text-accent transition-colors"
            title="Email"
          >
            <Mail className="size-4 text-muted-foreground" strokeWidth={1.75} />
            <span className="hidden sm:inline">Email</span>
          </a>
        </div>

        <button
          onClick={() => {
            setDeleteConfirmText("");
            setDeleteDialogOpen(true);
          }}
          className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
        >
          <Trash2 className="inline size-3.5 mr-1" strokeWidth={1.75} />
          Delete account
        </button>
      </div>

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Update your display name and social links.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">LinkedIn URL</label>
              <Input
                value={editLinkedIn}
                onChange={(e) => setEditLinkedIn(e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub URL</label>
              <Input
                value={editGitHub}
                onChange={(e) => setEditGitHub(e.target.value)}
                placeholder="https://github.com/yourusername"
              />
            </div>
            {saveError && (
              <p className="text-sm text-destructive">{saveError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {saving ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete account confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data, threads, and settings will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              To confirm, type <strong className="text-foreground">DELETE</strong> below:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE" || deleting}
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable helpers                                                  */
/* ------------------------------------------------------------------ */

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-md bg-accent/10 text-accent">
        <Icon className="size-4" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        disabled && "opacity-50 cursor-not-allowed",
        checked ? "bg-accent" : "bg-muted-foreground/30",
      )}
    >
        <span
        className={cn(
          "inline-flex size-4 items-center justify-center rounded-full bg-background transition-transform",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      >
        {checked ? (
          <Moon className="size-3 text-accent" />
        ) : (
          <Sun className="size-3 text-muted-foreground" />
        )}
      </span>
    </button>
  );
}

function ContrastButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-accent text-accent-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function DisabledSelect({ placeholder }: { placeholder: string }) {
  return (
    <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed">
      {placeholder}
    </div>
  );
}

function DisabledField({ label, type }: { label: string; type: "input" | "textarea" }) {
  const baseClass =
    "w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed";
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {type === "input" ? (
        <div className={baseClass}>Coming soon</div>
      ) : (
        <div className={cn(baseClass, "min-h-[80px]")}>Coming soon</div>
      )}
    </div>
  );
}

/* Inline SVG for GitHub (brand icon not available in lucide-react v1.17.0) */
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

/* Inline SVG for LinkedIn (brand icon not available in lucide-react v1.17.0) */
function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}


