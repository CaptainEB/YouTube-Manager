import { AccountSettings } from "@/app/(app)/settings/_components/account-settings";
import { ThemeSettings } from "@/app/(app)/settings/_components/theme-settings";
import { PageHeader } from "@/components/layout/page-header";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Settings" description="Appearance and account." />

      <section className="border-border bg-card flex flex-col gap-4 rounded-xl border p-6">
        <h2 className="text-foreground font-semibold">Appearance</h2>
        <ThemeSettings />
      </section>

      <section className="border-border bg-card flex flex-col gap-4 rounded-xl border p-6">
        <h2 className="text-foreground font-semibold">Account</h2>
        <AccountSettings />
      </section>
    </div>
  );
}
