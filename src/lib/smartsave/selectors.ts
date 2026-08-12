import { CATEGORIES, CHALLENGES, categoryOf } from "./data";
import type { CategoryId, SmartSaveState } from "./types";

export const money = (n: number) =>
  `$${Math.round(n).toLocaleString("en-US")}`;

export const money2 = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const dayISO = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};

export interface Stats {
  starting: number;
  spent: number;
  saved: number;
  remaining: number;
  today: number;
  week: number;
  month: number;
  biggest: { amount: number; label: string; emoji: string } | null;
  savingsRate: number;
  needTotal: number;
  wantTotal: number;
  byCategory: { id: CategoryId; label: string; emoji: string; value: number; color: string }[];
  last7: { day: string; amount: number }[];
  prevWeek: number;
  goalProgress: number;
  emergency: number;
}

export function computeStats(s: SmartSaveState): Stats {
  const starting = s.startingBalance;
  const spent = s.expenses.reduce((a, e) => a + e.amount, 0);
  const goalSaved = s.goals.reduce((a, g) => a + g.saved, 0);
  const saved = s.allocation.savings + s.allocation.emergency + goalSaved;
  const remaining = Math.max(0, starting - spent - saved);

  const today = s.expenses.filter((e) => e.date === dayISO(0)).reduce((a, e) => a + e.amount, 0);
  const weekStart = dayISO(6);
  const week = s.expenses.filter((e) => e.date >= weekStart).reduce((a, e) => a + e.amount, 0);
  const prevWeek = s.expenses
    .filter((e) => e.date >= dayISO(13) && e.date < weekStart)
    .reduce((a, e) => a + e.amount, 0);
  const monthStart = dayISO(29);
  const month = s.expenses.filter((e) => e.date >= monthStart).reduce((a, e) => a + e.amount, 0);

  const top = [...s.expenses].sort((a, b) => b.amount - a.amount)[0];
  const biggest = top
    ? {
        amount: top.amount,
        label: top.description || categoryOf(top.category).label,
        emoji: categoryOf(top.category).emoji,
      }
    : null;

  const savingsRate = starting > 0 ? Math.min(100, Math.round((saved / starting) * 100)) : 0;
  const needTotal = s.expenses.filter((e) => e.necessity === "need").reduce((a, e) => a + e.amount, 0);
  const wantTotal = s.expenses.filter((e) => e.necessity === "want").reduce((a, e) => a + e.amount, 0);

  const byCategory = CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    emoji: c.emoji,
    color: c.color,
    value: s.expenses.filter((e) => e.category === c.id).reduce((a, e) => a + e.amount, 0),
  })).filter((c) => c.value > 0);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const iso = dayISO(6 - i);
    return {
      day: new Date(iso).toLocaleDateString("en-US", { weekday: "short" }),
      amount: s.expenses.filter((e) => e.date === iso).reduce((a, e) => a + e.amount, 0),
    };
  });

  const targetTotal = s.goals.reduce((a, g) => a + g.target, 0);
  const goalProgress = targetTotal > 0 ? Math.round((goalSaved / targetTotal) * 100) : 0;

  return {
    starting,
    spent,
    saved,
    remaining,
    today,
    week,
    month,
    biggest,
    savingsRate,
    needTotal,
    wantTotal,
    byCategory,
    last7,
    prevWeek,
    goalProgress,
    emergency: s.allocation.emergency,
  };
}

export interface ScoreBreakdown {
  score: number;
  label: string;
  tone: "good" | "ok" | "low";
  parts: { name: string; value: number; max: number; tip: string }[];
}

