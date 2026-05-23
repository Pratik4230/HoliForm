import { AccountSettings } from "~/components/dashboard/account-settings";

export default function DashboardSettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage notifications and preferences for your creator account.
        </p>
      </div>
      <AccountSettings />
    </div>
  );
}
