import JiraIntegration from "@/features/jira/components/jira-integration";

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account and platform integrations.</p>
      </div>

      <JiraIntegration />
    </div>
  );
}
