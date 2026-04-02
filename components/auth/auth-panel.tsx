"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/browser";
import { magicLinkSchema, signInSchema, signUpSchema } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthPanelProps = {
  mode: "login" | "signup";
};

export function AuthPanel({ mode }: AuthPanelProps) {
  const router = useRouter();
  const backendReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const supabase = useMemo(() => (backendReady ? createClient() : null), [backendReady]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitAuth = async (formData: FormData) => {
    setBusy(true);
    setError(null);
    setStatus(null);

    try {
      if (!supabase) {
        throw new Error("Supabase is not configured yet. Add the public keys in your deployment settings first.");
      }

      if (mode === "login") {
        const payload = signInSchema.parse({
          email: formData.get("email"),
          password: formData.get("password")
        });

        const { error: signInError } = await supabase.auth.signInWithPassword(payload);
        if (signInError) throw signInError;

        router.push("/dashboard");
        router.refresh();
      } else {
        const payload = signUpSchema.parse({
          displayName: formData.get("displayName"),
          email: formData.get("email"),
          password: formData.get("password")
        });

        const { error: signUpError } = await supabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            data: {
              display_name: payload.displayName
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (signUpError) throw signUpError;
        setStatus("Check your inbox to confirm your email, then come back to sign in.");
      }
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Something went wrong.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const sendMagicLink = async (formData: FormData) => {
    setBusy(true);
    setError(null);
    setStatus(null);

    try {
      if (!supabase) {
        throw new Error("Supabase is not configured yet. Add the public keys in your deployment settings first.");
      }

      const payload = magicLinkSchema.parse({
        email: formData.get("magicEmail")
      });

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: payload.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (otpError) throw otpError;
      setStatus("Magic link sent. Open it on this device to continue.");
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Something went wrong.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="paper-panel w-full max-w-xl p-6 sm:p-8">
      <p className="eyebrow">{mode === "login" ? "Welcome back" : "Start your diary"}</p>
      <h1 className="mt-4 font-display text-5xl leading-none text-foreground">
        {mode === "login" ? "Step into your shared timeline." : "Create a private space for two."}
      </h1>
      <p className="mt-4 text-sm text-foreground/70">
        Email and password are supported, and magic links are available for quick, low-friction access.
      </p>

      {!backendReady ? (
        <div className="mt-6 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Authentication is not configured yet. After deployment, add
          `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel to enable sign-in.
        </div>
      ) : null}

      <form
        className="mt-8 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await submitAuth(new FormData(event.currentTarget));
        }}
      >
        {mode === "signup" ? <Input name="displayName" placeholder="Display name" required /> : null}
        <Input name="email" type="email" placeholder="Email address" required />
        <Input name="password" type="password" placeholder="Password" required />
        <Button type="submit" className="w-full" disabled={busy || !backendReady}>
          {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-foreground/40">
        <span className="h-px flex-1 bg-border" />
        <span>or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await sendMagicLink(new FormData(event.currentTarget));
        }}
      >
        <Input name="magicEmail" type="email" placeholder="Email for magic link" required />
        <Button type="submit" variant="secondary" className="w-full" disabled={busy || !backendReady}>
          Send magic link
        </Button>
      </form>

      {error ? (
        <div className="mt-6 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {status ? (
        <div className="mt-6 rounded-[1.25rem] border border-accent/20 bg-accentSoft px-4 py-3 text-sm text-foreground/75">
          {status}
        </div>
      ) : null}

      <p className="mt-6 text-sm text-foreground/60">
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <Link
          href={mode === "login" ? "/signup" : "/login"}
          className="font-semibold text-foreground underline decoration-accent/60 underline-offset-4"
        >
          {mode === "login" ? "Sign up" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
