'use client';

import {
  LayoutDashboard, Beaker, Folder, Settings, LogOut, Menu, X,
  Activity, Zap, Layout, Database, Code, Shield, Users,
  BarChart2, Bell, ChevronDown, User
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getAuthUser, getUserInitials, type AuthUser } from "@/lib/auth";

// ── Nav Items per Role ──────────────────────────────────────────────────────

const ADMIN_NAV = [
  { name: 'Admin Overview', href: '/dashboard/admin', icon: Shield },
  { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
  { name: 'All Projects', href: '/dashboard/projects', icon: Folder },
  { name: 'All Jobs', href: '/dashboard/jobs', icon: Activity },
  { name: 'Test Cases', href: '/dashboard/test-cases', icon: Beaker },
  { name: 'AI Generators', href: '/dashboard/generators/workflow', icon: Zap, badge: 'AI' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const QA_NAV = [
  { name: 'My Dashboard', href: '/dashboard/qa', icon: LayoutDashboard },
  { name: 'Test Plan Gen', href: '/dashboard/generators/test-plan', icon: Layout, badge: 'AI' },
  { name: 'Test Cases Gen', href: '/dashboard/generators/test-cases', icon: Database, badge: 'AI' },
  { name: 'Code Gen', href: '/dashboard/generators/code', icon: Code, badge: 'AI' },
  { name: 'Workflow Gen', href: '/dashboard/generators/workflow', icon: Zap, badge: 'New' },
  { name: 'My Projects', href: '/dashboard/projects', icon: Folder },
  { name: 'My Test Cases', href: '/dashboard/test-cases', icon: Beaker },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Activity },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      const authUser = getAuthUser();
      setUser(authUser);
      setIsAuthChecking(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (isAuthChecking) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';
  const navItems = isAdmin ? ADMIN_NAV : QA_NAV;
  const initials = getUserInitials(user);
  const roleLabel = user?.role === 'ADMIN' ? 'Admin' : user?.role === 'QA' ? 'QA Engineer' : 'User';
  const roleColor = user?.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';

  return (
    <div className="flex h-screen bg-slate-50/50">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r transition-all duration-300 flex flex-col shadow-sm",
        isSidebarOpen ? "w-64" : "w-16"
      )}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b h-16 flex-shrink-0">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", isAdmin ? "bg-red-600" : "bg-primary")}>
                {isAdmin ? <Shield className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4 text-white" />}
              </div>
              <span className="font-black text-lg text-slate-900">Orchestor</span>
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Role Badge */}
        {isSidebarOpen && (
          <div className="px-4 py-2 border-b">
            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest", roleColor)}>
              {roleLabel}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard/admin' && item.href !== '/dashboard/qa' && pathname.startsWith(item.href));
            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  !isSidebarOpen && "justify-center px-2"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700")} />
                {isSidebarOpen && (
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className={cn(
                        "text-[9px] font-black px-1.5 py-0.5 rounded ml-2 flex-shrink-0",
                        isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </a>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t flex-shrink-0">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0", isAdmin ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary")}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.email}</p>
                <p className="text-[10px] text-slate-400 capitalize">{roleLabel}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500 flex-shrink-0" onClick={handleLogout}>
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="w-full h-8 text-slate-400 hover:text-red-500" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Topbar */}
        <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10 px-6 py-3 h-14 flex items-center justify-between">
          <div className="text-sm text-slate-400 font-medium capitalize">
            {pathname.split('/').filter(Boolean).join(' / ')}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <div className="flex items-center gap-2">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-black", isAdmin ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary")}>
                {initials}
              </div>
              {isAdmin && (
                <span className="hidden sm:block text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-widest">Admin</span>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
