'use client';

import { useState } from 'react';
import { Search, Loader2, Link as LinkIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jiraApi } from '@/features/jira/services/jira-api';

interface JiraContextInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}

export function JiraContextInput({
  value,
  onChange,
  label = 'Requirement Context',
  placeholder = 'e.g. As a user I want to log in using my email and password, so that I can access my dashboard. The system should show an error message for invalid credentials.',
}: JiraContextInputProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'jira'>('manual');
  const [jiraKey, setJiraKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [importedKey, setImportedKey] = useState('');
  const [error, setError] = useState('');

  const fetchJiraIssue = async () => {
    if (!jiraKey.trim()) return;
    setLoading(true);
    setError('');
    setImportedKey('');
    try {
      const data = await jiraApi.getIssue(jiraKey.trim().toUpperCase());

      // Build a rich context string for the AI
      const lines: string[] = [
        `Title: ${data.title}`,
        '',
        `Description: ${data.description || 'No description provided.'}`,
      ];
      if (data.acceptanceCriteria) {
        lines.push('', `Acceptance Criteria: ${data.acceptanceCriteria}`);
      }
      onChange(lines.join('\n'));
      setImportedKey(jiraKey.trim().toUpperCase());
      setJiraKey('');
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        setError(`Issue "${jiraKey.toUpperCase()}" not found in Jira. Check the key and try again.`);
      } else if (status === 403 || status === 401) {
        setError('Jira authentication failed. Please update your Jira credentials in Settings.');
      } else if (err?.response?.data?.message?.includes('No Jira connection')) {
        setError('Jira is not connected. Go to Settings → Jira Integration to connect your account.');
      } else {
        setError(err?.response?.data?.message || 'Failed to fetch Jira issue. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchJiraIssue();
    }
  };

  return (
    <div className="space-y-3">
      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
            activeTab === 'manual'
              ? 'bg-white shadow text-slate-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          ✏️ Manual Input
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('jira')}
          className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'jira'
              ? 'bg-[#0052CC] shadow text-white'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          Import from Jira
        </button>
      </div>

      {/* Jira Import Field */}
      {activeTab === 'jira' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Jira Issue Key (e.g. PROJ-123)"
              className="flex-1 h-10 px-3 rounded-lg border bg-white focus:ring-2 focus:ring-[#0052CC] outline-none text-sm font-mono tracking-wide"
              value={jiraKey}
              onChange={e => { setJiraKey(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
            />
            <Button
              type="button"
              className="bg-[#0052CC] hover:bg-[#0047B3] text-white shadow-lg shadow-[#0052CC]/20 shrink-0"
              onClick={fetchJiraIssue}
              disabled={loading || !jiraKey.trim()}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {!loading && <span className="ml-1.5">Fetch</span>}
            </Button>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success message */}
          {importedKey && !error && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              ✅ Imported {importedKey} — context loaded below. Review and edit if needed.
            </div>
          )}
        </div>
      )}

      {/* Context Textarea */}
      <div className="space-y-1.5">
        <label className="text-sm font-bold text-slate-700">{label}</label>
        <textarea
          className="w-full h-44 p-4 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-sm leading-relaxed"
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <p className="text-[11px] text-slate-400">
          {value.length > 0
            ? `${value.length} characters · ${value.split(' ').filter(Boolean).length} words`
            : 'More detail = better AI output. Include acceptance criteria, edge cases, and user flows.'}
        </p>
      </div>
    </div>
  );
}
