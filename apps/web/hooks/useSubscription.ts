'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';

export type TrialStatus = 'FREE_TRIAL_AVAILABLE' | 'FREE_TRIAL_EXHAUSTED' | 'PRO' | 'ENTERPRISE' | 'UNLIMITED' | 'UNKNOWN';

export interface SubscriptionState {
  status: TrialStatus;
  plan?: string;
  loading: boolean;
  isPro: boolean;
  isFree: boolean;
  isExhausted: boolean;
  isUnlimited: boolean;
  refresh: () => void;
}

export function useSubscription(): SubscriptionState {
  const [status, setStatus] = useState<TrialStatus>('UNKNOWN');
  const [plan, setPlan] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/ai/trial-status');
      setStatus(data.status);
      setPlan(data.plan);
    } catch {
      setStatus('UNKNOWN');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  return {
    status,
    plan,
    loading,
    isPro: status === 'PRO' || status === 'ENTERPRISE' || status === 'UNLIMITED',
    isFree: status === 'FREE_TRIAL_AVAILABLE',
    isExhausted: status === 'FREE_TRIAL_EXHAUSTED',
    isUnlimited: status === 'UNLIMITED',
    refresh: fetch,
  };
}
