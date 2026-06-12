/**
 * Copyright (c) 2025 Operiq AI. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, distribution,
 * or use of this file is strictly prohibited.
 */

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Copy, Check, Trash2, Link2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ------------------------------------------------------------------ */
/*  InviteDialog                                                      */
/* ------------------------------------------------------------------ */

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threadId: string;
}

export function InviteDialog({ open, onOpenChange, threadId }: InviteDialogProps) {
  const isValidThreadId = /^[a-z0-9]{28,}$/.test(threadId);
  const invite = useQuery(
    api.sharedChats.getInviteByThread,
    isValidThreadId ? { threadId: threadId as Id<"threads"> } : "skip",
  );
  const participants = useQuery(
    api.sharedChats.getSharedParticipants,
    isValidThreadId ? { threadId: threadId as Id<"threads"> } : "skip",
  );
  const createInvite = useMutation(api.sharedChats.createInvite);
  const revokeInvite = useMutation(api.sharedChats.revokeInvite);

  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  const inviteLink = invite?.inviteLink || generatedLink || (invite?.token ? `https://operiq-ai.netlify.app/invite/${invite.token}` : null);
  if (!inviteLink) return null; // Don't show copy button without a link

  const handleCopy = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be blocked
    }
  };

  const handleRevoke = async () => {
    if (!confirmRevoke) {
      setConfirmRevoke(true);
      return;
    }
    setIsRevoking(true);
    setError(null);
    try {
      await revokeInvite({ threadId: threadId as Id<"threads"> });
      setConfirmRevoke(false);
    } catch (e: any) {
      setError(e.message || "Failed to revoke invite");
    } finally {
      setIsRevoking(false);
    }
  };

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const result = await createInvite({ threadId: threadId as Id<"threads"> });
      setGeneratedLink(result.inviteLink);
    } catch (e: any) {
      setError(e.message || "Failed to create invite link");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share conversation</DialogTitle>
          <DialogDescription>
            Invite others to view and participate in this chat.
          </DialogDescription>
        </DialogHeader>

        {/* Active invite section */}
        {invite ? (
          <div className="space-y-3">
            <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm font-mono break-all select-all">
              {inviteLink}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="size-3.5" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                {copied ? "Copied!" : "Copy link"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRevoke}
                disabled={isRevoking}
                onMouseLeave={() => setConfirmRevoke(false)}
              >
                {isRevoking ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                {confirmRevoke ? "Confirm?" : "Revoke invite"}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <Button onClick={handleCreate} size="sm" disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Link2 className="size-3.5" />
              )}
              {isCreating ? "Generating..." : "Generate invite link"}
            </Button>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Participants section */}
        {participants && participants.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Participants</h4>
            <div className="space-y-1">
              {participants.map((p) => (
                <div
                  key={p.userId}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-muted/50"
                >
                  <div className="size-7 rounded-full bg-muted-foreground/20 flex items-center justify-center text-xs font-medium uppercase text-foreground shrink-0">
                    {(p.name || p.email).charAt(0)}
                  </div>
                  <span className="text-sm truncate">
                    {p.name || p.email}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
