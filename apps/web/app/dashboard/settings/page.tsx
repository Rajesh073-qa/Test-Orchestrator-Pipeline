'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { Settings, Bot, CheckCircle2, AlertCircle, Loader2, Trash2, Key, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import JiraIntegration from '@/features/jira/components/jira-integration';
import { useToast } from '@/components/toast';

const PROVIDERS: Record<string, { label: string; color: string; docsUrl: string; models: { id: string; label: string }[] }> = {
  openai: {
    label: 'OpenAI',
    color: 'bg-emerald-500',
    docsUrl: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o (Best)' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cheap)' },
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
  },
  groq: {
    label: 'Groq (Free Tier Available)',
    color: 'bg-orange-500',
    docsUrl: 'https://console.groq.com/keys',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Recommended)' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Fastest)' },
      { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
      { id: 'gemma2-9b-it', label: 'Gemma 2 9B' },
    ],
  },
  gemini: {
    label: 'Google Gemini',
    color: 'bg-blue-500',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Free Tier)' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Best Quality)' },
      { id: 'gemini-2.0-flash-exp', label: 'Gemini 2.0 Flash Exp' },
    ],
  },
  mistral: {
    label: 'Mistral AI',
    color: 'bg-violet-500',
    docsUrl: 'https://console.mistral.ai/api-keys/',
    models: [
      { id: 'mistral-large-latest', label: 'Mistral Large (Best)' },
      { id: 'open-mixtral-8x22b', label: 'Mixtral 8x22B' },
      { id: 'open-mistral-7b', label: 'Mistral 7B (Fast)' },
    ],
  },
  openrouter: {
    label: 'OpenRouter (200+ Models)',
    color: 'bg-pink-500',
    docsUrl: 'https://openrouter.ai/keys',
    models: [
      { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet' },
      { id: 'google/gemini-flash-1.5', label: 'Gemini Flash 1.5' },
      { id: 'meta-llama/llama-3.1-70b-instruct', label: 'Llama 3.1 70B' },
    ],
  },
  mock: {
    label: 'Mock AI (No API Key)',
    color: 'bg-slate-400',
    docsUrl: '',
    models: [{ id: 'mock', label: 'Mock Responses (Development Only)' }],
  },
};

export default function SettingsPage() {
  const { toast } = useToast();

  const [currentConfig, setCurrentConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState('groq');
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const { data } = await api.get('/ai-config');
      setCurrentConfig(data);
      if (data.configured) {
        setSelectedProvider(data.provider);
        // Preselect first model for this provider
        setSelectedModel(PROVIDERS[data.provider]?.models[0]?.id || 'mock');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  // When provider changes, reset model to the first option
  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    setSelectedModel(PROVIDERS[provider]?.models[0]?.id || '');
    setApiKey('');
  };

  const handleSave = async () => {
    if (selectedProvider !== 'mock' && !apiKey.trim()) {
      toast({ type: 'error', title: 'API Key Required', message: 'Please enter a valid API key for the selected provider.' });
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/ai-config', { provider: selectedProvider, model: selectedModel, apiKey: selectedProvider === 'mock' ? 'mock' : apiKey });
      toast({ type: 'success', title: '✅ AI Provider Saved', message: data.message });
      setApiKey('');
      await fetchConfig();
    } catch (err: any) {
      toast({ type: 'error', title: 'Save Failed', message: err?.response?.data?.message || 'Failed to save AI configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { data } = await api.delete('/ai-config');
      toast({ type: 'info', title: 'Configuration Removed', message: data.message });
      setCurrentConfig(null);
      setSelectedProvider('groq');
      setSelectedModel('llama-3.3-70b-versatile');
    } catch (err: any) {
      toast({ type: 'error', title: 'Delete Failed', message: err?.response?.data?.message || 'Failed to remove configuration.' });
    } finally {
      setDeleting(false);
    }
  };

  const providerConfig = PROVIDERS[selectedProvider]!;

  return (
    <div className="space-y-10 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" /> Settings
        </h1>
        <p className="text-slate-500 mt-1">Configure your AI provider, manage integrations, and personalize the platform.</p>
      </div>

      {/* ── AI Configuration ── */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">🤖 AI Provider Configuration</h2>
          <p className="text-slate-500 text-sm mt-1">Select your preferred AI model. All generators will use this provider.</p>
        </div>

        {/* Current Config Banner */}
        {!loadingConfig && currentConfig?.configured && (
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-bold text-emerald-800 text-sm">Active AI Provider</p>
                <p className="text-emerald-700 text-xs">
                  {PROVIDERS[currentConfig.provider]?.label} — <span className="font-mono">{currentConfig.apiKeyMasked}</span>
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-8" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Remove
            </Button>
          </div>
        )}

        <Card className="border-none shadow-xl">
          <CardContent className="p-6 space-y-6">
            {/* Provider Grid */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Choose AI Provider</label>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(PROVIDERS).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => handleProviderChange(key)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      selectedProvider === key
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${p.color}`} />
                    <span className={`text-sm font-semibold ${selectedProvider === key ? 'text-primary' : 'text-slate-700'}`}>
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Model Select */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Select Model</label>
              <select
                className="w-full h-10 px-3 rounded-lg border bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
              >
                {providerConfig.models.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* API Key Field */}
            {selectedProvider !== 'mock' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Key className="w-4 h-4" /> API Key
                  </label>
                  {providerConfig.docsUrl && (
                    <a href={providerConfig.docsUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                      Get API Key <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <input
                  type="password"
                  placeholder={`Paste your ${providerConfig.label} API key...`}
                  className="w-full h-10 px-3 rounded-lg border bg-white focus:ring-2 focus:ring-primary outline-none text-sm font-mono"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                />
                <p className="text-xs text-slate-400">
                  🔒 Keys are encrypted with AES-256 before storage. Never exposed in responses.
                </p>
              </div>
            )}

            {selectedProvider === 'mock' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600">
                <p className="font-bold text-slate-700 mb-1">📋 Mock AI Mode</p>
                <p>Returns pre-defined sample data. No API key required. Useful for testing the UI without API costs.</p>
              </div>
            )}

            <Button className="w-full font-bold h-11 shadow-lg shadow-primary/20" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="animate-spin mr-2 w-4 h-4" />Saving...</> : <><Bot className="w-4 h-4 mr-2" />Save AI Configuration</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Jira Integration ── */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">🔗 Jira Integration</h2>
          <p className="text-slate-500 text-sm mt-1">Connect your Atlassian Jira account to import requirements directly into generators.</p>
        </div>
        <JiraIntegration />
      </div>
    </div>
  );
}
