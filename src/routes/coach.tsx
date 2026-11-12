import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSmartSave } from "@/lib/smartsave/store";
import { computeScore, computeStats, money } from "@/lib/smartsave/selectors";
import { PageHeader, SectionCard, StatCard } from "@/components/smartsave/ui-bits";
import { getCoachAdvice } from "@/lib/smartsave/coach.functions";
import savebotAsset from "@/assets/savebot.png.asset.json";

export const Route = createFileRoute("/coach")({
  head: () => ({
    meta: [
      { title: "Savings Coach — AI Money Plan | SmartSave" },
      {
        name: "description",
        content:
          "Get an AI-powered savings plan built from your SmartSave virtual spending, goals and habits — educational coaching, not financial advice.",
      },
      { property: "og:title", content: "Savings Coach — AI Money Plan | SmartSave" },
      {
        property: "og:description",
        content: "AI coaching that turns your virtual spending data into a weekly savings plan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoachPage,
});

const PROMPTS = [
  "Build me a savings plan for this week.",
  "How do I cut my Wants without feeling deprived?",
  "What should I change to raise my SmartSave score?",
  "Can I reach my first goal on time?",
];

function CoachPage() {
  const { state } = useSmartSave();
  const stats = useMemo(() => computeStats(state), [state]);
  const score = useMemo(() => computeScore(state, stats), [state, stats]);
  const callCoach = useServerFn(getCoachAdvice);

  const [question, setQuestion] = useState("");
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async (q: string) => {
    setLoading(true);
    setAdvice(null);
    try {
      const res = await callCoach({
        data: {
          name: state.name ?? "",
          question: q,
          starting: stats.starting,
          spent: stats.spent,
          saved: stats.saved,
          remaining: stats.remaining,
          savingsRate: stats.savingsRate,
          needTotal: stats.needTotal,
          wantTotal: stats.wantTotal,
          score: score.score,
          streak: state.streak,
          topCategories: [...stats.byCategory]
            .sort((a, b) => b.value - a.value)
            .slice(0, 5)
            .map((c) => ({ label: c.label, value: Math.round(c.value) })),
          goals: state.goals.slice(0, 5).map((g) => ({
            name: g.name,
            target: g.target,
            saved: g.saved,
            targetDate: g.targetDate,
          })),
        },
      });
      setAdvice(res.text);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      toast.error(
        msg.includes("429")
          ? "Coach is busy right now — try again in a moment."
          : msg.includes("402")
            ? "AI credits are exhausted. Add credits to keep coaching."
            : "Couldn't reach the Savings Coach. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        emoji="🌱"
        title="Savings Coach"
        subtitle="AI coaching built from your virtual spending, goals and habits — educational only."
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard emoji="👛" label="Unallocated" value={money(stats.remaining)} />
        <StatCard emoji="🏦" label="Saved" value={money(stats.saved)} />
        <StatCard emoji="🛍️" label="Wants" value={money(stats.wantTotal)} />
        <StatCard emoji="⭐" label="Score" value={`${score.score}/100`} />
      </div>

      <SectionCard title="Ask your coach" desc="Your numbers are sent along so the plan fits your situation.">
        <div className="flex flex-wrap gap-2">
          {PROMPTS.map((p) => (
            <button
              key={p}
              disabled={loading}
              onClick={() => {
                setQuestion(p);
                void ask(p);
              }}
              className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(question || PROMPTS[0]!);
          }}
        >
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder="e.g. I keep overspending on food — how do I fix it this week?"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Coaching…" : "Get my plan"}
          </Button>
        </form>
      </SectionCard>

      {(loading || advice) && (
        <SectionCard>
          <div className="flex gap-3">
            <img src={savebotAsset.url} alt="" className="size-10 shrink-0 object-contain" />
            {loading ? (
              <p className="animate-pulse text-sm text-muted-foreground">Reviewing your spending and building a plan…</p>
            ) : (
              <div className="max-w-none text-sm [&_h1]:font-display [&_h1]:text-base [&_h1]:font-bold [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-sm [&_h2]:font-bold [&_li]:my-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
                <ReactMarkdown>{advice ?? ""}</ReactMarkdown>
              </div>
            )}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Educational coaching on virtual money — not financial, investment or credit advice.
          </p>
        </SectionCard>
      )}
    </div>
  );
}
