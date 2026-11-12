import type { CategoryId, Expense, Goal, SmartSaveState } from "./types";

export const CATEGORIES: {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
  defaultNecessity: "need" | "want";
}[] = [
  { id: "food", label: "Food", emoji: "🍔", color: "var(--chart-1)", defaultNecessity: "need" },
  { id: "transport", label: "Transport", emoji: "🚌", color: "var(--chart-3)", defaultNecessity: "need" },
  { id: "entertainment", label: "Entertainment", emoji: "🎮", color: "var(--chart-4)", defaultNecessity: "want" },
  { id: "education", label: "Education", emoji: "📚", color: "var(--chart-2)", defaultNecessity: "need" },
  { id: "shopping", label: "Shopping", emoji: "🛍️", color: "var(--chart-5)", defaultNecessity: "want" },
  { id: "technology", label: "Technology", emoji: "💻", color: "var(--chart-3)", defaultNecessity: "want" },
  { id: "bills", label: "Bills", emoji: "🏠", color: "var(--chart-1)", defaultNecessity: "need" },
  { id: "other", label: "Other", emoji: "🎁", color: "var(--chart-5)", defaultNecessity: "want" },
];

export const categoryOf = (id: CategoryId) => CATEGORIES.find((c) => c.id === id) ?? { id: "other" as const, label: "Other", emoji: "🎁", color: "var(--chart-5)", defaultNecessity: "want" as const };

export const GOAL_PRESETS = [
  { emoji: "🎓", name: "Education", target: 1000 },
  { emoji: "💻", name: "New laptop", target: 800 },
  { emoji: "✈️", name: "Trip", target: 500 },
  { emoji: "🎮", name: "Gaming setup", target: 600 },
  { emoji: "🚲", name: "Bicycle", target: 300 },
  { emoji: "💰", name: "Emergency fund", target: 1000 },
];

export const MODES = [
  { id: "beginner", emoji: "🌱", name: "Beginner", desc: "More guidance, gentler challenges." },
  { id: "goal", emoji: "🎯", name: "Goal Saver", desc: "Everything focused on one savings goal." },
  { id: "manager", emoji: "🧠", name: "Money Manager", desc: "Realistic expenses and surprise events." },
  { id: "hard", emoji: "🔥", name: "Challenge Mode", desc: "Tighter money, tougher scenarios." },
  { id: "custom", emoji: "✨", name: "Custom", desc: "You decide every setting." },
] as const;

export const LEARN_INTERESTS = [
  "Budgeting basics",
  "Saving habits",
  "Needs vs Wants",
  "Emergency funds",
  "Avoiding impulse spending",
  "Goal planning",
  "Shariah money principles",
  "Zakat and sadaqah",
];

export interface Challenge {
  id: string;
  title: string;
  desc: string;
  period: "weekly" | "monthly";
  target: number;
  unit: string;
  xp: number;
  badge?: string;
}

export const CHALLENGES: Challenge[] = [
  { id: "no-wants-3", title: "No unnecessary spending for 3 days", desc: "Log 3 days in a row without any Want expenses.", period: "weekly", target: 3, unit: "days", xp: 120, badge: "Wants vs Needs Expert" },
  { id: "save-50", title: "Save $50 this week", desc: "Move at least $50 into savings, goals or emergency fund.", period: "weekly", target: 50, unit: "$", xp: 100, badge: "Smart Saver" },
  { id: "track-7", title: "Track every expense for 7 days", desc: "Add at least one expense on 7 different days.", period: "weekly", target: 7, unit: "days", xp: 150, badge: "Expense Tracker" },
  { id: "wants-needs-5", title: "Identify 5 Wants vs Needs", desc: "Classify 5 expenses to sharpen your instincts.", period: "weekly", target: 5, unit: "expenses", xp: 80 },
  { id: "emergency", title: "Create an emergency fund", desc: "Set aside at least $100 for the unexpected.", period: "monthly", target: 100, unit: "$", xp: 200, badge: "Budget Master" },
];

export interface Lesson {
  id: string;
  level: "Beginner" | "Intermediate";
  emoji: string;
  title: string;
  minutes: number;
  intro: string;
  points: string[];
  quiz: { q: string; options: string[]; answer: number; why: string }[];
  xp: number;
}

