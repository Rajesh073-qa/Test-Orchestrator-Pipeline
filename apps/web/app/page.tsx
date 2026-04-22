'use client';

import Image from "next/image";
import Link from "next/link";
import { 
  Bot, 
  Zap, 
  Shield, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2,
  Cpu,
  Workflow,
  Sparkles,
  ChevronRight,
  Play,
  Globe,
  Layers,
  Code,
  Users,
  Star,
  Quote,
  Link2,
  PlayCircle,
  Database,
  Activity,
  Terminal,
  MousePointer2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { cn } from "@/lib/utils";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const ctaLink = isLoggedIn ? '/dashboard' : '/register';

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] selection:bg-primary/30 selection:text-white overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* --- Hero Section: 2026 Hyper-Modern Style --- */}
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Advanced Background: Grid + Orbs */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-30" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-600/10 blur-[100px] rounded-full opacity-20" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-left-4 duration-700">
                  <Sparkles className="w-3 h-3" />
                  Next-Gen QA Infrastructure
                </div>
                <h1 className="text-6xl lg:text-8xl font-black text-white tracking-tighter leading-[0.85] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  Orchestrate <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">Quality</span> <br/>
                  at Scale.
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed max-w-xl mb-12 font-medium animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
                  The first AI-native test orchestrator. Zero maintenance, infinite coverage, and production-ready automation in seconds.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-5 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-200">
                  <Link href={ctaLink}>
                    <Button size="lg" className="h-16 px-10 text-lg font-black rounded-2xl bg-white hover:bg-slate-100 !text-slate-900 shadow-2xl shadow-white/10 gap-3 group transition-all">
                      Start Building <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold rounded-2xl border-slate-800 !text-white hover:bg-slate-900 gap-2 backdrop-blur-sm">
                      <Terminal className="w-4 h-4" /> View Pricing
                    </Button>
                  </Link>
                </div>

                <div className="mt-16 flex items-center gap-8 border-l border-slate-800 pl-8">
                   <div className="flex -space-x-4">
                     {[1,2,3,4].map(i => (
                       <div key={i} className="w-10 h-10 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center font-bold text-[10px] text-white">
                         {String.fromCharCode(64+i)}
                       </div>
                     ))}
                   </div>
                   <div className="text-xs text-slate-500 font-bold tracking-tight">
                     <span className="text-white block text-sm">Joined by 1,200+ engineers</span>
                     Scaling QA today
                   </div>
                </div>
              </div>

              {/* Floating UI Elements */}
              <div className="lg:col-span-5 relative hidden lg:block animate-in fade-in zoom-in duration-1000">
                <div className="relative z-10 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 backdrop-blur-xl p-2 shadow-2xl">
                   <Image 
                    src="/dashboard-preview.png" 
                    alt="AuraTest Dashboard" 
                    width={600} 
                    height={800}
                    className="rounded-[2rem] shadow-2xl"
                  />
                  {/* Floating Micro-Cards */}
                  <div className="absolute -top-6 -right-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md shadow-2xl animate-bounce delay-700">
                    <div className="flex items-center gap-3">
                       <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                       <div className="text-[10px] font-black text-white uppercase tracking-widest">Automation Ready</div>
                    </div>
                  </div>
                  <div className="absolute -bottom-10 -left-10 p-6 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md shadow-2xl animate-pulse">
                    <div className="flex items-center gap-4">
                       <Bot className="w-8 h-8 text-primary" />
                       <div>
                         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">AI Agent</div>
                         <div className="text-xs font-bold text-white">Generating scripts...</div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 border-y border-slate-900 bg-slate-900/20">
          <div className="max-w-7xl mx-auto px-6 overflow-hidden">
            <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-12">Empowering teams at world-class companies</p>
            <div className="flex flex-wrap justify-between items-center gap-12 opacity-80 transition-all duration-700">
              <span className="text-xl font-black tracking-tighter text-white/90">TECHFLOW</span>
              <span className="text-xl font-black tracking-tighter text-white/90">QUICKSCAN</span>
              <span className="text-xl font-black tracking-tighter text-white/90">NEXUS</span>
              <span className="text-xl font-black tracking-tighter text-white/90">CORE.IO</span>
              <span className="text-xl font-black tracking-tighter text-white/90">QUANTUM</span>
              <span className="text-xl font-black tracking-tighter text-white/90">ORBIT.AI</span>
            </div>
          </div>
        </section>

        {/* --- Bento Grid Features: 2026 Design Standard --- */}
        <section id="features" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24">
              <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-6">Engineered for the <br/> <span className="italic text-slate-500">Autonomous Era</span>.</h2>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 auto-rows-[240px]">
              {/* Feature 1: Large Bento */}
              <div className="lg:col-span-8 lg:row-span-2 p-10 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-[#020617] border border-slate-800 relative overflow-hidden group">
                <div className="relative z-10 h-full flex flex-col">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 border border-primary/20">
                    <Database className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4">Unified Test Context</h3>
                  <p className="text-slate-400 font-medium text-lg max-w-md leading-relaxed">
                    Automatically ingest Jira stories, Confluence docs, and Figma designs to build a single source of truth for your validation logic.
                  </p>
                  <div className="mt-auto">
                    <Button variant="link" className="p-0 text-primary font-bold gap-2">Explore Integration <ChevronRight className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="absolute top-10 right-[-10%] w-[300px] h-[300px] bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-colors" />
              </div>

              {/* Feature 2: Medium Bento */}
              <div className="lg:col-span-4 lg:row-span-1 p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 group hover:border-violet-500/50 transition-all">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                     <Zap className="w-6 h-6 text-violet-500" />
                   </div>
                   <h3 className="text-xl font-black text-white">Instant Gen</h3>
                </div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Generate 100+ test cases across different priority levels in under 10 seconds.
                </p>
              </div>

              {/* Feature 3: Medium Bento */}
              <div className="lg:col-span-4 lg:row-span-1 p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 group hover:border-emerald-500/50 transition-all">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                     <Code className="w-6 h-6 text-emerald-500" />
                   </div>
                   <h3 className="text-xl font-black text-white">POM Ready</h3>
                </div>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Export directly to Playwright using the Page Object Model. Clean, readable, and dry.
                </p>
              </div>

              {/* Feature 4: Small Bento */}
              <div className="lg:col-span-4 lg:row-span-1 p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800">
                <Activity className="w-8 h-8 text-slate-500 mb-6" />
                <h3 className="text-xl font-black text-white mb-2">Real-time Jobs</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Live Worker Sync</p>
              </div>

              {/* Feature 5: Small Bento */}
              <div className="lg:col-span-4 lg:row-span-1 p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800">
                <Bot className="w-8 h-8 text-slate-500 mb-6" />
                <h3 className="text-xl font-black text-white mb-2">AI Agent</h3>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Autonomous Support</p>
              </div>

              {/* Feature 6: Wide Bento */}
              <div className="lg:col-span-4 lg:row-span-1 p-8 rounded-[2.5rem] bg-gradient-to-r from-slate-900 to-[#1e1b4b] border border-slate-800 flex items-center justify-between overflow-hidden">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">Scale Fast.</h3>
                  <p className="text-slate-500 text-sm font-bold">Enterprise ready RBAC support.</p>
                </div>
                <Shield className="w-16 h-16 text-white/5 -mr-4" />
              </div>
            </div>
          </div>
        </section>

        {/* --- Workflow Section: Full-Bleed Dark --- */}
        <section className="py-40 bg-[#020617] relative border-t border-slate-900">
          <div className="max-w-5xl mx-auto px-6 relative z-10">
            <div className="text-center mb-24">
               <div className="text-primary font-black text-xs uppercase tracking-[0.3em] mb-4">The Workflow</div>
               <h2 className="text-5xl font-black text-white tracking-tighter">Your Pipeline, <span className="italic">Elevated</span>.</h2>
            </div>

            <div className="space-y-32">
               {[
                 {
                   title: "Requirement Ingestion",
                   desc: "Sync directly with your project management tools. AI identifies actors and edge cases automatically.",
                   icon: Database,
                   color: "text-blue-500"
                 },
                 {
                   title: "Strategic Orchestration",
                   desc: "Orchestrate test plans with technical precision. Define environments, risks, and entry criteria in bulk.",
                   icon: Layers,
                   color: "text-violet-500"
                 },
                 {
                   title: "Autonomous Execution",
                   desc: "Download battle-tested automation scripts or run them in our cloud environment instantly.",
                   icon: PlayCircle,
                   color: "text-emerald-500"
                 }
               ].map((step, i) => (
                 <div key={i} className={cn("flex flex-col gap-12 items-center", i % 2 !== 0 ? "md:flex-row-reverse" : "md:flex-row")}>
                   <div className="flex-1 space-y-6 text-center md:text-left">
                     <div className="text-6xl font-black text-slate-800 opacity-20">0{i+1}</div>
                     <h3 className="text-4xl font-black text-white tracking-tight">{step.title}</h3>
                     <p className="text-xl text-slate-400 leading-relaxed font-medium">{step.desc}</p>
                     <Button variant="outline" className="h-12 px-8 rounded-xl border-slate-800 text-white font-bold hover:bg-slate-900">Learn More</Button>
                   </div>
                   <div className="flex-1 flex justify-center">
                      <div className="w-64 h-64 rounded-[3rem] bg-slate-900 border border-slate-800 flex items-center justify-center relative group">
                        <div className="absolute inset-0 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
                        <step.icon className={cn("w-24 h-24 relative z-10 transition-transform duration-500 group-hover:scale-110", step.color)} />
                      </div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* --- Testimonials: Modern Masonry --- */}
        <section className="py-40 bg-slate-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-24">
               <div className="max-w-xl">
                 <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter mb-6">Don't just take our <span className="text-primary italic">word</span> for it.</h2>
                 <p className="text-slate-400 font-medium">Join 500+ teams that redefined their QA culture with AuraTest.</p>
               </div>
               <div className="flex gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-2xl font-black text-white tracking-tight">4.9/5</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Average Rating</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-2xl font-black text-white tracking-tight">500+</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Teams Onboarded</div>
                  </div>
               </div>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
               {[
                 { name: "Alex Rivet", role: "CTO @ Nexus", content: "The level of detail in the AI-generated test plans is staggering. It's like having a principal QA engineer on demand.", height: "h-auto" },
                 { name: "Priya Das", role: "QA Lead @ Fintechify", content: "Orchestor is the first tool that actually speaks 'automation'. No more broken selectors.", height: "h-auto" },
                 { name: "John Wick", role: "Senior Dev @ Orbit", content: "We cut our release time by 40%. The ROI was clear within the first week.", height: "h-auto" },
                 { name: "Sarah Chen", role: "VP Eng @ TechFlow", content: "Beautiful UI, powerful backend. Finally, a QA tool that doesn't look like it's from 1995.", height: "h-auto" },
                 { name: "Marcus Thorne", role: "Architect @ Core", content: "The Playwright export feature is flawless. It follows our team's POM patterns perfectly.", height: "h-auto" },
                 { name: "Emma Lou", role: "Product Manager", content: "Now I can generate test cases directly from my user stories without asking a developer.", height: "h-auto" }
               ].map((t, i) => (
                 <div key={i} className="break-inside-avoid p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                   <div className="flex gap-1 mb-4">
                     {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                   </div>
                   <p className="text-slate-300 font-medium italic mb-6 leading-relaxed">"{t.content}"</p>
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center font-black text-xs text-white">
                        {t.name[0]}
                     </div>
                     <div>
                       <div className="font-bold text-white text-sm">{t.name}</div>
                       <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.role}</div>
                     </div>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* --- Final CTA: Hyper-Clean --- */}
        <section className="py-48 bg-[#020617] relative">
          <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full -z-10" />
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-none mb-10">
              Ready to <br/> <span className="text-primary italic">Transform</span>?
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
              <Link href={ctaLink}>
                <Button size="lg" className="h-16 px-12 text-lg font-black rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                  Start Building for Free
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                 No credit card required. Cancel anytime.
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#020617] pt-24 pb-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-20">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                  <Workflow className="text-slate-900 w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tight text-white">AuraTest</span>
              </Link>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8 max-w-xs">
                The future of QA orchestration. Scale your quality assurance with autonomous AI agents.
              </p>
            </div>
            
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-white mb-6">Product</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><Link href="/#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-white mb-6">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><Link href="/how-it-works" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/register" className="hover:text-primary transition-colors">Join Team</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Enterprise</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-white mb-6">Legal</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Terms</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-white mb-6">Newsletter</h4>
              <div className="flex gap-2">
                <input type="email" placeholder="Email" className="w-full h-10 px-4 rounded-lg bg-slate-900 border border-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-xs font-bold text-white" />
                <Button size="icon" className="w-10 h-10 rounded-lg shrink-0"><ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-slate-600 text-xs font-bold">
              © 2026 Test Orchestrator. Designed in 2026 style.
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Global Uptime 100%
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
