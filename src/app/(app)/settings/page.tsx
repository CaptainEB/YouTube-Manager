import { AccountSettings } from "@/app/(app)/settings/_components/account-settings";
import { ThemeSettings } from "@/app/(app)/settings/_components/theme-settings";
import { PageHeader } from "@/components/layout/page-header";
import { GENERATION_FEATURES } from "@/config/features";
import { getSystemPrompt } from "@/lib/config";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Appearance, account, and a look at what's driving each tab."
      />

      <section className="border-border bg-card flex flex-col gap-4 rounded-xl border p-6">
        <h2 className="text-foreground font-semibold">Appearance</h2>
        <ThemeSettings />
      </section>

      <section className="border-border bg-card flex flex-col gap-4 rounded-xl border p-6">
        <h2 className="text-foreground font-semibold">Account</h2>
        <AccountSettings />
      </section>

      <section className="border-border bg-card flex flex-col gap-4 rounded-xl border p-6">
        <div>
          <h2 className="text-foreground font-semibold">System prompts</h2>
          <p className="text-muted-foreground text-sm">
            Read-only — edit{" "}
            <code className="bg-muted rounded px-1 py-0.5">config/prompts.json</code> and restart
            the app to change these.
          </p>
        </div>
        <div className="divide-border flex flex-col divide-y">
          {GENERATION_FEATURES.map((feature) => (
            <div key={feature.key} className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0">
              <p className="text-foreground font-medium">{feature.label}</p>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {getSystemPrompt(feature.key)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
