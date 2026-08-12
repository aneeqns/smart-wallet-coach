import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useSmartSave } from "@/lib/smartsave/store";
import { money } from "@/lib/smartsave/selectors";
import { PageHeader, SectionCard, StatCard, TipBox } from "@/components/smartsave/ui-bits";
import type { Allocation } from "@/lib/smartsave/types";

export const Route = createFileRoute("/budget")({
  head: () => ({
    meta: [
      { title: "Smart Budget Planner — SmartSave" },
      { name: "description", content: "Divide your virtual balance between needs, wants, savings and an emergency fund with an instantly updating chart." },
      { property: "og:title", content: "Smart Budget Planner — SmartSave" },
      { property: "og:description", content: "Plan needs, wants, savings and emergency money — and see the breakdown update live." },
    ],
  }),
  component: BudgetPage,
});

const ROWS: [keyof Allocation, string, string, string][] = [
  ["savings", "🏦 Savings", "Money you keep and grow.", "var(--chart-1)"],
  ["needs", "🏠 Needs", "Food, transport, education, bills.", "var(--chart-3)"],
  ["wants", "🎮 Wants", "Entertainment, shopping, hobbies.", "var(--chart-4)"],
  ["emergency", "🚨 Emergency fund", "Reserved for the unexpected.", "var(--chart-2)"],
  ["goals", "🎯 Personal goals", "Money aimed at a specific goal.", "var(--chart-5)"],
];

function BudgetPage() {
  const { state, update } = useSmartSave();
  const alloc = state.allocation;
  const total = useMemo(() => Object.values(alloc).reduce((a, b) => a + b, 0), [alloc]);
  const left = state.startingBalance - total;

  const set = (k: keyof Allocation, v: number) =>
    update({ allocation: { ...alloc, [k]: Math.max(0, Math.round(v)) } });

  const chart = ROWS.map(([k, label, , color]) => ({ name: label, value: alloc[k], color }));

  return (
    <div className="space-y-6">
      <PageHeader emoji="📊" title="Smart budget planner" subtitle="Split your virtual balance however you like. Change it whenever you want — this is your plan." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard tone="primary" emoji="👛" label="Starting balance" value={money(state.startingBalance)} />
        <StatCard emoji="🧮" label="Allocated" value={money(total)} />
        <StatCard emoji={left < 0 ? "⚠️" : "✨"} label={left < 0 ? "Over budget" : "Unallocated"} value={money(Math.abs(left))} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Your allocation" desc="Drag or type to adjust — the chart updates instantly">
          <div className="space-y-4">
            {ROWS.map(([k, label, hint]) => (
              <div key={k} className="rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">{hint}</p>
                  </div>
                  <Input
                    type="number"
                    min={0}
                    className="h-9 w-28 text-right"
                    value={alloc[k]}
                    onChange={(e) => set(k, Number(e.target.value) || 0)}
                  />
                </div>
                <Slider
                  className="mt-3"
                  min={0}
                  max={state.startingBalance}
                  step={Math.max(1, Math.round(state.startingBalance / 100))}
                  value={[alloc[k]]}
                  onValueChange={(v) => set(k, v[0] ?? 0)}
                />
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  {state.startingBalance > 0 ? Math.round((alloc[k] / state.startingBalance) * 100) : 0}% of balance
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Visual breakdown">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chart} dataKey="value" nameKey="name" innerRadius={60} outerRadius={105} paddingAngle={3}>
                    {chart.map((c) => (
                      <Cell key={c.name} fill={c.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }}
                    formatter={(v: number, n: string) => [money(v), n]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2">
              {chart.map((c) => (
                <span key={c.name} className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  <span className="size-2 rounded-full" style={{ background: c.color }} />
                  {c.name} · {money(c.value)}
                </span>
              ))}
            </div>
          </SectionCard>

          {left < 0 && (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
              ⚠️ Your planned expenses are higher than your available money by {money(-left)}. Trim a category — most
              people start with Wants.
            </div>
          )}
          {left > 0 && (
            <SectionCard>
              <p className="text-sm">💡 You still have {money(left)} unallocated. What would you like to do with it?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => set("savings", alloc.savings + left)}>Save it</Button>
                <Button size="sm" variant="secondary" onClick={() => set("goals", alloc.goals + left)}>Add to goal</Button>
                <Button size="sm" variant="secondary" onClick={() => set("emergency", alloc.emergency + left)}>Emergency fund</Button>
                <Button size="sm" variant="ghost">Keep available</Button>
              </div>
            </SectionCard>
          )}

          <TipBox>
            Try saving before spending. Set aside your goal amount first, then plan the remaining money. A common
            starting point is roughly half for needs, a third for savings and goals, and the rest for wants — but your
            situation decides, not a formula.
          </TipBox>
        </div>
      </div>
    </div>
  );
}