export const LESSONS: Lesson[] = [
  {
    id: "shariah-basics", level: "Beginner", emoji: "🌿", title: "Shariah money principles", minutes: 3,
    intro: "Build good money habits through lawful income, permissible spending, fairness and moderation.",
    points: [
      "Avoid riba (interest) and maysir (gambling). Saving here grows only through contributions, not interest.",
      "Avoid waste (israf), deception and prohibited purchases. Needs vs Wants is a budgeting label, not a halal ruling.",
      "XP and badges reward learning without payment, wagering or cash prizes. Surprise events are practice scenarios, not betting.",
      "SmartSave is educational and is not scholar-certified. Ask a qualified scholar about specific contracts and disputed questions.",
    ],
    quiz: [
      { q: "Which way of reaching a goal fits these principles?", options: ["Save from lawful income", "Earn interest", "Buy lottery tickets"], answer: 0, why: "Consistent saving from lawful income avoids interest and gambling." },
      { q: "Does marking a purchase as a Need prove it is halal?", options: ["Yes", "No"], answer: 1, why: "Priority and religious permissibility are separate questions." },
    ], xp: 60,
  },
  {
    id: "zakat-sadaqah", level: "Intermediate", emoji: "🤲", title: "Zakat and sadaqah", minutes: 3,
    intro: "Plan generosity responsibly while distinguishing obligatory zakat from voluntary sadaqah.",
    points: [
      "Zakat has eligibility rules involving qualifying assets, liabilities, nisab and the applicable lunar holding period.",
      "A common rate for qualifying monetary wealth is 2.5%, but it is not a universal rule for every asset or every balance.",
      "Sadaqah is voluntary. Plan affordable giving without neglecting essential responsibilities.",
      "Virtual balances are not a zakat assessment. Consult a qualified scholar for your actual circumstances and eligible recipients.",
    ],
    quiz: [
      { q: "Is sadaqah the same as obligatory zakat?", options: ["Yes", "No"], answer: 1, why: "Sadaqah is voluntary, while zakat is obligatory when its conditions are met." },
      { q: "Can your virtual SmartSave balance determine real zakat due?", options: ["Yes, always take 2.5%", "No, real assets and eligibility must be assessed"], answer: 1, why: "Virtual money does not establish qualifying assets, nisab or a lunar holding period." },
    ], xp: 80,
  },
  {
    id: "budget",
    level: "Beginner",
    emoji: "🧾",
    title: "What is a budget?",
    minutes: 3,
    intro: "A budget is simply a plan for your money — deciding where it goes before you spend it.",
    points: [
      "A budget is a plan, not a punishment.",
      "Write down money coming in and money going out.",
      "Review it weekly and adjust — plans change.",
    ],
    quiz: [
      { q: "A budget is best described as…", options: ["A limit that blocks spending", "A plan for where your money goes", "A bank product"], answer: 1, why: "A budget is a plan you make, not a restriction someone puts on you." },
      { q: "How often should a beginner review a budget?", options: ["Once a year", "Weekly", "Never"], answer: 1, why: "Weekly reviews keep your plan connected to real life." },
    ],
    xp: 60,
  },
  {
    id: "needs-wants",
    level: "Beginner",
    emoji: "⚖️",
    title: "Needs vs Wants",
    minutes: 3,
    intro: "Needs keep your life running. Wants add enjoyment. Choose permissible purchases in both categories and avoid waste (israf).",
    points: [
      "Needs: food, transport to school/work, bills, essential study material.",
      "Wants: games, extra snacks, upgrades, impulse buys.",
      "Ask: what happens if I skip this for a week?",
      "Need or Want describes priority, not religious permissibility. Avoid prohibited purchases in either category.",
    ],
    quiz: [
      { q: "Bus fare to school is usually a…", options: ["Need", "Want"], answer: 0, why: "It's required for something essential in your routine." },
      { q: "A new game skin is a…", options: ["Need", "Want"], answer: 1, why: "It's enjoyable, but nothing breaks if you skip it." },
    ],
    xp: 60,
  },
  {
    id: "why-save",
    level: "Beginner",
    emoji: "💰",
    title: "Why should you save?",
    minutes: 2,
    intro: "Saving turns future problems into small decisions you already handled.",
    points: ["Savings buy you choices.", "Small consistent amounts beat rare big ones.", "Name your savings — goals stick better."],
    quiz: [{ q: "Which saving habit usually works best?", options: ["$5 every week", "$260 once a year if there's money left"], answer: 0, why: "Consistency builds the habit and is easier to sustain." }],
    xp: 50,
  },
  {
    id: "emergency",
    level: "Beginner",
    emoji: "🚨",
    title: "What is an emergency fund?",
    minutes: 3,
    intro: "Money you keep aside only for surprises — repairs, health, sudden costs.",
    points: ["Keep it separate from goal savings.", "Start small: even $100 helps.", "Refill it after you use it."],
    quiz: [{ q: "A sale on a bicycle accessory is an emergency?", options: ["Yes", "No"], answer: 1, why: "Emergencies are unexpected and necessary, not exciting opportunities." }],
    xp: 60,
  },
  {
    id: "track",
    level: "Beginner",
    emoji: "📋",
    title: "How to track expenses",
    minutes: 2,
    intro: "You can't improve what you don't measure. Tracking makes leaks visible.",
    points: ["Log it the moment you spend.", "Tag every expense Need or Want.", "Review weekly totals by category."],
    quiz: [{ q: "Best moment to log an expense?", options: ["Right away", "End of month from memory"], answer: 0, why: "Memory fades — same-day logging is far more accurate." }],
    xp: 50,
  },
  {
    id: "goals",
    level: "Intermediate",
    emoji: "🎯",
    title: "How to set financial goals",
    minutes: 3,
    intro: "Good goals have a number, a date, and a weekly amount.",
    points: ["Target ÷ weeks = weekly amount.", "Make the first milestone tiny.", "Track progress visually."],
    quiz: [{ q: "$400 goal in 8 weeks means saving…", options: ["$25/week", "$50/week", "$80/week"], answer: 1, why: "400 ÷ 8 = $50 per week." }],
    xp: 80,
  },
  {
    id: "impulse",
    level: "Intermediate",
    emoji: "🛑",
    title: "How to avoid impulse spending",
    minutes: 3,
    intro: "Impulse buys feel urgent. Time removes the urgency.",
    points: ["Use a 24-hour rule for Wants.", "Compare the cost to your goal progress.", "Unsubscribe from sale notifications."],
    quiz: [{ q: "Best first move when you feel an urge to buy?", options: ["Buy it before it's gone", "Wait 24 hours", "Borrow money"], answer: 1, why: "Most impulse urges fade within a day." }],
    xp: 80,
  },
  {
    id: "plan",
    level: "Intermediate",
    emoji: "🗺️",
    title: "How to create a spending plan",
    minutes: 3,
    intro: "Split money into Needs, Wants, Savings and Emergency — then live inside the plan.",
    points: ["Save first, spend what's left.", "Leave a small buffer for surprises.", "Adjust categories monthly, not daily."],
    quiz: [{ q: "'Pay yourself first' means…", options: ["Spend on yourself first", "Move savings aside before spending"], answer: 1, why: "Savings come off the top, before spending decisions." }],
    xp: 80,
  },
  {
    id: "habits",
    level: "Intermediate",
    emoji: "🔁",
    title: "How to build consistent saving habits",
    minutes: 2,
    intro: "Habits beat motivation. Make saving automatic and visible.",
    points: ["Same day, same amount, every week.", "Track streaks.", "Celebrate milestones, not perfection."],
    quiz: [{ q: "You missed a week of saving. Best response?", options: ["Quit the goal", "Restart next week", "Double everything forever"], answer: 1, why: "One miss is normal — restarting quickly protects the habit." }],
    xp: 70,
  },
];

