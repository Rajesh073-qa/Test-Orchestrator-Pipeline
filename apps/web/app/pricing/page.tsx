import Link from "next/link";
import { CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      price: "$0",
      description: "Perfect for individual QA engineers.",
      features: ["5 Projects", "AI Test Case Generation", "Basic Export", "Community Support"],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$49",
      description: "Ideal for growing agile teams.",
      features: ["Unlimited Projects", "Jira Integration", "Advanced AI Code Gen", "Priority Support", "CI/CD Integration"],
      cta: "Go Pro",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large scale organizations.",
      features: ["Self-hosted Option", "Custom LLM Training", "SLA & Training", "Dedicated Account Manager"],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      <main className="max-w-6xl mx-auto py-24 px-6">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Simple, Transparent Pricing</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Choose the plan that fits your team size and automation needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`relative p-10 rounded-[2.5rem] bg-white border ${plan.popular ? 'border-primary ring-4 ring-primary/5' : 'border-slate-100'} shadow-xl`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5">
                  <Zap className="w-3 h-3 fill-white" /> Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-slate-500 text-sm mt-2">{plan.description}</p>
              </div>
              <div className="mb-8">
                <span className="text-5xl font-black text-slate-900">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-slate-400 font-medium">/mo</span>}
              </div>
              <div className="space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" className="block">
                <Button 
                  className={`w-full h-12 rounded-xl font-bold text-lg ${plan.popular ? 'bg-primary' : 'variant-outline'}`}
                  variant={plan.popular ? 'primary' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
