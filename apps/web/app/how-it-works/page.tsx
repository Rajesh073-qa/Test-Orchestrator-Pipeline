import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HowItWorksPage() {
  const steps = [
    {
      title: "Connect Requirements",
      description: "Link your Jira project or paste raw documentation directly into our orchestrator.",
      icon: "01"
    },
    {
      title: "AI Analysis",
      description: "Our LLM engine parses unstructured data into structured User Stories and Acceptance Criteria.",
      icon: "02"
    },
    {
      title: "Generate Assets",
      description: "Automatically produce Test Plans, comprehensive Test Cases, and Playwright automation code.",
      icon: "03"
    },
    {
      title: "Export & Deploy",
      description: "Download a ready-to-run automation suite or push directly to your CI/CD pipeline.",
      icon: "04"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto py-24 px-6">
        <div className="text-center mb-20">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">How it Works</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Orchestor transforms the way teams handle QA by automating the bridge between requirements and automation code.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.icon} className="relative p-8 rounded-3xl border border-slate-100 bg-slate-50/50">
              <span className="text-6xl font-black text-primary/10 absolute top-4 right-8">{step.icon}</span>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-32 p-12 rounded-[3rem] bg-primary text-white text-center shadow-2xl shadow-primary/20">
          <h2 className="text-3xl font-bold mb-6">Ready to automate your QA?</h2>
          <Link href="/register">
            <Button size="lg" className="bg-white text-primary hover:bg-slate-100 h-14 px-8 text-lg font-bold">
              Start Building Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
