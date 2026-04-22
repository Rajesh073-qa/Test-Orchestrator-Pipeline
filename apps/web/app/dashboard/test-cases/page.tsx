'use client';

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2, Beaker, ChevronRight, AlertCircle, CheckCircle2, Clock,
  Plus, Search, Filter, ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

interface TestCase {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  type?: string;
  createdAt: string;
  steps?: { id: string; stepNumber: number; description: string }[];
}

const priorityColor: Record<string, string> = {
  High: 'bg-red-50 text-red-700 border-red-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const typeColor: Record<string, string> = {
  Positive: 'bg-blue-50 text-blue-700 border-blue-200',
  Negative: 'bg-orange-50 text-orange-700 border-orange-200',
  Edge: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function TestCasesPage() {
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');

  const { data: testCases, isLoading, error } = useQuery<TestCase[]>({
    queryKey: ['test-cases'],
    queryFn: async () => {
      const { data } = await api.get('/test-case');
      return Array.isArray(data) ? data : [];
    },
  });

  const filtered = (testCases ?? []).filter(tc => {
    const matchSearch = tc.title.toLowerCase().includes(search.toLowerCase()) ||
      (tc.description || '').toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === 'ALL' || tc.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Beaker className="w-5 h-5 text-emerald-600" />
            </div>
            Test Cases
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {testCases?.length ?? 0} test cases across all your projects.
          </p>
        </div>
        <Link href="/dashboard/generators/test-cases">
          <Button className="font-bold gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Generate New
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search test cases..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-10 px-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary outline-none"
          value={filterPriority}
          onChange={e => setFilterPriority(e.target.value)}
        >
          <option value="ALL">All Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-bold text-sm">Failed to load test cases</p>
            <p className="text-xs mt-0.5">Please ensure you are logged in and have test cases generated.</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed border-slate-200 bg-transparent rounded-3xl">
          <CardContent className="py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Beaker className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {search || filterPriority !== 'ALL' ? 'No matching test cases' : 'No test cases yet'}
            </h3>
            <p className="text-slate-500 mt-1 text-sm">
              {search || filterPriority !== 'ALL'
                ? 'Try adjusting your filters.'
                : 'Use the AI generators to create test cases from your requirements.'}
            </p>
            {!search && filterPriority === 'ALL' && (
              <Link href="/dashboard/generators/test-cases">
                <Button className="mt-6 font-bold"><Plus className="w-4 h-4 mr-2" />Generate Test Cases</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map(tc => (
            <Card key={tc.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                    <Beaker className="w-5 h-5 text-emerald-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 truncate">{tc.title}</h3>
                      {tc.priority && (
                        <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full border", priorityColor[tc.priority] || 'bg-slate-50 text-slate-500 border-slate-200')}>
                          {tc.priority}
                        </span>
                      )}
                      {tc.type && (
                        <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full border", typeColor[tc.type] || 'bg-slate-50 text-slate-500 border-slate-200')}>
                          {tc.type}
                        </span>
                      )}
                    </div>
                    {tc.description && (
                      <p className="text-sm text-slate-500 mt-0.5 truncate">{tc.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-slate-400 font-bold">
                        {tc.steps?.length ?? 0} steps
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(tc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Link href={`/dashboard/test-cases/${tc.id}`} className="flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-9 w-9 group-hover:bg-primary group-hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
