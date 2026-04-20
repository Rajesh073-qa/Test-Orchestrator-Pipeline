'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  Mail, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { jiraApi } from "../services/jira-api";

export default function JiraIntegration() {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [formData, setFormData] = useState({
    host: '',
    email: '',
    apiToken: '',
  });

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await jiraApi.getStatus();
      setStatus(data);
      if (data.connected) {
        setFormData({
          host: data.host || '',
          email: data.email || '',
          apiToken: '••••••••••••••••', // Masked
        });
      }
    } catch (err) {
      console.error('Failed to fetch Jira status');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    try {
      await jiraApi.connect(formData);
      await fetchStatus();
    } catch (err) {
      alert('Failed to connect to Jira. Please check your credentials.');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Jira Integration</h2>
          <p className="text-slate-500">Connect your Jira instance to sync user stories and requirements.</p>
        </div>
        {status?.connected && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" /> Connected
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="shadow-sm border-none">
          <CardHeader>
            <CardTitle>Connection Settings</CardTitle>
            <CardDescription>Enter your Jira Cloud credentials (API Token is required)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnect} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jira Host URL</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      required
                      placeholder="https://your-domain.atlassian.net"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="admin@company.com"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">API Token</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="Atlassian API Token"
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={formData.apiToken}
                      onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full" type="submit" disabled={connecting}>
                {connecting ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2 w-4 h-4" />}
                {status?.connected ? 'Update Connection' : 'Connect to Jira'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="text-amber-400 w-5 h-5" /> How to get an API Token?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-300 text-sm">
              <ol className="list-decimal list-inside space-y-2">
                <li>Log in to your Atlassian account.</li>
                <li>Go to <b>Security</b> {'>'} <b>Create and manage API tokens</b>.</li>
                <li>Click <b>Create API token</b> and give it a name (e.g. "Orchestor").</li>
                <li>Copy the token and paste it here.</li>
              </ol>
              <Button variant="link" className="text-primary p-0 h-auto" asChild>
                <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noreferrer">
                   Atlassian Token Management <RefreshCw className="w-3 h-3 ml-1" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
