'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { Settings, Bot, CheckCircle2, Loader2, Trash2, Key, ExternalLink, ShieldCheck, CreditCard, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import JiraIntegration from '@/features/jira/components/jira-integration';
import TwoFactorSettings from './components/TwoFactorSettings';
import { useToast } from '@/components/toast';
import { ThemeToggle } from '@/components/theme-toggle';

const PROVIDERS: Record<string, { label: string; color: string; docsUrl?: string; models: { id: string; label: string }[] }> = {
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
  ollama: {
    label: 'Ollama (Local AI)',
    color: 'bg-slate-900',
    models: [
      { id: 'llama3', label: 'Llama 3' },
      { id: 'mistral', label: 'Mistral' },
      { id: 'codellama', label: 'Code Llama' },
      { id: 'phi3', label: 'Phi-3' },
      { id: 'gemma', label: 'Gemma' },
    ],
  },
  mock: {
    label: 'Mock AI (No API Key)',
    color: 'bg-slate-400',
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
  const [baseUrl, setBaseUrl] = useState('http://localhost:11434');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const { data } = await api.get('/ai-config');
      setCurrentConfig(data);
      if (data.configured) {
        setSelectedProvider(data.provider);
        setSelectedModel(data.model);
        if (data.baseUrl) setBaseUrl(data.baseUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    setSelectedModel(PROVIDERS[provider]?.models[0]?.id || '');
    setApiKey('');
  };

  const handleSave = async () => {
    if (selectedProvider !== 'mock' && selectedProvider !== 'ollama' && !apiKey.trim()) {
      toast({ type: 'error', title: 'API Key Required', message: 'Please enter a valid API key.' });
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post('/ai-config', { 
        provider: selectedProvider, 
        model: selectedModel, 
        apiKey: (selectedProvider === 'mock' || selectedProvider === 'ollama') ? 'not-needed' : apiKey,
        baseUrl: selectedProvider === 'ollama' ? baseUrl : undefined
      });
      toast({ type: 'success', title: '✅ AI Provider Saved', message: data.message });
      setApiKey('');
      await fetchConfig();
    } catch (err: any) {
      toast({ type: 'error', title: 'Save Failed', message: 'Failed to save configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete('/ai-config');
      toast({ type: 'info', title: 'Config Removed' });
      setCurrentConfig(null);
    } catch (err: any) {
      toast({ type: 'error', title: 'Delete Failed' });
    } finally {
      setDeleting(false);
    }
  };

  const providerConfig = PROVIDERS[selectedProvider]!;

  return (
    <div className="space-y-10 pb-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" /> Workspace Settings
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Configure models, security, and integrations.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
        <div className="space-y-10">
          {/* AI Config */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5" /> AI Engine
            </h2>

            {!loadingConfig && currentConfig?.configured && (
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-bold text-emerald-800 text-sm">{PROVIDERS[currentConfig.provider]?.label}</p>
                    <p className="text-emerald-700 text-xs font-mono">{currentConfig.apiKeyMasked}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            )}

            <Card className="border-none shadow-xl">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Provider</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PROVIDERS).map(([key, p]) => (
                      <button
                        key={key}
                        onClick={() => handleProviderChange(key)}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                          selectedProvider === key ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Model</label>
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

                {selectedProvider !== 'mock' && selectedProvider !== 'ollama' && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">API Key</label>
                    <input
                      type="password"
                      className="w-full h-10 px-3 rounded-lg border bg-white focus:ring-2 focus:ring-primary outline-none text-sm font-mono"
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                    />
                  </div>
                )}

                {selectedProvider === 'ollama' && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Local URL</label>
                    <input
                      type="text"
                      className="w-full h-10 px-3 rounded-lg border bg-white focus:ring-2 focus:ring-primary outline-none text-sm font-mono"
                      value={baseUrl}
                      onChange={e => setBaseUrl(e.target.value)}
                    />
                  </div>
                )}

                <Button className="w-full font-bold h-11" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <Bot className="w-4 h-4 mr-2" />}
                  Save AI Engine
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">🔗 Integrations</h2>
            <JiraIntegration />
          </div>
        </div>

        <div className="space-y-10">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> Security
            </h2>
            <TwoFactorSettings />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sun className="w-5 h-5" /> Personalization
            </h2>
            <Card className="border-none shadow-xl">
              <CardContent className="p-6">
                <p className="text-sm font-bold text-slate-700 mb-4">Application Theme</p>
                <ThemeToggle />
                <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-medium">
                  Switch between Light, Dark, or follow your System preference.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Billing
            </h2>
            <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden relative">
              <CardContent className="p-6">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Enterprise Tier</p>
                <h3 className="text-2xl font-black mt-1">₹3,999<span className="text-xs opacity-50 font-medium"> / month</span></h3>
                <div className="mt-6 flex gap-2">
                  <Link href="/pricing" className="flex-1">
                    <Button variant="secondary" className="w-full font-bold text-xs">Manage Plan</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
