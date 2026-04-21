'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { ShieldCheck, ShieldAlert, Loader2, QrCode, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/toast';

export default function TwoFactorSettings() {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [token, setToken] = useState('');

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleGenerateSecret = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/2fa/generate');
      setSetupData(data);
    } catch (err) {
      toast({ type: 'error', title: 'Setup Failed', message: 'Could not generate 2FA secret.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!token) return;
    setVerifying(true);
    try {
      const { data } = await api.post('/auth/2fa/verify', { token });
      if (data.success) {
        toast({ type: 'success', title: '✅ 2FA Enabled', message: 'Your account is now protected with two-factor authentication.' });
        setSetupData(null);
        await fetchProfile();
      } else {
        toast({ type: 'error', title: 'Invalid Code', message: 'The verification code is incorrect.' });
      }
    } catch (err) {
      toast({ type: 'error', title: 'Error', message: 'Verification failed.' });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div className="h-20 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>;

  return (
    <Card className="border-none shadow-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${user?.is2FAEnabled ? 'bg-emerald-50' : 'bg-amber-50'}`}>
              <ShieldCheck className={`w-6 h-6 ${user?.is2FAEnabled ? 'text-emerald-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Two-Factor Authentication (2FA)</h3>
              <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
            </div>
          </div>
          <div className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest ${user?.is2FAEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
            {user?.is2FAEnabled ? 'Protected' : 'Not Enabled'}
          </div>
        </div>

        {user?.is2FAEnabled ? (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-sm font-bold text-emerald-900">Your account is secure</p>
              <p className="text-xs text-emerald-700">Two-factor authentication is active. You will be prompted for a code upon login.</p>
            </div>
          </div>
        ) : setupData ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-center bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="bg-white p-4 rounded-xl shadow-inner border border-slate-200">
                <img src={setupData.qrCodeUrl} alt="2FA QR Code" className="w-40 h-40" />
              </div>
              <div className="space-y-4 flex-1">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">1. Scan QR Code</p>
                  <p className="text-xs text-slate-500">Use Google Authenticator, Authy, or any TOTP app to scan this code.</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">2. Enter Verification Code</p>
                  <p className="text-xs text-slate-500">Type the 6-digit code from your app below.</p>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="000000"
                    className="h-10 px-3 rounded-lg border bg-white focus:ring-2 focus:ring-primary outline-none text-sm font-mono tracking-widest w-32"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                  <Button className="font-bold px-6" onClick={handleVerifyAndEnable} disabled={verifying}>
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enable 2FA'}
                  </Button>
                </div>
              </div>
            </div>
            <button onClick={() => setSetupData(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
              Cancel setup
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              We recommend enabling two-factor authentication to protect your automation projects and AI configurations from unauthorized access.
            </p>
            <Button variant="outline" className="font-bold border-slate-200" onClick={handleGenerateSecret}>
              <QrCode className="w-4 h-4 mr-2" /> Setup 2FA Now
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