export interface LifeEvent {
  id: string;
  emoji: string;
  title: string;
  detail: string;
  kind: "expense" | "bonus";
  amount: number;
  options: { id: string; label: string; lesson: string }[];
}

export const LIFE_EVENTS: LifeEvent[] = [
  {
    id: "bike",
    emoji: "🚲",
    title: "Your bicycle needs a repair",
    detail: "The chain snapped and you use the bike daily.",
    kind: "expense",
    amount: 60,
    options: [
      { id: "emergency", label: "Pay from emergency fund", lesson: "This is exactly what an emergency fund is for — your goals stay untouched." },
      { id: "wants", label: "Pay from your Wants budget", lesson: "Smart trade-off: you protected savings by cutting fun money instead." },
      { id: "goal", label: "Take it from a savings goal", lesson: "It works, but your goal date moves back. Rebuilding goal money is harder than rebuilding fun money." },
    ],
  },
  {
    id: "bonus",
    emoji: "🎁",
    title: "You earned a $100 work bonus",
    detail: "An extra payment for lawful work landed in your virtual wallet — not interest or a prize draw.",
    kind: "bonus",
    amount: 100,
    options: [
      { id: "save", label: "Save all of it", lesson: "Windfalls are the easiest money to save — you never budgeted for it." },
      { id: "goal", label: "Add it to a goal", lesson: "Nice acceleration: unexpected money can shave weeks off a goal." },
      { id: "emergency", label: "Put it in emergency savings", lesson: "A stronger buffer means future surprises won't hurt your goals." },
      { id: "spend", label: "Spend on a permissible treat", lesson: "Plan permissible enjoyment in moderation — save most and spend a small part without waste." },
    ],
  },
  {
    id: "phone",
    emoji: "📱",
    title: "Your phone screen cracked",
    detail: "A repair costs $85. It still works, but it's uncomfortable to use.",
    kind: "expense",
    amount: 85,
    options: [
      { id: "emergency", label: "Repair now from emergency fund", lesson: "Fixing essentials early usually costs less than waiting for total failure." },
      { id: "wants", label: "Repair using Wants money", lesson: "You paid without touching savings — a strong habit." },
      { id: "skip", label: "Wait and save for it", lesson: "Delaying non-urgent repairs is valid — just set a date so it doesn't grow worse." },
    ],
  },
  {
    id: "friends",
    emoji: "🍕",
    title: "Friends invite you out",
    detail: "A meal at a halal restaurant would cost about $40.",
    kind: "expense",
    amount: 40,
    options: [
      { id: "wants", label: "Go, pay from Wants", lesson: "Permissible enjoyment can fit a budget — keep it moderate and protect essential responsibilities." },
      { id: "half", label: "Go, but spend only $20", lesson: "Setting a spending cap before you go is one of the most practical money skills." },
      { id: "skip", label: "Skip it and save the $40", lesson: "Saying no sometimes protects your goal — just don't skip everything, or the plan won't last." },
    ],
  },
  {
    id: "sale",
    emoji: "🏷️",
    title: "Flash sale on headphones",
    detail: "$120 headphones for $70, today only.",
    kind: "expense",
    amount: 70,
    options: [
      { id: "buy", label: "Buy them", lesson: "A discount only saves money if you were already going to buy it." },
      { id: "wait", label: "Use the 24-hour rule", lesson: "Waiting a day removes urgency — most impulse urges disappear." },
      { id: "goal", label: "Move $70 to a goal instead", lesson: "Turning an impulse into savings is the single fastest way to grow a goal." },
    ],
  },
];

