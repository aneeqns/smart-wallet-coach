import { Link, useRouterState } from "@tanstack/react-router";
import { Moon, Sun, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useSmartSave } from "@/lib/smartsave/store";
import { computeStats, levelFor, money } from "@/lib/smartsave/selectors";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/smartsave-logo.png.asset.json";

const NAV = [
  { to: "/", emoji: "🏠", label: "Dashboard" },
  { to: "/expenses", emoji: "💳", label: "Expenses" },
  { to: "/goals", emoji: "🎯", label: "Goals" },
  { to: "/budget", emoji: "📊", label: "Budget" },
  { to: "/learn", emoji: "🧠", label: "Learn" },
  { to: "/savebot", emoji: "🤖", label: "SaveBot" },
  { to: "/coach", emoji: "🌱", label: "Savings Coach" },
  { to: "/challenges", emoji: "🏆", label: "Challenges" },
  { to: "/insights", emoji: "📈", label: "Insights" },
  { to: "/simulator", emoji: "🔮", label: "What If?" },
  { to: "/profile", emoji: "👤", label: "Profile" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { state, toggleTheme } = useSmartSave();
  const stats = computeStats(state);
  const lvl = levelFor(state.xp);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-soft"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <span className="text-base">{item.emoji}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <Brand />
        <div className="mt-6 flex-1">{nav}</div>
        <LevelCard level={lvl.level} title={lvl.title} into={lvl.into} next={lvl.next} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar p-4">
            <div className="flex items-center justify-between">
              <Brand />
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="size-5" />
              </Button>
            </div>
            <div className="mt-6 flex-1">{nav}</div>
            <LevelCard level={lvl.level} title={lvl.title} into={lvl.into} next={lvl.next} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
          <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
            <span className="size-2 rounded-full bg-primary" />
            Virtual money · demo only
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Virtual balance</p>
              <p className="num-display text-lg font-bold">{money(stats.remaining)}</p>
            </div>
            <Button variant="secondary" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {state.theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        <footer className="px-6 pb-8 text-center text-xs text-muted-foreground">
          SmartSave is an educational simulation. All balances, expenses and savings are virtual demo money — no real
          accounts, payments or financial advice.
        </footer>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <img src={logoAsset.url} alt="SmartSave logo" className="size-10 rounded-2xl object-contain" />
      <span>
        <span className="block font-display text-lg font-extrabold leading-none">SmartSave</span>
        <span className="block text-[11px] text-muted-foreground">Learn money by doing</span>
      </span>
    </Link>
  );
}

function LevelCard({ level, title, into, next }: { level: number; title: string; into: number; next: number }) {
  return (
    <div className="rounded-2xl border border-sidebar-border bg-card p-4 shadow-soft">
      <p className="text-xs text-muted-foreground">Level {level}</p>
      <p className="font-display text-sm font-bold">{title}</p>
      <Progress value={(into / next) * 100} className="mt-2 h-2" />
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        XP {into} / {next}
      </p>
    </div>
  );
}
