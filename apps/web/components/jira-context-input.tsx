import { useState } from 'react';
import { Search, Loader2, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jiraApi } from '@/features/jira/services/jira-api';

interface JiraContextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function JiraContextInput({ value, onChange }: JiraContextInputProps) {
  const [activeTab, setActiveTab] = useState<'manual' | 'jira'>('manual');
  const [jiraKey, setJiraKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchJiraIssue = async () => {
    if (!jiraKey) return;
    setLoading(true);
    setSuccess(false);
    try {
      const data = await jiraApi.getIssue(jiraKey);
      // Construct context string
      const context = `Title: ${data.title}\n\nDescription: ${data.description}\n\nAcceptance Criteria: ${data.acceptanceCriteria || 'None'}`;
      onChange(context);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to fetch Jira issue. Ensure your Jira is connected in Settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex border-b border-slate-200">
        <button
          className={`px-4 py-2 text-sm font-bold ${activeTab === 'manual' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('manual')}
        >
          Manual Input
        </button>
        <button
          className={`px-4 py-2 text-sm font-bold flex items-center ${activeTab === 'jira' ? 'border-b-2 border-[#0052CC] text-[#0052CC]' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('jira')}
        >
          <LinkIcon className="w-4 h-4 mr-1" /> Import from Jira
        </button>
      </div>

      {activeTab === 'jira' && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Jira Issue Key (e.g. PROJ-123)"
            className="flex-1 h-10 px-3 rounded-lg border bg-white focus:ring-2 focus:ring-[#0052CC] outline-none text-sm font-mono"
            value={jiraKey}
            onChange={(e) => setJiraKey(e.target.value)}
          />
          <Button 
            className="bg-[#0052CC] hover:bg-[#0047B3] text-white shadow-lg shadow-[#0052CC]/20" 
            onClick={fetchJiraIssue} 
            disabled={loading || !jiraKey}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
            Fetch Issue
          </Button>
        </div>
      )}

      {success && activeTab === 'jira' && (
        <div className="text-xs text-emerald-600 font-bold flex items-center bg-emerald-50 p-2 rounded border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Successfully imported issue {jiraKey} into context.
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">Requirement Context</label>
        <textarea 
          className="w-full h-48 p-4 rounded-xl border bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all resize-none text-sm"
          placeholder="e.g. As a user I want to log in using my email..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