const daysAgoISO = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export function sampleExpenses(scale = 1): Expense[] {
  const raw: [number, CategoryId, number, string, "need" | "want"][] = [
    [18, "food", 0, "Lunch at campus", "need"],
    [9, "transport", 0, "Bus pass top-up", "need"],
    [24, "entertainment", 1, "Game bundle", "want"],
    [32, "food", 2, "Groceries", "need"],
    [12, "education", 2, "Notebook + pens", "need"],
    [45, "shopping", 3, "New sneakers", "want"],
    [7, "food", 4, "Coffee run", "want"],
    [15, "transport", 5, "Ride share", "need"],
    [60, "bills", 6, "Phone bill", "need"],
    [28, "entertainment", 7, "Sports outing with friends", "want"],
    [22, "technology", 9, "USB drive", "want"],
    [19, "food", 10, "Dinner out", "want"],
  ];
  return raw.map(([amount, category, ago, description, necessity], i) => ({
    id: `seed-${i}`,
    amount: Math.round(amount * scale),
    category,
    date: daysAgoISO(ago),
    description,
    necessity,
  }));
}

export function defaultGoals(): Goal[] {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  const date = d.toISOString().slice(0, 10);
  return [
    { id: "g-edu", emoji: "🎓", name: "Education", target: 1000, saved: 400, targetDate: date },
    { id: "g-laptop", emoji: "💻", name: "Laptop", target: 800, saved: 250, targetDate: date },
    { id: "g-trip", emoji: "✈️", name: "Trip", target: 500, saved: 150, targetDate: date },
  ];
}

export const initialState = (): SmartSaveState => ({
  onboarded: false,
  name: "",
  mode: "beginner",
  durationDays: 30,
  confidence: 3,
  learnInterests: [],
  startingBalance: 1000,
  allocation: { savings: 300, needs: 350, wants: 150, emergency: 100, goals: 100 },
  goals: [],
  expenses: [],
  challenges: CHALLENGES.map((c) => ({ id: c.id, progress: 0, completed: false })),
  lessons: LESSONS.map((l) => ({ id: l.id, completed: false, correct: 0 })),
  events: [],
  xp: 0,
  badges: [],
  streak: 1,
  startedAt: new Date().toISOString(),
  theme: "light",
});
