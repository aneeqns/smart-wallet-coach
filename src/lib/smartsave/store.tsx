import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CHALLENGES, LESSONS, initialState } from "./data";
import type { Expense, Goal, SavedAccount, SmartSaveState } from "./types";

const LEGACY_KEY = "smartsave.state.v1";
const ACCOUNTS_KEY = "smartsave.accounts.v1";
const ACTIVE_KEY = "smartsave.activeAccount.v1";
const stateKey = (id: string) => `smartsave.state.v1:${id}`;

interface Ctx {
  state: SmartSaveState;
  ready: boolean;
  accounts: SavedAccount[];
  activeId: string | null;
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
  logout: () => void;
  login: (id: string) => void;
  newAccount: () => void;
  removeAccount: (id: string) => void;
}

const SmartSaveContext = createContext<Ctx | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

const hydrate = (parsed: Partial<SmartSaveState>): SmartSaveState => ({
  ...initialState(),
  ...parsed,
  challenges: CHALLENGES.map(
    (c) => parsed.challenges?.find((x) => x.id === c.id) ?? { id: c.id, progress: 0, completed: false },
  ),
  lessons: LESSONS.map((l) => parsed.lessons?.find((x) => x.id === l.id) ?? { id: l.id, completed: false, correct: 0 }),
});

const readAccounts = (): SavedAccount[] => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as SavedAccount[]) : [];
    return Array.isArray(parsed) ? parsed.filter((a) => a && typeof a.id === "string") : [];
  } catch {
    return [];
  }
};

const readState = (id: string): SmartSaveState | null => {
  try {
    const raw = localStorage.getItem(stateKey(id));
    return raw ? hydrate(JSON.parse(raw) as SmartSaveState) : null;
  } catch {
    return null;
  }
};

export function SmartSaveProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SmartSaveState>(initialState);
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const activeRef = useRef<string | null>(null);
  activeRef.current = activeId;

  // Load remembered accounts + active session
  useEffect(() => {
    let list = readAccounts();

    // Migrate a legacy single-profile save into the account list.
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      try {
        const legacy = hydrate(JSON.parse(legacyRaw) as SmartSaveState);
        const id = uid();
        localStorage.setItem(stateKey(id), JSON.stringify(legacy));
        list = [
          { id, name: legacy.name || "Saver", email: legacy.email ?? "", avatar: legacy.avatar ?? "", lastUsedAt: new Date().toISOString() },
          ...list,
        ];
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
        if (!legacy.loggedOut) localStorage.setItem(ACTIVE_KEY, id);
      } catch {
        /* ignore corrupted legacy state */
      }
      localStorage.removeItem(LEGACY_KEY);
    }

    setAccounts(list);

    const active = localStorage.getItem(ACTIVE_KEY);
    if (active && list.some((a) => a.id === active)) {
      const loaded = readState(active);
      if (loaded) {
        setState(loaded);
        setActiveId(active);
      }
    }
    setReady(true);
  }, []);

  // Persist active account state + keep its directory entry fresh
  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", state.theme === "dark");
    const id = activeId;
    if (!id) return;
    localStorage.setItem(stateKey(id), JSON.stringify(state));
    setAccounts((list) => {
      const next: SavedAccount[] = list.map((a) =>
        a.id === id
          ? { ...a, name: state.name || a.name, email: state.email ?? a.email ?? "", avatar: state.avatar ?? a.avatar ?? "" }
          : a,
      );
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
      return next;
    });
  }, [state, ready, activeId]);

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

  /** Remember an account (no duplicates) and move it to the top of the list. */
  const rememberAccount = useCallback((account: SavedAccount) => {
    setAccounts((list) => {
      const existing = list.find((a) => a.id === account.id);
      const merged: SavedAccount = { ...existing, ...account, lastUsedAt: new Date().toISOString() };
      const next = [merged, ...list.filter((a) => a.id !== account.id)];
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const login = useCallback(
    (id: string) => {
      const loaded = readState(id) ?? initialState();
      setState(loaded);
      setActiveId(id);
      localStorage.setItem(ACTIVE_KEY, id);
      rememberAccount({
        id,
        name: loaded.name || "Saver",
        email: loaded.email ?? "",
        avatar: loaded.avatar ?? "",
        lastUsedAt: new Date().toISOString(),
      });
    },
    [rememberAccount],
  );

  const newAccount = useCallback(() => {
    const id = uid();
    const fresh = { ...initialState(), id };
    localStorage.setItem(stateKey(id), JSON.stringify(fresh));
    setState(fresh);
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
    rememberAccount({ id, name: "", email: "", avatar: "", lastUsedAt: new Date().toISOString() });
  }, [rememberAccount]);

  const logout = useCallback(() => {
    const id = activeRef.current;
    if (id) {
      rememberAccount({ id, name: state.name || "Saver", email: state.email ?? "", avatar: state.avatar ?? "", lastUsedAt: new Date().toISOString() });
    }
    localStorage.removeItem(ACTIVE_KEY);
    setActiveId(null);
    setState(initialState());
  }, [rememberAccount, state.name, state.email, state.avatar]);

  /** Forget an account on this device only — its saved data stays untouched unless it is the removed profile. */
  const removeAccount = useCallback((id: string) => {
    setAccounts((list) => {
      const next = list.filter((a) => a.id !== id);
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
      return next;
    });
    // The profile's saved data is intentionally left in place — only the
    // remembered-account entry is forgotten on this device.
    if (activeRef.current === id) {
      localStorage.removeItem(ACTIVE_KEY);
      setActiveId(null);
      setState(initialState());
    }
  }, []);

  const reset = useCallback(() => {
    const id = activeRef.current;
    const fresh = initialState();
    if (id) localStorage.setItem(stateKey(id), JSON.stringify({ ...fresh, id }));
    setState(fresh);
  }, []);

  const toggleTheme = useCallback(() => {
    setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
  }, []);

  const value = useMemo(
    () => ({
      state,
      ready,
      accounts,
      activeId,
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
      logout,
      login,
      newAccount,
      removeAccount,
    }),
    [state, ready, accounts, activeId, update, addExpense, removeExpense, addGoal, updateGoal, removeGoal, contributeToGoal, addXp, completeLesson, reset, toggleTheme, logout, login, newAccount, removeAccount],
  );

  return <SmartSaveContext.Provider value={value}>{children}</SmartSaveContext.Provider>;
}

export function useSmartSave() {
  const ctx = useContext(SmartSaveContext);
  if (!ctx) throw new Error("useSmartSave must be used inside SmartSaveProvider");
  return ctx;
}
