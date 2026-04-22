'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Workflow, Menu, X, LogOut, User, Activity, Zap, ChevronRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/');
  };

  const navLinks = isLoggedIn 
    ? [
        { name: 'Workspace', href: '/dashboard', icon: Zap },
        { name: 'AI History', href: '/dashboard/jobs', icon: Activity },
        { name: 'Projects', href: '/dashboard/projects', icon: Workflow },
      ]
    : [
        { name: 'Features', href: '/#features' },
        { name: 'How it Works', href: '/how-it-works' },
        { name: 'Pricing', href: '/pricing' },
      ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 border-b",
      scrolled 
        ? "bg-[#020617]/80 backdrop-blur-xl border-slate-900 py-3 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.5)]" 
        : "bg-transparent py-6 border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-12">
            <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
              <div className="w-11 h-11 rounded-[0.9rem] bg-white flex items-center justify-center shadow-2xl shadow-white/10 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                <Workflow className="text-slate-900 w-6 h-6" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black tracking-tighter text-white">AuraTest</span>
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">AI-Native</span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8 ml-8">
              <ThemeToggle />
              <div className="w-px h-4 bg-slate-800 mx-2" />
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-xs font-black uppercase tracking-widest transition-all hover:text-white relative group",
                    pathname === link.href ? "text-white" : "text-slate-500"
                  )}
                >
                  {link.name}
                  <span className={cn(
                    "absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300",
                    pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                  )} />
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-white rounded-xl">
                    Go to Workspace <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
                <div className="w-px h-6 bg-slate-800 mx-2" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-red-500 rounded-xl gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" /> Logout
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-white rounded-xl px-6">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-white hover:bg-slate-100 text-slate-900 font-black text-[10px] uppercase tracking-widest rounded-xl px-8 h-12 shadow-2xl shadow-white/5 group">
                    Get Started <Sparkles className="w-3.5 h-3.5 ml-2 text-primary group-hover:rotate-12 transition-transform" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden">
            <Button variant="ghost" size="icon" className="rounded-xl w-12 h-12 hover:bg-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[72px] bg-[#020617]/95 backdrop-blur-2xl border-b border-slate-900 p-8 space-y-8 animate-in slide-in-from-top-4 duration-300 shadow-2xl">
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-2xl font-black text-white hover:text-primary tracking-tighter"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-8 border-t border-slate-900 flex flex-col gap-4">
            {isLoggedIn ? (
              <Button variant="outline" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 border-slate-800 text-white" onClick={handleLogout}>
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            ) : (
              <>
                <Link href="/login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs text-white">Login</Button>
                </Link>
                <Link href="/register" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest text-xs">Get Started Free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
