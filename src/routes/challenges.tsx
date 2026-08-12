import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSmartSave } from "@/lib/smartsave/store";
import { challengeProgress, levelFor } from "@/lib/smartsave/selectors";
import { PageHeader, SectionCard, StatCard } from "@/components/smartsave/ui-bits";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Financial Challenges — SmartSave" },
      { name: "description", content: "Weekly and monthly money challenges that build saving habits, with XP, badges and streaks." },
      { property: "og:title", content: "Financial Challenges — SmartSave" },
      { property: "og:description", content: "Complete habit-building money challenges and earn XP, badges and levels." },
    ],
  }),
  component: ChallengesPage,
});

const ALL_BADGES = [
  "First Savings Goal",
  "7-Day Saving Streak",
  "Budget Master",
  "Expense Tracker",
  "Wants vs Needs Expert",
  "Smart Saver",
];

function ChallengesPage() {
  const { state } = useSmartSave();
  const list = useMemo(() => challengeProgress(state), [state]);
  const lvl = levelFor(state.xp);
  const done = list.filter((c) => c.completed).length;

  return (
    <div className="space-y-6">
      <PageHeader emoji="🏆" title="Challenges" subtitle="Small missions that turn good money decisions into habits." />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard tone="primary" emoji="⭐" label={`Level ${lvl.level}`} value={lvl.title} hint={`XP ${lvl.into} / ${lvl.next}`} />
        <StatCard emoji="✅" label="Challenges done" value={`${done} / ${list.length}`} />
        <StatCard emoji="🔥" label="Streak" value={`${state.streak} days`} />
        <StatCard emoji="🎖️" label="Badges" value={String(state.badges.length)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((c) => (
          <SectionCard key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              </div>
              <Badge variant={c.completed ? "default" : "secondary"}>{c.completed ? "Completed" : c.period}</Badge>
            </div>
            <Progress className="mt-4 h-2.5" value={(c.progress / c.target) * 100} />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {c.unit === "$" ? `$${c.progress} / $${c.target}` : `${c.progress} / ${c.target} ${c.unit}`}
              </span>
              <span>+{c.xp} XP{c.badge ? ` · 🎖️ ${c.badge}` : ""}</span>
            </div>
          </SectionCard>
        ))}
      </div>

      <SectionCard title="Achievements" desc="Badges you can unlock">
        <div className="flex flex-wrap gap-3">
          {ALL_BADGES.map((b) => {
            const owned = state.badges.includes(b);
            return (
              <div
                key={b}
                className={
                  owned
                    ? "rounded-2xl border border-primary bg-primary/10 px-4 py-3 text-sm font-semibold"
                    : "rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground"
                }
              >
                🏆 {b}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
