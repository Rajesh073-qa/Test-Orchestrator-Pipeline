'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Workflow, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import apiClient from '@/lib/api-client';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER', // Default role
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/auth/register', formData);
      // Auto login after registration or redirect to login
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-6">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Workflow className="text-white w-7 h-7" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight">Join AuraTest</CardTitle>
            <CardDescription className="text-slate-500">
              Create your account to start automating your QA
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-10 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-10 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-10 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Role
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="USER">QA Engineer</option>
                  <option value="ADMIN">Team Lead / Admin</option>
                </select>
              </div>
            </div>

            <Button 
              className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <>Create Account <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in instead
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
