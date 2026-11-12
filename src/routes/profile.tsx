import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSmartSave } from "@/lib/smartsave/store";
import { computeScore, computeStats, levelFor, money } from "@/lib/smartsave/selectors";
import { LESSONS, MODES } from "@/lib/smartsave/data";
import { PageHeader, SectionCard, StatCard } from "@/components/smartsave/ui-bits";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — SmartSave" },
      { name: "description", content: "Your SmartSave profile: level, XP, achievements, streak, savings goals and learning progress." },
      { property: "og:title", content: "Your Profile — SmartSave" },
      { property: "og:description", content: "Review your level, badges, streak and learning progress in SmartSave." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { state, reset, logout, cloudUser, newAccount, syncStatus } = useSmartSave();
  const stats = useMemo(() => computeStats(state), [state]);
  const score = computeScore(state, stats);
  const lvl = levelFor(state.xp);
  const lessonsDone = state.lessons.filter((l) => l.completed).length;
  const mode = MODES.find((m) => m.id === state.mode);

  return (
    <div className="space-y-6">
      <PageHeader emoji="👤" title="Profile" subtitle="Your progress in the SmartSave simulation." />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <span className="text-sm text-muted-foreground">{cloudUser ? syncStatus : 'Saved on this device only'}</span>
        {!cloudUser && <Button onClick={newAccount}>Save this profile to Cloud</Button>}
      </div>

      <SectionCard className="bg-hero-gradient text-primary-foreground border-transparent">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-16 place-items-center rounded-3xl bg-background/25 text-3xl">🙂</span>
          <div>
            <h2 className="text-2xl font-extrabold">{state.name || "Saver"}</h2>
            <p className="text-sm opacity-90">
              Level {lvl.level} · {lvl.title} · {mode?.emoji} {mode?.name} · {state.durationDays}-day challenge
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs opacity-85">SmartSave score</p>
            <p className="num-display text-3xl font-extrabold">{score.score}/100</p>
          </div>
        </div>
        <Progress className="mt-5 h-2.5" value={(lvl.into / lvl.next) * 100} />
        <p className="mt-1.5 text-xs opacity-85">XP {lvl.into} / {lvl.next}</p>
      </SectionCard>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard emoji="👛" label="Starting money" value={money(state.startingBalance)} />
        <StatCard emoji="🏦" label="Saved" value={money(stats.saved)} />
        <StatCard emoji="🔥" label="Streak" value={`${state.streak} days`} />
        <StatCard emoji="📚" label="Lessons" value={`${lessonsDone}/${LESSONS.length}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Savings goals">
          <ul className="space-y-4">
            {state.goals.map((g) => (
              <li key={g.id}>
                <div className="flex justify-between text-sm font-semibold">
                  <span>{g.emoji} {g.name}</span>
                  <span className="num-display">{money(g.saved)} / {money(g.target)}</span>
                </div>
                <Progress className="mt-2 h-2" value={Math.min(100, (g.saved / g.target) * 100)} />
              </li>
            ))}
            {state.goals.length === 0 && <p className="text-sm text-muted-foreground">No goals yet.</p>}
          </ul>
        </SectionCard>

        <SectionCard title="Achievements">
          <div className="flex flex-wrap gap-2">
            {state.badges.length === 0 && <p className="text-sm text-muted-foreground">Complete challenges to earn badges.</p>}
            {state.badges.map((b) => (
              <span key={b} className="rounded-2xl border border-primary bg-primary/10 px-3 py-2 text-sm font-semibold">🏆 {b}</span>
            ))}
          </div>
          <h3 className="mt-6 font-display text-sm font-bold">Learning progress</h3>
          <Progress className="mt-2 h-2" value={(lessonsDone / LESSONS.length) * 100} />
          <p className="mt-1.5 text-xs text-muted-foreground">{lessonsDone} of {LESSONS.length} lessons completed</p>
          <h3 className="mt-6 font-display text-sm font-bold">What you want to learn</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.learnInterests.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs">{t}</span>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Session" desc="Log out to switch user, or reset to clear your virtual money, expenses and progress.">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={logout}>Log out</Button>
          <Button variant="destructive" onClick={reset}>Reset SmartSave</Button>
        </div>
      </SectionCard>
    </div>
  );
}
