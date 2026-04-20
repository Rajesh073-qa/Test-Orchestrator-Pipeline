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
  Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const ctaLink = isLoggedIn ? '/orchestrator' : '/register';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <main className="flex-1">
        {/* --- Hero Section --- */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-2xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
                  <Zap className="w-3 h-3" />
                  AI-Powered Test Automation
                </div>
                <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
                  Orchestrate your <span className="text-primary">QA Workflow</span> with AI
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed mb-10">
                  Transform requirements into automated test suites in seconds. 
                  Generate Playwright scripts, track jobs in real-time, and accelerate your release cycle with the power of LLMs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href={ctaLink}>
                    <Button size="lg" className="h-14 px-8 text-lg gap-2 shadow-xl shadow-primary/20 w-full sm:w-auto">
                      Start Building Automation <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/how-it-works">
                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto">
                      See How it Works
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 grayscale opacity-50">
                  <div className="font-bold text-slate-400 text-xs tracking-widest">TRUSTED BY TEAMS AT</div>
                  <div className="text-xl font-black italic">TECHFLOW</div>
                  <div className="text-xl font-black italic">QUICKSCAN</div>
                  <div className="text-xl font-black italic">NEXUS</div>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-violet-500/20 blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                <div className="relative rounded-2xl border border-white/20 shadow-2xl overflow-hidden glass">
                  <Image 
                    src="/hero.png" 
                    alt="Test Orchestrator Dashboard" 
                    width={800} 
                    height={600}
                    className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl -z-10"></div>
        </section>

        {/* --- Features Section --- */}
        <section id="features" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Everything you need to automate QA</h2>
              <p className="text-lg text-slate-600">From manual input to cloud-scale exports, Orchestor handles the heavy lifting of test maintenance.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Jira Smart Sync",
                  desc: "Automatically import user stories and acceptance criteria from Jira. Keep tests in sync with product requirements.",
                  icon: BarChart3,
                  color: "bg-blue-500"
                },
                {
                  title: "AI Test Generator",
                  desc: "Generate comprehensive test cases including positive, negative, and edge scenarios using GPT-4o.",
                  icon: Bot,
                  color: "bg-violet-500"
                },
                {
                  title: "Script Generation",
                  desc: "One-click generation of Playwright or Cypress code following Page Object Model best practices.",
                  icon: Cpu,
                  color: "bg-cyan-500"
                },
                {
                  title: "Real-time Orchestration",
                  desc: "Monitor bulk generation jobs with our distributed worker system powered by BullMQ and Redis.",
                  icon: Zap,
                  color: "bg-amber-500"
                },
                {
                  title: "Manual Input Mode",
                  desc: "Don't have Jira? Just paste your requirements and let our AI parse them into structured test suites.",
                  icon: Workflow,
                  color: "bg-emerald-500"
                },
                {
                  title: "Enterprise Ready",
                  desc: "RBAC, JWT authentication, and full audit logs for large-scale engineering organizations.",
                  icon: CheckCircle2,
                  color: "bg-slate-900"
                }
              ].map((feature, i) => (
                <Card key={i} className="border-none shadow-none hover:bg-slate-50 transition-colors group">
                  <CardHeader>
                    <div className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <feature.icon className="text-white w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-slate-600 text-base leading-relaxed">
                      {feature.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* --- CTA Section --- */}
        <section className="py-24 bg-slate-900 overflow-hidden relative">
          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">Ready to speed up your QA?</h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              Join hundreds of engineers who are saving 10+ hours a week on test maintenance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={ctaLink}>
                <Button size="lg" className="h-14 px-10 text-lg bg-white text-slate-900 hover:bg-slate-100">
                  {isLoggedIn ? 'Go to Orchestrator' : 'Start Free Trial'}
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg text-white border-slate-700 hover:bg-slate-800">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Background Decorative */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]"></div>
        </section>
      </main>

      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Workflow className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Orchestor</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 Test Orchestrator. Built with passion for quality.
          </div>
          <div className="flex gap-6">
            <Link href="/how-it-works" className="text-slate-400 hover:text-primary transition-colors">How it Works</Link>
            <Link href="/pricing" className="text-slate-400 hover:text-primary transition-colors">Pricing</Link>
            <Link href="/jobs" className="text-slate-400 hover:text-primary transition-colors">Jobs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
