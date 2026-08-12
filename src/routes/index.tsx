import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useSmartSave } from "@/lib/smartsave/store";
import { buildInsights, computeScore, computeStats, money } from "@/lib/smartsave/selectors";
import { LIFE_EVENTS } from "@/lib/smartsave/data";
import { PageHeader, SectionCard, StatCard, TipBox } from "@/components/smartsave/ui-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartSave Dashboard — Virtual Money Management Trainer" },
      {
        name: "description",
        content:
          "Track your virtual balance, savings goals and SmartSave score in a hands-on money-management simulation built for learning.",
      },
      { property: "og:title", content: "SmartSave Dashboard — Virtual Money Management Trainer" },
      {
        property: "og:description",
        content: "Manage a virtual wallet, set savings goals and learn better money habits with SmartSave.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state, update, contributeToGoal, addXp } = useSmartSave();
  const stats = useMemo(() => computeStats(state), [state]);
  const score = useMemo(() => computeScore(state, stats), [state, stats]);
  const insights = useMemo(() => buildInsights(state, stats), [state, stats]);
  const mainGoal = state.goals[0];

  return (
    <div className="space-y-6">
      <PageHeader
        emoji="🏠"
        title={`Hey ${state.name || "Saver"}!`}
        subtitle="Your virtual wallet, your decisions. Everything here is demo money for learning."
        action={
          <Button asChild size="lg">
            <Link to="/expenses">Add an expense</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard tone="primary" emoji="👛" label="Virtual balance" value={money(stats.starting)} hint="Your starting money" />
        <StatCard emoji="🏦" label="Money saved" value={money(stats.saved)} hint={`Savings rate ${stats.savingsRate}%`} />
        <StatCard emoji="💳" label="Money spent" value={money(stats.spent)} hint={`${money(stats.today)} today`} />
        <StatCard emoji="✨" label="Money remaining" value={money(stats.remaining)} hint="Unspent, unallocated" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Savings progress" desc="Your main goal in this challenge">
          {mainGoal ? (
            <div>
              <div className="flex items-end justify-between">
                <p className="font-display text-lg font-bold">
                  {mainGoal.emoji} {mainGoal.name}
                </p>
                <p className="num-display text-lg font-extrabold">
                  {money(mainGoal.saved)} <span className="text-muted-foreground">/ {money(mainGoal.target)}</span>
                </p>
              </div>
              <Progress className="mt-3 h-4" value={Math.min(100, (mainGoal.saved / mainGoal.target) * 100)} />
              <p className="mt-2 text-sm text-muted-foreground">
                {Math.round((mainGoal.saved / mainGoal.target) * 100)}% complete · target {mainGoal.targetDate}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[10, 25, 50].map((a) => (
                  <Button key={a} size="sm" variant="secondary" onClick={() => contributeToGoal(mainGoal.id, a)}>
                    + {money(a)} to goal
                  </Button>
                ))}
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/goals">Manage goals</Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No goals yet — create one in the Goals page.</p>
          )}

          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.last7} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--popover-foreground)",
                  }}
                  formatter={(v: number) => [money(v), "Spent"]}
                />
                <Area type="monotone" dataKey="amount" stroke="var(--chart-1)" strokeWidth={3} fill="url(#spendFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="SmartSave score" desc="An in-app learning score — not a credit score">
          <div className="flex items-center gap-4">
            <ScoreRing value={score.score} />
            <div>
              <p className="text-sm font-semibold">
                {score.tone === "good" ? "🟢" : score.tone === "ok" ? "🟡" : "🔴"} {score.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Score out of 100</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {score.parts.map((p) => (
              <div key={p.name}>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{p.name}</span>
                  <span className="font-semibold">
                    {p.value}/{p.max}
                  </span>
                </div>
                <Progress className="mt-1 h-1.5" value={(p.value / p.max) * 100} />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <TipBox>
              {score.parts.slice().sort((a, b) => a.value / a.max - b.value / b.max)[0]?.tip}
            </TipBox>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard emoji="📅" label="Today's spending" value={money(stats.today)} />
        <StatCard emoji="🗓️" label="This week" value={money(stats.week)} hint={`Last week ${money(stats.prevWeek)}`} />
        <StatCard emoji="📆" label="This month" value={money(stats.month)} />
        <StatCard
          emoji={stats.biggest?.emoji ?? "💥"}
          label="Biggest expense"
          value={stats.biggest ? money(stats.biggest.amount) : "$0"}
          hint={stats.biggest?.label}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LifeEventCard />
        <SectionCard title="Quick insights" desc="What your numbers are telling you">
          <ul className="space-y-3">
            {insights.slice(0, 5).map((i, idx) => (
              <li key={idx} className="flex gap-3 rounded-xl bg-secondary/60 p-3 text-sm">
                <span>{i.icon}</span>
                <span>{i.text}</span>
              </li>
            ))}
          </ul>
          <Button variant="ghost" className="mt-3" asChild>
            <Link to="/insights">See all insights →</Link>
          </Button>
        </SectionCard>
      </div>

      <WeeklyReport />

      <div className="hidden">{String(update === undefined)}{String(addXp === undefined)}</div>
    </div>
  );
}

function ScoreRing({ value }: { value: number }) {
  const deg = (value / 100) * 360;
  return (
    <div
      className="grid size-24 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(var(--primary) ${deg}deg, var(--secondary) ${deg}deg)` }}
    >
      <div className="grid size-[76px] place-items-center rounded-full bg-card">
        <span className="num-display text-2xl font-extrabold">{value}</span>
      </div>
    </div>
  );
}

function LifeEventCard() {
  const { state, update, addXp } = useSmartSave();
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const event = LIFE_EVENTS[index % LIFE_EVENTS.length]!;

  const choose = (optId: string, lesson: string) => {
    setResult(lesson);
    addXp(25);
    const a = { ...state.allocation };
    if (event.kind === "expense") {
      if (optId === "emergency") a.emergency = Math.max(0, a.emergency - event.amount);
      if (optId === "wants") a.wants = Math.max(0, a.wants - event.amount);
      if (optId === "half") a.wants = Math.max(0, a.wants - Math.round(event.amount / 2));
      if (optId === "buy") a.wants = Math.max(0, a.wants - event.amount);
      if (optId === "goal") a.goals = Math.max(0, a.goals - event.amount);
    } else {
      if (optId === "save") a.savings += event.amount;
      if (optId === "emergency") a.emergency += event.amount;
      if (optId === "goal") a.goals += event.amount;
      if (optId === "spend") a.wants += event.amount;
    }
    update({
      allocation: a,
      events: [
        { id: Math.random().toString(36).slice(2), eventId: event.id, choice: optId, amount: event.amount, date: new Date().toISOString().slice(0, 10) },
        ...state.events,
      ],
    });
  };

  return (
    <SectionCard title="Life happens" desc="Unexpected situations — you decide how to handle them">
      <div className="rounded-2xl bg-card-gradient border border-border p-4">
        <p className="font-display text-base font-bold">
          {event.emoji} {event.title}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{event.detail}</p>
        <p className="num-display mt-2 text-xl font-extrabold">
          {event.kind === "expense" ? "-" : "+"}
          {money(event.amount)}
        </p>
        {!result ? (
          <div className="mt-4 grid gap-2">
            {event.options.map((o) => (
              <Button key={o.id} variant="secondary" className="justify-start" onClick={() => choose(o.id, o.lesson)}>
                {o.label}
              </Button>
            ))}
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <TipBox>{result}</TipBox>
            <Button
              onClick={() => {
                setResult(null);
                setIndex((i) => i + 1);
              }}
            >
              Next scenario →
            </Button>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function WeeklyReport() {
  const { state } = useSmartSave();
  const stats = computeStats(state);
  const top = [...stats.byCategory].sort((a, b) => b.value - a.value).slice(0, 4);
  const better = stats.week <= stats.prevWeek;
  return (
    <SectionCard title="Your week" desc="A simple weekly report of your virtual money">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard emoji="🏦" label="Money saved" value={money(stats.saved)} />
        <StatCard emoji="💳" label="Money spent (7d)" value={money(stats.week)} />
        <StatCard emoji="📊" label="Savings rate" value={`${stats.savingsRate}%`} />
      </div>
      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="font-display text-sm font-bold">Top spending</h3>
          <ul className="mt-3 space-y-2">
            {top.map((c) => (
              <li key={c.id} className="flex items-center justify-between text-sm">
                <span>
                  {c.emoji} {c.label}
                </span>
                <span className="num-display font-semibold">{money(c.value)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-bold">Suggestions for next week</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>⭐ {better ? "Great job — you spent less than last week. Keep the streak." : "Spending rose this week. Pick one Wants category to trim."}</li>
            <li>🎯 Move your goal money at the start of the week, before you spend.</li>
            <li>🧠 Finish one lesson in the Learn section to earn XP and sharpen a habit.</li>
          </ul>
        </div>
      </div>
    </SectionCard>
  );
}
