import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CHALLENGES, LESSONS, initialState } from "./data";
import type { Expense, Goal, SmartSaveState } from "./types";

const KEY = "smartsave.state.v1";

interface Ctx {
  state: SmartSaveState;
  ready: boolean;
  update: (patch: Partial<SmartSaveState>) => void;
  addExpense: (e: Omit<Expense, "id">) => void;
  removeExpense: (id: string) => void;
  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
  addXp: (amount: number, badge?: string) => void;
  completeLesson: (id: string, correct: number, xp: number) => void;
  reset: () => void;
  toggleTheme: () => void;
}

const SmartSaveContext = createContext<Ctx | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export function SmartSaveProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SmartSaveState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SmartSaveState;
        setState({
          ...initialState(),
          ...parsed,
          challenges: CHALLENGES.map(
            (c) => parsed.challenges?.find((x) => x.id === c.id) ?? { id: c.id, progress: 0, completed: false },
          ),
          lessons: LESSONS.map(
            (l) => parsed.lessons?.find((x) => x.id === l.id) ?? { id: l.id, completed: false, correct: 0 },
          ),
        });
      }
    } catch {
      /* ignore corrupted state */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(state));
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state, ready]);

  const update = useCallback((patch: Partial<SmartSaveState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const addXp = useCallback((amount: number, badge?: string) => {
    setState((s) => ({
      ...s,
      xp: s.xp + amount,
      badges: badge && !s.badges.includes(badge) ? [...s.badges, badge] : s.badges,
    }));
  }, []);

  const addExpense = useCallback((e: Omit<Expense, "id">) => {
    setState((s) => ({ ...s, expenses: [{ ...e, id: uid() }, ...s.expenses], xp: s.xp + 10 }));
  }, []);

  const removeExpense = useCallback((id: string) => {
    setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
  }, []);

  const addGoal = useCallback((g: Omit<Goal, "id">) => {
    setState((s) => ({ ...s, goals: [...s.goals, { ...g, id: uid() }], xp: s.xp + 20 }));
  }, []);

  const updateGoal = useCallback((id: string, patch: Partial<Goal>) => {
    setState((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) }));
  }, []);

  const removeGoal = useCallback((id: string) => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
  }, []);

  const contributeToGoal = useCallback((id: string, amount: number) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => (g.id === id ? { ...g, saved: Math.max(0, g.saved + amount) } : g)),
      xp: s.xp + 15,
    }));
  }, []);

  const completeLesson = useCallback((id: string, correct: number, xp: number) => {
    setState((s) => {
      const already = s.lessons.find((l) => l.id === id)?.completed;
      return {
        ...s,
        lessons: s.lessons.map((l) => (l.id === id ? { ...l, completed: true, correct } : l)),
        xp: s.xp + (already ? 0 : xp),
      };
    });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(KEY);
    setState(initialState());
  }, []);

  const toggleTheme = useCallback(() => {
    setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      ready,
      update,
      addExpense,
      removeExpense,
      addGoal,
      updateGoal,
      removeGoal,
      contributeToGoal,
      addXp,
      completeLesson,
      reset,
      toggleTheme,
    }),
    [state, ready, update, addExpense, removeExpense, addGoal, updateGoal, removeGoal, contributeToGoal, addXp, completeLesson, reset, toggleTheme],
  );

  return <SmartSaveContext.Provider value={value}>{children}</SmartSaveContext.Provider>;
}

export function useSmartSave() {
  const ctx = useContext(SmartSaveContext);
  if (!ctx) throw new Error("useSmartSave must be used inside SmartSaveProvider");
  return ctx;
}
