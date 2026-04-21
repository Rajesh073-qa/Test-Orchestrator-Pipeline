'use client';

import { LayoutDashboard, Beaker, Folder, Settings, LogOut, Menu, X, Activity, Zap, Layout, Database, Code } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Test Plan Gen', href: '/dashboard/generators/test-plan', icon: Layout, badge: 'AI' },
  { name: 'Test Cases Gen', href: '/dashboard/generators/test-cases', icon: Database, badge: 'AI' },
  { name: 'Code Gen', href: '/dashboard/generators/code', icon: Code, badge: 'AI' },
  { name: 'Workflow Gen', href: '/dashboard/generators/workflow', icon: Zap, badge: 'New' },
  { name: 'Projects', href: '/dashboard/projects', icon: Folder },
  { name: 'Test Cases', href: '/dashboard/test-cases', icon: Beaker },
  { name: 'Jobs', href: '/dashboard/jobs', icon: Activity },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
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
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50/50">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r transition-all duration-300 flex flex-col",
        isSidebarOpen ? "w-64" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between border-b h-16">
          {isSidebarOpen && <span className="font-bold text-xl text-primary">Orchestor</span>}
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors group",
                !isSidebarOpen && "justify-center"
              )}
            >
              <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
              {isSidebarOpen && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </a>
          ))}
        </nav>

        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className={cn("w-full justify-start gap-3", !isSidebarOpen && "justify-center")}
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white/50 backdrop-blur-sm border-b sticky top-0 z-10 px-8 py-4 h-16 flex items-center justify-end">
           <div className="flex items-center gap-4">
              <div className="text-right">
                 <div className="text-sm font-bold uppercase tracking-tighter">QA Team</div>
                 <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Active Session</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                 QA
              </div>
           </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
