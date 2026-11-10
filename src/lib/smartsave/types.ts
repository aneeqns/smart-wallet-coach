export type CategoryId =
  | "food"
  | "transport"
  | "entertainment"
  | "education"
  | "shopping"
  | "technology"
  | "bills"
  | "other";

export type Necessity = "need" | "want";

export interface Expense {
  id: string;
  amount: number;
  category: CategoryId;
  date: string; // ISO date (yyyy-mm-dd)
  description: string;
  necessity: Necessity;
}

export interface Goal {
  id: string;
  emoji: string;
  name: string;
  target: number;
  saved: number;
  targetDate: string;
}

export interface Allocation {
  savings: number;
  needs: number;
  wants: number;
  emergency: number;
  goals: number;
}

export type ChallengeMode = "beginner" | "goal" | "manager" | "hard" | "custom";

export interface ChallengeState {
  id: string;
  progress: number;
  completed: boolean;
}

export interface LessonState {
  id: string;
  completed: boolean;
  correct: number;
}

export interface LifeEventLog {
  id: string;
  eventId: string;
  choice: string;
  amount: number;
  date: string;
}

export interface SmartSaveState {
  onboarded: boolean;
  name: string;
  mode: ChallengeMode;
  durationDays: number;
  confidence: number;
  learnInterests: string[];
  startingBalance: number;
  allocation: Allocation;
  goals: Goal[];
  expenses: Expense[];
  challenges: ChallengeState[];
  lessons: LessonState[];
  events: LifeEventLog[];
  xp: number;
  badges: string[];
  streak: number;
  startedAt: string;
  theme: "light" | "dark";
  loggedOut?: boolean;
  /** Local profile id this state belongs to. */
  id?: string;
  email?: string;
  avatar?: string;
}

/**
 * Minimal, non-sensitive info about a previously used account, kept on this
 * device so the login screen can offer it again. Never contains passwords.
 */
export interface SavedAccount {
  id: string;
  name: string;
  cloud?: boolean;
  email?: string;
  avatar?: string;
  lastUsedAt?: string;
}