export function computeScore(s: SmartSaveState, st: Stats): ScoreBreakdown {
  const savingsPct = Math.min(25, Math.round((st.savingsRate / 40) * 25));
  const spendTotal = st.needTotal + st.wantTotal;
  const wantShare = spendTotal > 0 ? st.wantTotal / spendTotal : 0;
  const wants = Math.round((1 - Math.min(1, wantShare / 0.5)) * 20);
  const consistencyDays = new Set(s.expenses.map((e) => e.date)).size;
  const consistency = Math.min(15, Math.round((consistencyDays / 7) * 15));
  const goal = Math.min(20, Math.round((st.goalProgress / 60) * 20));
  const allocTotal = Object.values(s.allocation).reduce((a, b) => a + b, 0);
  const budget = Math.min(10, Math.round((1 - Math.min(1, Math.abs(s.startingBalance - allocTotal) / Math.max(1, s.startingBalance))) * 10));
  const emergency = Math.min(10, Math.round((s.allocation.emergency / Math.max(1, s.startingBalance * 0.1)) * 10));

  const score = Math.max(0, Math.min(100, savingsPct + wants + consistency + goal + budget + emergency));
  const tone = score >= 75 ? "good" : score >= 50 ? "ok" : "low";
  const label = score >= 85 ? "Excellent money management" : score >= 75 ? "Strong habits" : score >= 50 ? "Getting there" : "Room to grow";

  return {
    score,
    label,
    tone,
    parts: [
      { name: "Savings percentage", value: savingsPct, max: 25, tip: "Set aside a bigger share of your virtual balance." },
      { name: "Unnecessary spending", value: wants, max: 20, tip: "Reduce Wants — they're a large slice of your spending." },
      { name: "Spending consistency", value: consistency, max: 15, tip: "Track expenses on more days to build the habit." },
      { name: "Goal progress", value: goal, max: 20, tip: "Move a little money into a goal this week." },
      { name: "Budget management", value: budget, max: 10, tip: "Make your allocation match your starting balance." },
      { name: "Emergency savings", value: emergency, max: 10, tip: "Aim for at least 10% of your balance as an emergency fund." },
    ],
  };
}

export function levelFor(xp: number) {
  const level = Math.floor(xp / 250) + 1;
  const into = xp % 250;
  const names = ["Beginner", "Budget Rookie", "Saver", "Smart Saver", "Money Manager", "Savings Pro", "Finance Coach"];
  return { level, into, next: 250, title: names[Math.min(level - 1, names.length - 1)]! };
}

export function challengeProgress(s: SmartSaveState) {
  const days = new Set(s.expenses.map((e) => e.date));
  const wantDays = new Set(s.expenses.filter((e) => e.necessity === "want").map((e) => e.date));
  let noWantStreak = 0;
  for (let i = 0; i < 10; i++) {
    const iso = dayISO(i);
    if (wantDays.has(iso)) break;
    noWantStreak++;
    if (noWantStreak >= 3) break;
  }
  const goalSaved = s.goals.reduce((a, g) => a + g.saved, 0);
  const values: Record<string, number> = {
    "no-wants-3": Math.min(3, noWantStreak),
    "save-50": Math.min(50, s.allocation.savings + s.allocation.emergency + goalSaved),
    "track-7": Math.min(7, days.size),
    "wants-needs-5": Math.min(5, s.expenses.length),
    emergency: Math.min(100, s.allocation.emergency),
  };
  return CHALLENGES.map((c) => ({
    ...c,
    progress: values[c.id] ?? 0,
    completed: (values[c.id] ?? 0) >= c.target,
  }));
}

export function buildInsights(s: SmartSaveState, st: Stats): { icon: string; text: string }[] {
  const out: { icon: string; text: string }[] = [];
  if (st.prevWeek > 0) {
    const diff = Math.round(((st.week - st.prevWeek) / st.prevWeek) * 100);
    out.push(
      diff >= 0
        ? { icon: "📈", text: `Your spending is up ${diff}% compared with last week.` }
        : { icon: "📉", text: `Nice — you spent ${Math.abs(diff)}% less than last week.` },
    );
  }
  const topCat = [...st.byCategory].sort((a, b) => b.value - a.value)[0];
  if (topCat) out.push({ icon: topCat.emoji, text: `${topCat.label} is your biggest spending category at ${money(topCat.value)}.` });
  const topWant = s.expenses
    .filter((e) => e.necessity === "want")
    .reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + e.amount }), {});
  const wantEntry = Object.entries(topWant).sort((a, b) => b[1] - a[1])[0];
  if (wantEntry) {
    const c = categoryOf(wantEntry[0] as CategoryId);
    out.push({ icon: "⚠️", text: `${c.label} is currently your largest Wants category (${money(wantEntry[1])}).` });
  }
  if (st.goalProgress > 0) out.push({ icon: "🎯", text: `You're ${st.goalProgress}% of the way through your goals overall.` });
  out.push({ icon: "🏆", text: `You've kept your saving habit going for ${s.streak} day${s.streak === 1 ? "" : "s"}.` });
  if (st.wantTotal > st.needTotal)
    out.push({ icon: "💡", text: "You're spending more on Wants than Needs. Try flipping that ratio this week." });
  else out.push({ icon: "💡", text: "Your Needs outweigh your Wants — that's a healthy balance." });
  return out;
}
