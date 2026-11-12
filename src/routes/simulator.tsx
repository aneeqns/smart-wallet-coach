import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSmartSave } from "@/lib/smartsave/store";
import { computeStats, money } from "@/lib/smartsave/selectors";
import { forecastGoal, weeklySaving } from "@/lib/smartsave/whatif";
import { PageHeader, SectionCard, StatCard, TipBox } from "@/components/smartsave/ui-bits";
import { SmartSuggestions } from "@/components/smartsave/SmartSuggestions";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "What If? Savings Simulator — SmartSave" },
      {
        name: "description",
        content:
          "Experiment risk-free: see how saving more each week or trimming spending changes when you reach your savings goal.",
      },
      { property: "og:title", content: "What If? Savings Simulator — SmartSave" },
      {
        property: "og:description",
        content: "Test savings scenarios with virtual money and watch your goal date move.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SimulatorPage,
});

function SimulatorPage() {
  const { state } = useSmartSave();
  const stats = useMemo(() => computeStats(state), [state]);
  const base = weeklySaving(state, stats);

  const [goalId, setGoalId] = useState(state.goals[0]?.id ?? "");
  const goal = state.goals.find((g) => g.id === goalId) ?? state.goals[0];

  const [extra, setExtra] = useState(20);
  const [cut, setCut] = useState(0);
  const [oneOff, setOneOff] = useState(0);

  const newWeekly = Math.max(0, base + extra + cut);
  const current = forecastGoal(goal, base);
  const boostedGoal = goal ? { ...goal, saved: goal.saved + oneOff } : undefined;
  const next = forecastGoal(boostedGoal, newWeekly);

  const daysEarlier =
    current?.days != null && next?.days != null ? Math.max(0, current.days - next.days) : null;

  const chart = [
    { name: "Current plan", weeks: current?.weeks ?? 0 },
    { name: "New plan", weeks: next?.weeks ?? 0 },
  ];

  const dateIn = (days: number | null | undefined) => {
    if (days == null) return "—";
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        emoji="📊"
        title="“What If?” Simulator"
        subtitle="Contribution-only savings forecasts — no interest, investment returns or real money."
      />

      {!goal ? (
        <SectionCard title="No goals yet">
          <p className="text-sm text-muted-foreground">Create a savings goal first, then come back to simulate it.</p>
          <Button className="mt-4" asChild>
            <Link to="/goals">Create a goal</Link>
          </Button>
        </SectionCard>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard emoji="🏦" label="Saving per week now" value={money(base)} hint="Weekly budget minus spending" />
            <StatCard emoji="⚡" label="New weekly saving" value={money(newWeekly)} tone="primary" />
            <StatCard
              emoji="🎯"
              label="Current plan"
              value={current?.weeks != null ? `${current.weeks} wk` : "—"}
              hint={`Goal reached ${dateIn(current?.days ?? null)}`}
            />
            <StatCard
              emoji="🚀"
              label="New plan"
              value={next?.weeks != null ? `${next.weeks} wk` : "—"}
              hint={`Goal reached ${dateIn(next?.days ?? null)}`}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Your experiment" desc="Drag the sliders — nothing here changes your saved data">
              {state.goals.length > 1 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {state.goals.map((g) => (
                    <Button
                      key={g.id}
                      size="sm"
                      variant={g.id === goal.id ? "default" : "secondary"}
                      onClick={() => setGoalId(g.id)}
                    >
                      {g.emoji} {g.name}
                    </Button>
                  ))}
                </div>
              )}

              <SliderRow
                label="Save extra every week"
                value={extra}
                onChange={setExtra}
                max={200}
                step={5}
                hint={`What if I save ${money(extra)} more every week?`}
              />
              <SliderRow
                label="Cut weekly spending by"
                value={cut}
                onChange={setCut}
                max={Math.max(50, Math.round(stats.week))}
                step={5}
                hint={`Trim ${money(cut)} a week from Wants`}
              />
              <SliderRow
                label="One-off boost into the goal"
                value={oneOff}
                onChange={setOneOff}
                max={500}
                step={10}
                hint={`A ${money(oneOff)} gift or lawful work bonus added to ${goal.name}`}
              />

              <div className="mt-5 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setExtra(0);
                    setCut(0);
                    setOneOff(0);
                  }}
                >
                  Reset
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/goals">Manage goals</Link>
                </Button>
              </div>
            </SectionCard>

            <SectionCard title="Result" desc={`${goal.emoji} ${goal.name} — ${money(goal.saved)} of ${money(goal.target)}`}>
              <Progress className="h-4" value={Math.min(100, (goal.saved / goal.target) * 100)} />
              <div className="mt-5 grid gap-3">
                <PlanRow label="Current plan" weeks={current?.weeks ?? null} date={dateIn(current?.days ?? null)} />
                <PlanRow
                  label="New plan"
                  weeks={next?.weeks ?? null}
                  date={dateIn(next?.days ?? null)}
                  highlight
                />
              </div>
              <div className="mt-4">
                <TipBox>
                  {daysEarlier && daysEarlier > 0
                    ? `Saving ${money(newWeekly)} a week instead of ${money(base)} gets you there ${daysEarlier} day${daysEarlier === 1 ? "" : "s"} earlier.`
                    : newWeekly <= 0
                      ? "At this pace you aren't saving anything yet — trim spending or add a weekly amount to see a goal date."
                      : "Move a slider to see how much sooner you'd hit this goal."}
                </TipBox>
              </div>

              <div className="mt-5 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart} margin={{ left: -20, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                    <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                    <Tooltip
                      cursor={{ fill: "var(--secondary)" }}
                      contentStyle={{
                        background: "var(--popover)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        color: "var(--popover-foreground)",
                      }}
                      formatter={(v: number) => [`${v} weeks`, "Time to goal"]}
                    />
                    <Bar dataKey="weeks" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>
          </div>
        </>
      )}

      <SmartSuggestions limit={4} />
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  max,
  step,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
  step: number;
  hint: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{label}</span>
        <span className="num-display text-sm font-extrabold">{money(value)}</span>
      </div>
      <Slider className="mt-3" value={[value]} max={max} step={step} onValueChange={(v) => onChange(v[0] ?? 0)} />
      <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function PlanRow({
  label,
  weeks,
  date,
  highlight,
}: {
  label: string;
  weeks: number | null;
  date: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border p-3 ${
        highlight ? "border-primary/40 bg-primary/10" : "border-border bg-secondary/50"
      }`}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className="text-right">
        <span className="num-display block text-lg font-extrabold">
          {weeks != null ? `${weeks} week${weeks === 1 ? "" : "s"}` : "Not reachable yet"}
        </span>
        <span className="text-xs text-muted-foreground">{date}</span>
      </span>
    </div>
  );
}
