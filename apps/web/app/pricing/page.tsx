'use client';

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Zap, Loader2, Crown, ArrowRight, Star, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";

const plans = [
  {
    id: "STARTER",
    name: "Free Trial",
    price: "₹0",
    period: "",
    badge: null,
    description: "Try the platform with 1 free AI generation.",
    features: [
      "1 free AI generation (any type)",
      "Test Plan or Test Cases or Code Gen",
      "Basic PDF export",
      "Community support",
    ],
    limitations: ["Limited to 1 generation", "No Jira integration", "No saved projects"],
    cta: "Get Started Free",
    ctaHref: "/register",
    highlighted: false,
    color: "border-slate-200",
  },
  {
    id: "PRO",
    name: "Pro",
    price: "₹3,999",
    period: "/mo",
    badge: "Most Popular",
    description: "Unlimited AI-powered QA automation for growing teams.",
    features: [
      "Unlimited AI generations",
      "All 4 generator types",
      "Jira issue import",
      "Playwright & Selenium code gen",
      "Full Workflow (plan + cases + code)",
      "PDF & bundle export",
      "Priority AI engine (GPT-4o / Groq)",
      "Projects & test case storage",
      "Priority support",
    ],
    limitations: [],
    cta: "Upgrade to Pro",
    ctaHref: null, // handled by checkout
    highlighted: true,
    color: "border-primary",
  },
  {
    id: "ENTERPRISE",
    name: "Enterprise",
    price: "₹19,999",
    period: "/mo",
    badge: null,
    description: "Enterprise-grade security and customization for large teams.",
    features: [
      "Everything in Pro",
      "Admin dashboard & user management",
      "Role-based access (Admin/QA/Viewer)",
      "Custom LLM / Ollama integration",
      "2FA security enforcement",
      "Dedicated account manager",
      "SLA guarantee (99.9% uptime)",
      "Priority onboarding & training",
    ],
    limitations: [],
    cta: "Contact Sales",
    ctaHref: "mailto:sales@auratest.ai",
    highlighted: false,
    color: "border-slate-200",
  },
];

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleCheckout = async (planId: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Not logged in — redirect to register
      window.location.href = `/register?redirect=/pricing`;
      return;
    }

    setLoadingPlan(planId);
    setError('');
    try {
      const { data } = await api.post('/payment/checkout', { plan: planId });
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('No checkout URL returned. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Checkout failed. Please try again.';
      setError(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto py-16 px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/5 text-primary text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Simple, Transparent Pricing
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">
            Power your QA team with AI
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Start free. Upgrade when you need more. No hidden fees.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-slate-500">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card for free tier</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cancel anytime</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> INR pricing</div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto py-20 px-6">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative p-8 rounded-3xl bg-white border-2 shadow-sm transition-all hover:shadow-xl",
                plan.highlighted ? "border-primary shadow-primary/10 shadow-lg scale-[1.02]" : plan.color
              )}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md shadow-primary/30">
                  <Zap className="w-3 h-3 fill-white" /> {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {plan.id === 'PRO' && <Crown className="w-5 h-5 text-primary" />}
                  {plan.id === 'ENTERPRISE' && <Shield className="w-5 h-5 text-slate-600" />}
                  {plan.id === 'STARTER' && <Star className="w-5 h-5 text-slate-400" />}
                  <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                </div>
                <p className="text-slate-500 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-black text-slate-900">{plan.price}</span>
                {plan.period && <span className="text-slate-400 font-medium">{plan.period}</span>}
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation) => (
                  <div key={limitation} className="flex items-start gap-3 opacity-50">
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-400 line-through">{limitation}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {plan.ctaHref ? (
                <Link href={plan.ctaHref}>
                  <Button
                    className={cn(
                      "w-full h-12 rounded-xl font-bold text-base gap-2",
                      plan.highlighted ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" : ""
                    )}
                    variant={plan.highlighted ? "primary" : "outline"}
                  >
                    {plan.cta} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={!!loadingPlan}
                  className={cn(
                    "w-full h-12 rounded-xl font-bold text-base gap-2",
                    plan.highlighted ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" : ""
                  )}
                  variant={plan.highlighted ? "primary" : "outline"}
                >
                  {loadingPlan === plan.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                  ) : (
                    <>{plan.cta} <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* FAQ / Trust Section */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-8 text-left">
            {[
              { q: 'What counts as a "free generation"?', a: 'Any one AI call — test plan, test cases, code gen, or workflow. You get exactly one, then the system prompts you to upgrade.' },
              { q: 'Does incognito mode bypass the limit?', a: 'No. The free trial is tied to your user account. Even in incognito, you must log in before generating.' },
              { q: 'How does payment work?', a: 'We use Stripe for secure card payments in INR. After successful payment, your account is instantly upgraded to Pro.' },
              { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription from your account settings at any time. Access continues until the billing period ends.' },
              { q: 'What AI models are supported?', a: 'OpenAI GPT-4o, Groq LLama, Gemini, Mistral, OpenRouter, and local Ollama. You can configure your own API key.' },
              { q: 'Is there a team plan?', a: 'The Enterprise plan supports unlimited users per organization with role-based access control (Admin, QA, Viewer).' },
            ].map(item => (
              <div key={item.q} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2">{item.q}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
