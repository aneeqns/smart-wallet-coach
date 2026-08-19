import { categoryOf } from "./data";
import type { CategoryId, SmartSaveState } from "./types";
import { money, type Stats } from "./selectors";

const dayISO = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};

/** Weekly budget implied by the challenge duration. */
export function weeklyBudget(s: SmartSaveState) {
  const weeks = Math.max(1, (s.durationDays || 30) / 7);
  return s.startingBalance / weeks;
}

/** How much the user is currently saving each week (budget minus last 7 days of spending). */
export function weeklySaving(s: SmartSaveState, st: Stats) {
  return Math.max(0, Math.round(weeklyBudget(s) - st.week));
}

export interface GoalForecast {
  goalId: string;
  name: string;
  emoji: string;
  remaining: number;
  weeks: number | null;
  days: number | null;
}

export function forecastGoal(
  goal: { id: string; name: string; emoji: string; target: number; saved: number } | undefined,
  perWeek: number,
): GoalForecast | null {
  if (!goal) return null;
  const remaining = Math.max(0, goal.target - goal.saved);
  if (remaining === 0) return { goalId: goal.id, name: goal.name, emoji: goal.emoji, remaining: 0, weeks: 0, days: 0 };
  if (perWeek <= 0) return { goalId: goal.id, name: goal.name, emoji: goal.emoji, remaining, weeks: null, days: null };
  const weeks = remaining / perWeek;
  return {
    goalId: goal.id,
    name: goal.name,
    emoji: goal.emoji,
    remaining,
    weeks: Math.ceil(weeks),
    days: Math.ceil(weeks * 7),
  };
}

export interface Suggestion {
  icon: string;
  headline: string;
  body: string;
  saving: number;
  daysEarlier: number | null;
}

/** Opportunity-framed spending suggestions: what trimming a category unlocks. */
export function buildSuggestions(s: SmartSaveState, st: Stats): Suggestion[] {
  const weekStart = dayISO(6);
  const recent = s.expenses.filter((e) => e.date >= weekStart);
  const goal = [...s.goals].sort((a, b) => b.target - b.saved - (a.target - a.saved))[0] ?? s.goals[0];
  const base = weeklySaving(s, st);
  const baseline = forecastGoal(goal, base);

  const byCat = recent
    .filter((e) => e.necessity === "want")
    .reduce<Record<string, number>>((acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + e.amount }), {});

  const out: Suggestion[] = [];

  for (const [cat, amount] of Object.entries(byCat).sort((a, b) => b[1] - a[1]).slice(0, 3)) {
    if (amount < 10) continue;
    const c = categoryOf(cat as CategoryId);
    const trimmed = Math.max(5, Math.round((amount * 0.6) / 5) * 5);
    const saving = amount - trimmed;
    if (saving <= 0) continue;
    const better = forecastGoal(goal, base + saving);
    const daysEarlier =
      baseline?.days != null && better?.days != null ? Math.max(0, baseline.days - better.days) : null;
    out.push({
      icon: c.emoji,
      headline: `You spent ${money(amount)} on ${c.label.toLowerCase()} this week.`,
      body:
        goal && daysEarlier && daysEarlier > 0
          ? `If you reduced that to ${money(trimmed)}, you could reach your ${goal.name} goal ${daysEarlier} day${daysEarlier === 1 ? "" : "s"} earlier.`
          : goal
            ? `Trimming it to ${money(trimmed)} frees ${money(saving)} a week toward your ${goal.name} goal.`
            : `Trimming it to ${money(trimmed)} frees ${money(saving)} a week — set a goal to put it to work.`,
      saving,
      daysEarlier,
    });
  }

  if (st.week > st.prevWeek && st.prevWeek > 0) {
    const diff = Math.round(st.week - st.prevWeek);
    const better = forecastGoal(goal, base + diff);
    const daysEarlier =
      baseline?.days != null && better?.days != null ? Math.max(0, baseline.days - better.days) : null;
    out.push({
      icon: "📈",
      headline: `You spent ${money(diff)} more than last week.`,
      body:
        daysEarlier && daysEarlier > 0
          ? `Going back to last week's pace would put you ${daysEarlier} day${daysEarlier === 1 ? "" : "s"} closer to ${goal?.name ?? "your goal"}.`
          : `Going back to last week's pace frees ${money(diff)} for savings.`,
      saving: diff,
      daysEarlier,
    });
  }

  if (out.length === 0) {
    out.push({
      icon: "💡",
      headline: "No big Wants spending this week — nice.",
      body: goal
        ? `Keep this pace and you're saving about ${money(base)} a week toward ${goal.name}.`
        : "Add a savings goal so this spare money has a job.",
      saving: 0,
      daysEarlier: null,
    });
  }

  return out;
}
