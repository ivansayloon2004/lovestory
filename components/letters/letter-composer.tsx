"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type LetterComposerProps = {
  recipientId: string;
  recipientName: string;
};

export function LetterComposer({ recipientId, recipientName }: LetterComposerProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sendLetter = async () => {
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/letters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          recipientId,
          title,
          body
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not send your letter.");

      setTitle("");
      setBody("");
      setMessage(`Letter sent to ${recipientName}.`);
      router.refresh();
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : "Could not send your letter.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="paper-panel p-6">
      <p className="eyebrow">Love letters</p>
      <h2 className="mt-3 font-display text-4xl text-foreground">Write to {recipientName}.</h2>
      <div className="mt-6 space-y-4">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Letter title" />
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Write the kind of note they will reread on hard days."
        />
        <Button type="button" onClick={sendLetter} disabled={busy || !title || !body}>
          {busy ? "Sending..." : "Send letter"}
        </Button>
        {message ? <p className="text-sm text-foreground/65">{message}</p> : null}
      </div>
    </div>
  );
}
