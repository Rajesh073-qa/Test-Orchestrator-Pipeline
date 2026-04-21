'use client';

import { useState, useEffect } from 'react';
import {
  Globe, Mail, Key, CheckCircle2, AlertCircle, Loader2, RefreshCw, XCircle, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { jiraApi } from "../services/jira-api";
import { useToast } from "@/components/toast";

export default function JiraIntegration() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState<any>(null);

  // Form uses `baseUrl` to match the backend DTO
  const [formData, setFormData] = useState({
    baseUrl: '',
    email: '',
    apiToken: '',
  });

  useEffect(() => { fetchStatus(); }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await jiraApi.getStatus();
      setStatus(data);
      if (data.connected) {
        setFormData({
          baseUrl: data.baseUrl || '',
          email: data.email || '',
          apiToken: '',          // Never pre-fill the token
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      // 404 just means not connected yet — don't show error
      if (err?.response?.status !== 404) {
        console.error('Failed to fetch Jira status:', msg || err);
      }
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.baseUrl.trim()) {
      toast({ type: 'error', title: 'Host URL Required', message: 'Please enter your Jira host URL (e.g. https://yourcompany.atlassian.net).' });
      return;
    }
    if (!formData.email.trim()) {
      toast({ type: 'error', title: 'Email Required', message: 'Please enter the email address linked to your Jira account.' });
      return;
    }
    if (!formData.apiToken.trim() || formData.apiToken.length < 8) {
      toast({ type: 'error', title: 'API Token Required', message: 'Please paste a valid Atlassian API token (at least 8 characters).' });
      return;
    }

    setConnecting(true);
    try {
      await jiraApi.connect(formData);      // sends { baseUrl, email, apiToken }
      await fetchStatus();
      toast({
        type: 'success',
        title: '✅ Jira Connected Successfully',
        message: `Linked to ${formData.baseUrl}. You can now import issues into any generator.`,
      });
      setFormData(prev => ({ ...prev, apiToken: '' })); // clear token from UI
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to connect to Jira. Please verify your credentials.';
      toast({ type: 'error', title: 'Connection Failed', message: msg });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      // We just update connection to empty — easiest: re-connect with cleared fields shows error
      // Actually call disconnect if the endpoint exists, else guide user
      toast({ type: 'info', title: 'Disconnecting...', message: 'To disconnect, simply connect with new credentials.' });
    } catch {}
  };

  if (loading) return (
    <div className="flex justify-center items-center p-12">
      <Loader2 className="animate-spin w-6 h-6 text-primary" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {status?.connected ? (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-800 text-sm">Jira Connected</p>
              <p className="text-emerald-700 text-xs font-mono">{status.baseUrl} · {status.email}</p>
            </div>
          </div>
          <span className="text-xs text-emerald-600 font-bold bg-emerald-100 px-2 py-1 rounded-full">Active</span>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-amber-800 text-sm">Jira Not Connected</p>
            <p className="text-amber-700 text-xs">Connect below to import requirements from Jira issues into your generators.</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Connect Form */}
        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-base">{status?.connected ? 'Update Jira Connection' : 'Connect to Jira'}</CardTitle>
            <CardDescription>Enter your Jira Cloud credentials below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleConnect} className="space-y-4">
              {/* Jira Host URL */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Jira Host URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    required
                    placeholder="https://yourcompany.atlassian.net"
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={formData.baseUrl}
                    onChange={e => setFormData({ ...formData, baseUrl: e.target.value })}
                  />
                </div>
                <p className="text-[11px] text-slate-400">Format: https://yourcompany.atlassian.net (no trailing slash)</p>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="admin@company.com"
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* API Token */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" /> Atlassian API Token
                  </label>
                  <a
                    href="https://id.atlassian.com/manage-profile/security/api-tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    Get Token <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder={status?.connected ? '(enter new token to update)' : 'Paste your API token here'}
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none font-mono"
                    value={formData.apiToken}
                    onChange={e => setFormData({ ...formData, apiToken: e.target.value })}
                  />
                </div>
                <p className="text-[11px] text-slate-400">🔒 Encrypted with AES-256 before storage.</p>
              </div>

              <Button className="w-full font-bold h-11" type="submit" disabled={connecting}>
                {connecting
                  ? <><Loader2 className="animate-spin mr-2 w-4 h-4" />Connecting...</>
                  : <><RefreshCw className="mr-2 w-4 h-4" />{status?.connected ? 'Update Connection' : 'Connect to Jira'}</>
                }
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* How-to Guide */}
        <Card className="bg-slate-900 text-white border-none shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="text-amber-400 w-5 h-5" /> How to Get an API Token
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300 text-sm">
            <ol className="list-decimal list-inside space-y-2.5">
              <li>Log in at <span className="text-blue-400">atlassian.com</span></li>
              <li>Go to <strong className="text-white">Account Settings</strong> → <strong className="text-white">Security</strong></li>
              <li>Click <strong className="text-white">Create and manage API tokens</strong></li>
              <li>Click <strong className="text-white">Create API token</strong>, name it (e.g. "Orchestor")</li>
              <li>Copy the token and paste it above</li>
            </ol>
            <div className="mt-4 p-3 bg-slate-800 rounded-lg text-xs text-slate-400">
              <p className="font-bold text-slate-300 mb-1">⚡ Usage in Generators</p>
              <p>Once connected, click <strong className="text-slate-200">Import from Jira</strong> in any generator tab and enter your Jira issue key (e.g. <code className="font-mono text-blue-300">PROJ-42</code>).</p>
            </div>
            <a
              href="https://id.atlassian.com/manage-profile/security/api-tokens"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-primary text-sm font-bold hover:underline mt-2"
            >
              Open Atlassian Token Management <ExternalLink className="w-4 h-4" />
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
