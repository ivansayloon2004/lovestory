"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { ViewerContext } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RelationshipPanelProps = {
  viewer: ViewerContext;
};

export function RelationshipPanel({ viewer }: RelationshipPanelProps) {
  const router = useRouter();
  const [startedOn, setStartedOn] = useState(viewer.relationship?.started_on ?? "");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const createRelationship = async () => {
    setBusy(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch("/api/relationship/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ startedOn })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not create your diary.");

      setStatus("Your private diary is ready. Share the invite code with your partner.");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not create your diary.");
    } finally {
      setBusy(false);
    }
  };

  const joinRelationship = async () => {
    setBusy(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch("/api/relationship/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not join the diary.");

      setStatus("You are linked. Your shared space is ready.");
      setCode("");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not join the diary.");
    } finally {
      setBusy(false);
    }
  };

  if (viewer.relationship) {
    return (
      <div className="paper-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Couple link</p>
            <h3 className="mt-3 font-display text-3xl text-foreground">
              {viewer.partner ? "Your diary is paired." : "Waiting for your partner."}
            </h3>
            <p className="mt-3 max-w-2xl text-sm text-foreground/70">
              {viewer.partner
                ? `You and ${viewer.partner.display_name ?? viewer.partner.email} can now add memories together.`
                : "Share this invite code once. The database only allows one more member to join."}
            </p>
          </div>
          <div className="rounded-[1.6rem] bg-accentSoft px-5 py-4 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">Invite code</p>
            <p className="mt-2 text-3xl font-semibold tracking-[0.25em] text-foreground">
              {viewer.relationship.invite_code}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="paper-panel p-6">
        <p className="eyebrow">Create space</p>
        <h3 className="mt-3 font-display text-3xl text-foreground">Start your private diary.</h3>
        <p className="mt-3 text-sm text-foreground/70">
          Create the shared space first, then invite your partner with a one-time code.
        </p>
        <label className="mt-6 block text-sm text-foreground/70">
          Anniversary date
          <Input
            className="mt-2"
            type="date"
            value={startedOn}
            onChange={(event) => setStartedOn(event.target.value)}
          />
        </label>
        <Button className="mt-5" type="button" disabled={busy} onClick={createRelationship}>
          {busy ? "Creating..." : "Create our diary"}
        </Button>
      </div>

      <div className="paper-panel p-6">
        <p className="eyebrow">Join space</p>
        <h3 className="mt-3 font-display text-3xl text-foreground">Link to your partner.</h3>
        <p className="mt-3 text-sm text-foreground/70">
          Enter the invite code your partner generated. The database enforces a two-person limit.
        </p>
        <Input
          className="mt-6 uppercase tracking-[0.2em]"
          value={code}
          placeholder="AB12CD34"
          onChange={(event) => setCode(event.target.value.toUpperCase())}
        />
        <Button className="mt-5" type="button" variant="secondary" disabled={busy || !code} onClick={joinRelationship}>
          {busy ? "Joining..." : "Join diary"}
        </Button>
      </div>

      {error ? (
        <div className="rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:col-span-2">
          {error}
        </div>
      ) : null}
      {status ? (
        <div className="rounded-[1.25rem] border border-accent/20 bg-accentSoft px-4 py-3 text-sm text-foreground/75 lg:col-span-2">
          {status}
        </div>
      ) : null}
    </div>
  );
}
