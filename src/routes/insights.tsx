import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSmartSave } from "@/lib/smartsave/store";
import { buildInsights, computeScore, computeStats, money } from "@/lib/smartsave/selectors";
import { PageHeader, SectionCard, StatCard, TipBox } from "@/components/smartsave/ui-bits";
import { SmartSuggestions } from "@/components/smartsave/SmartSuggestions";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Spending Insights — SmartSave" },
      { name: "description", content: "Automatic patterns in your virtual spending: category trends, needs vs wants balance and weekly comparisons." },
      { property: "og:title", content: "Spending Insights — SmartSave" },
      { property: "og:description", content: "See what your virtual spending patterns say about your money habits." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: InsightsPage,
});

function InsightsPage() {
  const { state } = useSmartSave();
  const stats = useMemo(() => computeStats(state), [state]);
  const insights = useMemo(() => buildInsights(state, stats), [state, stats]);
  const score = useMemo(() => computeScore(state, stats), [state, stats]);
  const needWant = stats.needTotal + stats.wantTotal;

  return (
    <div className="space-y-6">
      <PageHeader emoji="📈" title="Insights" subtitle="Patterns SmartSave spotted in your virtual money — in plain language." />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard emoji="📊" label="Savings rate" value={`${stats.savingsRate}%`} />
        <StatCard emoji="🗓️" label="This week" value={money(stats.week)} hint={`Last week ${money(stats.prevWeek)}`} />
        <StatCard emoji="🎯" label="Goal progress" value={`${stats.goalProgress}%`} />
        <StatCard emoji="🧠" label="SmartSave score" value={`${score.score}/100`} hint={score.label} />
      </div>

      <SmartSuggestions limit={4} />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="What we noticed">
          <ul className="space-y-3">
            {insights.map((i, idx) => (
              <li key={idx} className="flex gap-3 rounded-2xl bg-secondary/60 p-4 text-sm">
                <span className="text-base">{i.icon}</span>
                <span>{i.text}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Needs vs Wants">
            <div className="flex justify-between text-sm font-semibold">
              <span>🏠 Needs {money(stats.needTotal)}</span>
              <span>🎮 Wants {money(stats.wantTotal)}</span>
            </div>
            <Progress className="mt-3 h-4" value={needWant ? (stats.needTotal / needWant) * 100 : 0} />
            <p className="mt-2 text-xs text-muted-foreground">
              {needWant ? Math.round((stats.wantTotal / needWant) * 100) : 0}% of your spending went to Wants.
            </p>
            <div className="mt-4">
              <TipBox>
                Wants aren't bad — they just need a ceiling. Decide the number before the week starts, not while
                you're deciding whether to buy.
              </TipBox>
            </div>
          </SectionCard>

          <SectionCard title="Spending by category">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byCategory} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                  <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} fontSize={12} width={90} stroke="var(--muted-foreground)" />
                  <Tooltip
                    cursor={{ fill: "var(--secondary)" }}
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }}
                    formatter={(v: number) => [money(v), "Spent"]}
                  />
                  <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
