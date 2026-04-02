"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import type { ThemeMode, ViewerContext } from "@/lib/types";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SettingsFormProps = {
  viewer: ViewerContext;
};

export function SettingsForm({ viewer }: SettingsFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { setTheme } = useTheme();
  const [displayName, setDisplayName] = useState(viewer.profile.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(viewer.profile.avatar_url ?? "");
  const [themeMode, setThemeMode] = useState(viewer.profile.theme_mode ?? "system");
  const [weeklyMemoryPrompt, setWeeklyMemoryPrompt] = useState(viewer.reminders?.weekly_memory_prompt ?? true);
  const [weeklyMemoryDay, setWeeklyMemoryDay] = useState(viewer.reminders?.weekly_memory_day ?? 0);
  const [weeklyMemoryHour, setWeeklyMemoryHour] = useState(viewer.reminders?.weekly_memory_hour ?? 20);
  const [anniversaryReminders, setAnniversaryReminders] = useState(viewer.reminders?.anniversary_reminders ?? true);
  const [anniversaryLeadDays, setAnniversaryLeadDays] = useState(viewer.reminders?.anniversary_lead_days ?? 7);
  const [emailEnabled, setEmailEnabled] = useState(viewer.reminders?.email_enabled ?? true);
  const [pushEnabled, setPushEnabled] = useState(viewer.reminders?.push_enabled ?? false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const saveProfile = async () => {
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          display_name: displayName,
          avatar_url: avatarUrl,
          theme_mode: themeMode
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not save profile.");

      setTheme(themeMode);
      setMessage("Profile updated.");
      router.refresh();
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : "Could not save profile.");
    } finally {
      setBusy(false);
    }
  };

  const saveReminders = async () => {
    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/reminders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          weekly_memory_prompt: weeklyMemoryPrompt,
          weekly_memory_day: weeklyMemoryDay,
          weekly_memory_hour: weeklyMemoryHour,
          anniversary_reminders: anniversaryReminders,
          anniversary_lead_days: anniversaryLeadDays,
          email_enabled: emailEnabled,
          push_enabled: pushEnabled
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Could not save reminder settings.");

      setMessage("Reminder settings updated.");
      router.refresh();
    } catch (caughtError) {
      setMessage(caughtError instanceof Error ? caughtError.message : "Could not save reminder settings.");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="paper-panel p-6">
        <p className="eyebrow">Profile</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="text-sm text-foreground/70">
            Display name
            <Input className="mt-2" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>
          <label className="text-sm text-foreground/70">
            Avatar URL
            <Input
              className="mt-2"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
            />
          </label>
          <label className="text-sm text-foreground/70">
            Theme
            <select
              className="diary-input mt-2"
              value={themeMode}
              onChange={(event) => setThemeMode(event.target.value as ThemeMode)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" onClick={saveProfile} disabled={busy}>
            Save profile
          </Button>
          <Button type="button" variant="secondary" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>

      <div className="paper-panel p-6">
        <p className="eyebrow">Reminders</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="inline-flex items-center gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={weeklyMemoryPrompt}
              onChange={(event) => setWeeklyMemoryPrompt(event.target.checked)}
            />
            Weekly "write a memory" reminder
          </label>
          <label className="inline-flex items-center gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={anniversaryReminders}
              onChange={(event) => setAnniversaryReminders(event.target.checked)}
            />
            Anniversary reminders
          </label>
          <label className="text-sm text-foreground/70">
            Weekly reminder day
            <select
              className="diary-input mt-2"
              value={weeklyMemoryDay}
              onChange={(event) => setWeeklyMemoryDay(Number(event.target.value))}
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </label>
          <label className="text-sm text-foreground/70">
            Weekly reminder hour
            <Input
              className="mt-2"
              type="number"
              min={0}
              max={23}
              value={weeklyMemoryHour}
              onChange={(event) => setWeeklyMemoryHour(Number(event.target.value))}
            />
          </label>
          <label className="text-sm text-foreground/70">
            Anniversary lead time (days)
            <Input
              className="mt-2"
              type="number"
              min={1}
              max={30}
              value={anniversaryLeadDays}
              onChange={(event) => setAnniversaryLeadDays(Number(event.target.value))}
            />
          </label>
          <div className="space-y-3">
            <label className="inline-flex items-center gap-3 text-sm text-foreground">
              <input type="checkbox" checked={emailEnabled} onChange={(event) => setEmailEnabled(event.target.checked)} />
              Email reminders
            </label>
            <label className="inline-flex items-center gap-3 text-sm text-foreground">
              <input type="checkbox" checked={pushEnabled} onChange={(event) => setPushEnabled(event.target.checked)} />
              Push notifications
            </label>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" onClick={saveReminders} disabled={busy}>
            Save reminders
          </Button>
        </div>
      </div>

      {message ? (
        <div className="rounded-[1.25rem] bg-accentSoft px-4 py-3 text-sm text-foreground/75">{message}</div>
      ) : null}
    </div>
  );
}
