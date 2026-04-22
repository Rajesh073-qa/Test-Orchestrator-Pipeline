'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import {
  Users, Search, Shield, UserCheck, Ban, Trash2, RefreshCw,
  ChevronDown, CheckCircle2, Mail, Calendar, ArrowLeft, Loader2,
  Filter, Download, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useToast } from '@/components/toast';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  is2FAEnabled: boolean;
  createdAt: string;
  _count?: { projects: number; jobs: number };
}

const ROLES = ['ADMIN', 'QA', 'USER', 'VIEWER'];

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700 border-red-200',
  QA: 'bg-blue-100 text-blue-700 border-blue-200',
  USER: 'bg-slate-100 text-slate-600 border-slate-200',
  VIEWER: 'bg-slate-50 text-slate-400 border-slate-100',
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data ?? []);
    } catch (e) {
      toast({ type: 'error', title: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast({ type: 'success', title: '✅ Role Updated', message: `User role changed to ${newRole}` });
    } catch (e: any) {
      toast({ type: 'error', title: 'Update Failed', message: e?.response?.data?.message || 'Could not update role.' });
    } finally {
      setUpdatingId(null);
    }
  };

  const exportCSV = () => {
    const header = 'ID,Email,Name,Role,Projects,Jobs,Joined';
    const rows = users.map(u =>
      `${u.id},${u.email},${u.name || ''},${u.role},${u._count?.projects || 0},${u._count?.jobs || 0},${new Date(u.createdAt).toLocaleDateString()}`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'users.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const filtered = users.filter(u => {
    const matchSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === 'ALL' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard/admin" className="text-xs text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Admin
          </Link>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-red-600" />
            </div>
            User Management
          </h1>
          <p className="text-slate-500 font-medium mt-1">{users.length} registered users across the platform.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} className="font-bold border-slate-200 gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={fetchUsers} className="font-bold border-slate-200 gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ROLES.map(role => {
          const count = users.filter(u => u.role === role).length;
          return (
            <Card key={role} className="border-none shadow-sm cursor-pointer hover:shadow-md transition-all" onClick={() => setFilterRole(filterRole === role ? 'ALL' : role)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('text-[10px] font-black px-2 py-1 rounded-full border', roleColors[role])}>
                  {role}
                </div>
                <span className="text-2xl font-black text-slate-900">{count}</span>
                {filterRole === role && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by email or name..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Projects</th>
                <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Jobs</th>
                <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">2FA</th>
                <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="text-left px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : filtered.map(user => (
                <tr key={user.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                        {(user.name || user.email).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{user.name || '—'}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <select
                        className={cn('text-[10px] font-black px-2 py-1 rounded-full border cursor-pointer outline-none pr-5 appearance-none', roleColors[user.role] || roleColors.USER)}
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingId === user.id}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {updatingId === user.id && (
                        <Loader2 className="w-3 h-3 animate-spin absolute right-1 top-1 text-slate-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-700">{user._count?.projects ?? 0}</td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-700">{user._count?.jobs ?? 0}</td>
                  <td className="px-4 py-3">
                    {user.is2FAEnabled ? (
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">ON</span>
                    ) : (
                      <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">OFF</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50">
                        <Ban className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
