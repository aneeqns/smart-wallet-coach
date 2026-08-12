import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Trash2 } from "lucide-react";
import { useSmartSave } from "@/lib/smartsave/store";
import { money } from "@/lib/smartsave/selectors";
import { GOAL_PRESETS } from "@/lib/smartsave/data";
import { PageHeader, SectionCard, TipBox } from "@/components/smartsave/ui-bits";

export const Route = createFileRoute("/goals")({
  head: () => ({
    meta: [
      { title: "Savings Goals — SmartSave" },
      { name: "description", content: "Create multiple virtual savings goals, set targets and dates, and allocate demo money toward each one." },
      { property: "og:title", content: "Savings Goals — SmartSave" },
      { property: "og:description", content: "Set targets, track progress bars and learn how consistent saving reaches a goal faster." },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const { state, addGoal, updateGoal, removeGoal, contributeToGoal } = useSmartSave();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [target, setTarget] = useState(500);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d.toISOString().slice(0, 10);
  });

  return (
    <div className="space-y-6">
      <PageHeader emoji="🎯" title="Savings goals" subtitle="Give your virtual money a purpose. You choose the amounts — nothing is decided for you." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {state.goals.map((g) => {
            const pct = Math.min(100, (g.saved / g.target) * 100);
            const weeksLeft = Math.max(1, Math.ceil((new Date(g.targetDate).getTime() - Date.now()) / (7 * 864e5)));
            const perWeek = Math.max(0, (g.target - g.saved) / weeksLeft);
            return (
              <SectionCard key={g.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold">
                      {g.emoji} {g.name}
                    </h3>
                    <p className="num-display mt-0.5 text-xl font-extrabold">
                      {money(g.saved)} <span className="text-sm font-semibold text-muted-foreground">/ {money(g.target)}</span>
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="Delete goal" onClick={() => removeGoal(g.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <Progress className="mt-3 h-3" value={pct} />
                <p className="mt-2 text-xs text-muted-foreground">
                  {pct.toFixed(1)}% complete · target date {g.targetDate} · save about {money(perWeek)}/week to finish on time
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {[10, 25, 50, 100].map((a) => (
                    <Button key={a} size="sm" variant="secondary" onClick={() => contributeToGoal(g.id, a)}>
                      +{money(a)}
                    </Button>
                  ))}
                  <Button size="sm" variant="ghost" onClick={() => contributeToGoal(g.id, -25)}>
                    -$25
                  </Button>
                  <div className="ml-auto flex items-center gap-2">
                    <Label className="text-xs" htmlFor={`t-${g.id}`}>Target</Label>
                    <Input
                      id={`t-${g.id}`}
                      type="number"
                      className="h-9 w-28"
                      value={g.target}
                      onChange={(e) => updateGoal(g.id, { target: Math.max(1, Number(e.target.value) || 1) })}
                    />
                  </div>
                </div>
              </SectionCard>
            );
          })}
          {state.goals.length === 0 && <SectionCard>No goals yet — add your first one.</SectionCard>}
        </div>

        <SectionCard title="New goal" desc="Add as many goals as you like">
          <div className="space-y-4">
            <div>
              <Label>Quick picks</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {GOAL_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    className="rounded-full border border-border px-3 py-1.5 text-sm hover:bg-secondary"
                    onClick={() => {
                      setName(p.name);
                      setEmoji(p.emoji);
                      setTarget(p.target);
                    }}
                  >
                    {p.emoji} {p.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="gn">Goal name</Label>
              <Input id="gn" className="mt-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. New bicycle" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ge">Emoji</Label>
                <Input id="ge" className="mt-2" value={emoji} onChange={(e) => setEmoji(e.target.value.slice(0, 2))} />
              </div>
              <div>
                <Label htmlFor="gtg">Target</Label>
                <Input id="gtg" type="number" className="mt-2" value={target} onChange={(e) => setTarget(Math.max(1, Number(e.target.value) || 1))} />
              </div>
            </div>
            <div>
              <Label htmlFor="gd">Target date</Label>
              <Input id="gd" type="date" className="mt-2" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <Button
              className="w-full"
              disabled={!name.trim()}
              onClick={() => {
                addGoal({ name: name.trim(), emoji: emoji || "🎯", target, saved: 0, targetDate: date });
                setName("");
              }}
            >
              Create goal
            </Button>
            <TipBox>Try saving before spending: set aside your goal amount first, then plan the rest of your money.</TipBox>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
