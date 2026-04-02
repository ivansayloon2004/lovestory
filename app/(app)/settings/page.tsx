import { SettingsForm } from "@/components/settings/settings-form";
import { getViewerContext } from "@/lib/data/queries";

export default async function SettingsPage() {
  const viewer = await getViewerContext();
  if (!viewer) return null;

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6 sm:p-8">
        <p className="eyebrow">Settings</p>
        <h1 className="mt-4 font-display text-6xl leading-none text-foreground">Privacy, profile, and reminders.</h1>
      </section>
      <SettingsForm viewer={viewer} />
    </div>
  );
}
