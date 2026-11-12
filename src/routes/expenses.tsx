import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSmartSave } from "@/lib/smartsave/store";
import { CATEGORIES, categoryOf } from "@/lib/smartsave/data";
import { computeStats, money } from "@/lib/smartsave/selectors";
import { PageHeader, SectionCard, StatCard, TipBox } from "@/components/smartsave/ui-bits";
import type { CategoryId, Necessity } from "@/lib/smartsave/types";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Expense Manager — SmartSave" },
      { name: "description", content: "Log virtual expenses, tag each one as a Need or a Want, and see where your demo money goes." },
      { property: "og:title", content: "Expense Manager — SmartSave" },
      { property: "og:description", content: "Track virtual spending by category and learn the difference between needs and wants." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExpensesPage,
});

function ExpensesPage() {
  const { state, addExpense, removeExpense } = useSmartSave();
  const stats = useMemo(() => computeStats(state), [state]);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryId>("food");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [necessity, setNecessity] = useState<Necessity | null>(null);
  const [reflect, setReflect] = useState<{ amount: number } | null>(null);

  const numeric = Number(amount);
  const canSubmit = numeric > 0 && necessity !== null;

  const submit = () => {
    if (!canSubmit) return;
    if (necessity === "want" && numeric >= 50 && !reflect) {
      setReflect({ amount: numeric });
      return;
    }
    addExpense({ amount: numeric, category, date, description: description || categoryOf(category).label, necessity: necessity! });
    setAmount("");
    setDescription("");
    setNecessity(null);
    setReflect(null);
  };

  const commit = (value: number) => {
    addExpense({ amount: value, category, date, description: description || categoryOf(category).label, necessity: "want" });
    setAmount("");
    setDescription("");
    setNecessity(null);
    setReflect(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader emoji="💳" title="Expense manager" subtitle="Every expense is virtual. Tag it honestly — that's where the learning happens." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard emoji="💳" label="Total spent" value={money(stats.spent)} />
        <StatCard emoji="🏠" label="Needs" value={money(stats.needTotal)} />
        <StatCard emoji="🎮" label="Wants" value={money(stats.wantTotal)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Add an expense" desc="Amount, category, date, description and necessity level">
          {reflect ? (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold">💡 Think before you spend</h3>
              <p className="text-sm text-muted-foreground">
                This purchase would reduce your savings progress by {money(reflect.amount)}. What would you like to do?
              </p>
              <div className="grid gap-2">
                <Button onClick={() => commit(reflect.amount)}>Spend {money(reflect.amount)}</Button>
                <Button variant="secondary" onClick={() => { setReflect(null); setAmount(""); setNecessity(null); }}>
                  Save {money(reflect.amount)} instead
                </Button>
                <Button variant="secondary" onClick={() => commit(Math.round(reflect.amount / 2))}>
                  Split: spend {money(reflect.amount / 2)}, save {money(reflect.amount / 2)}
                </Button>
              </div>
              <TipBox>
                There's no wrong answer — but every Want you skip moves your goal date closer. Splitting is a great
                middle ground when you still want to enjoy the moment.
              </TipBox>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="amt">Amount</Label>
                  <Input id="amt" type="number" min={0} className="mt-2" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="dt">Date</Label>
                  <Input id="dt" type="date" className="mt-2" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                        category === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary",
                      )}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Input id="desc" className="mt-2" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What was it for?" />
              </div>
              <div>
                <Label>Was this a Need or a Want?</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNecessity("need")}
                    className={cn("rounded-2xl border p-4 text-left transition", necessity === "need" ? "border-primary bg-primary/10" : "border-border hover:bg-secondary")}
                  >
                    <p className="font-semibold">🏠 Need</p>
                    <p className="text-xs text-muted-foreground">Essential to daily life</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNecessity("want")}
                    className={cn("rounded-2xl border p-4 text-left transition", necessity === "want" ? "border-primary bg-primary/10" : "border-border hover:bg-secondary")}
                  >
                    <p className="font-semibold">🎮 Want</p>
                    <p className="text-xs text-muted-foreground">Nice to have, optional</p>
                  </button>
                </div>
              </div>
              <Button size="lg" className="w-full" disabled={!canSubmit} onClick={submit}>
                Add virtual expense
              </Button>
            </div>
          )}
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Spending by category">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.byCategory} dataKey="value" nameKey="label" innerRadius={55} outerRadius={95} paddingAngle={3}>
                    {stats.byCategory.map((c) => (
                      <Cell key={c.id} fill={c.color} />
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
              {stats.byCategory.map((c) => (
                <span key={c.id} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  {c.emoji} {c.label} · {money(c.value)}
                </span>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Last 7 days">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.last7} margin={{ left: -20, right: 8 }}>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                  <Tooltip
                    cursor={{ fill: "var(--secondary)" }}
                    contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }}
                    formatter={(v: number) => [money(v), "Spent"]}
                  />
                  <Bar dataKey="amount" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      </div>

      <SectionCard title="All expenses" desc={`${state.expenses.length} virtual transactions`}>
        <ul className="divide-y divide-border">
          {state.expenses.map((e) => {
            const c = categoryOf(e.category);
            return (
              <li key={e.id} className="flex items-center gap-3 py-3">
                <span className="grid size-10 place-items-center rounded-xl bg-secondary text-lg">{c.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{e.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.label} · {e.date} ·{" "}
                    <span className={e.necessity === "need" ? "text-primary" : "text-accent-foreground"}>
                      {e.necessity === "need" ? "Need" : "Want"}
                    </span>
                  </p>
                </div>
                <span className="num-display font-bold">-{money(e.amount)}</span>
                <Button variant="ghost" size="icon" aria-label="Delete expense" onClick={() => removeExpense(e.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </li>
            );
          })}
          {state.expenses.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No expenses yet.</p>}
        </ul>
      </SectionCard>
    </div>
  );
}
