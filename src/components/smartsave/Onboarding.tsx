import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useSmartSave } from "@/lib/smartsave/store";
import { CATEGORIES, GOAL_PRESETS, LEARN_INTERESTS, MODES, defaultGoals, sampleExpenses } from "@/lib/smartsave/data";
import { money } from "@/lib/smartsave/selectors";
import type { Allocation, CategoryId, ChallengeMode } from "@/lib/smartsave/types";
import logoAsset from "@/assets/smartsave-logo.png.asset.json";

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];
const DURATIONS = [7, 14, 30, 60, 90];
const CONFIDENCE = ["Just starting", "A little unsure", "Okay-ish", "Fairly confident", "Very confident"];

export function Onboarding() {
  const { update } = useSmartSave();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goalIdx, setGoalIdx] = useState(1);
  const [customGoalName, setCustomGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState(800);
  const [cats, setCats] = useState<CategoryId[]>(["food", "transport", "entertainment", "education"]);
  const [confidence, setConfidence] = useState(3);
  const [interests, setInterests] = useState<string[]>(["Budgeting basics", "Saving habits"]);
  const [mode, setMode] = useState<ChallengeMode>("beginner");
  const [duration, setDuration] = useState(30);
  const [balance, setBalance] = useState(1000);
  const [custom, setCustom] = useState("");
  const [alloc, setAlloc] = useState<Allocation>({ savings: 300, needs: 350, wants: 150, emergency: 100, goals: 100 });

  const allocTotal = useMemo(() => Object.values(alloc).reduce((a, b) => a + b, 0), [alloc]);
  const left = balance - allocTotal;

  const steps = ["Welcome", "Your goal", "Your money habits", "Challenge", "Starting money", "Your plan"];

  const setAllocKey = (k: keyof Allocation, v: number) => setAlloc((a) => ({ ...a, [k]: Math.max(0, Math.round(v)) }));

  const rescale = (b: number) => {
    setBalance(b);
    setAlloc({
      savings: Math.round(b * 0.3),
      needs: Math.round(b * 0.35),
      wants: Math.round(b * 0.15),
      emergency: Math.round(b * 0.1),
      goals: Math.round(b * 0.1),
    });
  };

  const finish = () => {
    const preset = GOAL_PRESETS[goalIdx];
    const isCustom = goalIdx === GOAL_PRESETS.length;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + duration);
    const mainGoal = {
      id: "goal-main",
      emoji: isCustom ? "🎯" : (preset?.emoji ?? "🎯"),
      name: isCustom ? customGoalName || "My goal" : (preset?.name ?? "My goal"),
      target: goalTarget,
      saved: alloc.goals,
      targetDate: targetDate.toISOString().slice(0, 10),
    };
    const extras = defaultGoals()
      .filter((g) => g.name.toLowerCase() !== mainGoal.name.toLowerCase())
      .slice(0, 2)
      .map((g) => ({ ...g, saved: Math.round(g.saved * (balance / 1000)), target: Math.round(g.target * Math.max(0.3, balance / 1000)) }));

    update({
      onboarded: true,
      name: name.trim() || "Saver",
      mode,
      durationDays: duration,
      confidence,
      learnInterests: interests,
      startingBalance: balance,
      allocation: alloc,
      goals: [mainGoal, ...extras],
      expenses: sampleExpenses(Math.max(0.25, balance / 1000)),
      xp: 120,
      badges: ["First Savings Goal"],
      startedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="mb-8 flex items-center gap-3">
          <img src={logoAsset.url} alt="SmartSave logo" className="size-12 rounded-2xl bg-white object-contain p-1 shadow-soft" />
          <div>
            <h1 className="text-2xl font-extrabold">SmartSave</h1>
            <p className="text-xs text-muted-foreground">Virtual money · educational simulation</p>
          </div>
        </div>

        <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
        <p className="mt-2 text-xs font-medium text-muted-foreground">
          Step {step + 1} of {steps.length} · {steps[step]}
        </p>

        <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-lift sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-extrabold">Welcome to SmartSave 👋</h2>
              <p className="text-sm text-muted-foreground">
                You'll get a <strong>virtual wallet</strong> of demo money and a mission: manage it wisely, reach your
                savings goal, and learn real money skills along the way. No real money, no bank accounts — just
                practice.
              </p>
              <div>
                <Label htmlFor="name">What should we call you?</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-extrabold">What is your main savings goal?</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {GOAL_PRESETS.map((g, i) => (
                  <Choice
                    key={g.name}
                    active={goalIdx === i}
                    onClick={() => {
                      setGoalIdx(i);
                      setGoalTarget(g.target);
                    }}
                  >
                    <span className="text-xl">{g.emoji}</span>
                    <span className="font-semibold">{g.name}</span>
                  </Choice>
                ))}
                <Choice active={goalIdx === GOAL_PRESETS.length} onClick={() => setGoalIdx(GOAL_PRESETS.length)}>
                  <span className="text-xl">🎯</span>
                  <span className="font-semibold">Custom goal</span>
                </Choice>
              </div>
              {goalIdx === GOAL_PRESETS.length && (
                <div>
                  <Label htmlFor="cg">Name your goal</Label>
                  <Input id="cg" className="mt-2" value={customGoalName} onChange={(e) => setCustomGoalName(e.target.value)} placeholder="e.g. Concert tickets" />
                </div>
              )}
              <div>
                <Label htmlFor="gt">How much do you want to save?</Label>
                <Input
                  id="gt"
                  type="number"
                  min={1}
                  className="mt-2"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(Math.max(1, Number(e.target.value)))}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">You can change this at any time.</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold">What are your common expense categories?</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        setCats((prev) => (prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id]))
                      }
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-sm font-medium transition",
                        cats.includes(c.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:bg-secondary",
                      )}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-display text-base font-bold">How confident are you with managing money?</h3>
                <Slider
                  className="mt-4"
                  min={1}
                  max={5}
                  step={1}
                  value={[confidence]}
                  onValueChange={(v) => setConfidence(v[0] ?? 3)}
                />
                <p className="mt-2 text-sm font-medium text-primary">{CONFIDENCE[confidence - 1]}</p>
              </div>
              <div>
                <h3 className="font-display text-base font-bold">What would you like to learn?</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {LEARN_INTERESTS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setInterests((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
                      }
                      className={cn(
                        "rounded-full border px-3.5 py-2 text-sm font-medium transition",
                        interests.includes(t)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:bg-secondary",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-extrabold">Choose your challenge</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {MODES.map((m) => (
                  <Choice key={m.id} active={mode === m.id} onClick={() => setMode(m.id)}>
                    <span className="text-xl">{m.emoji}</span>
                    <span>
                      <span className="block font-semibold">{m.name}</span>
                      <span className="block text-xs text-muted-foreground">{m.desc}</span>
                    </span>
                  </Choice>
                ))}
              </div>
              <div>
                <h3 className="font-display text-base font-bold">Challenge duration</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={cn(
                        "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                        duration === d ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary",
                      )}
                    >
                      {d} days
                    </button>
                  ))}
                  <Input
                    type="number"
                    min={1}
                    placeholder="Custom"
                    className="h-10 w-28"
                    onChange={(e) => setDuration(Math.max(1, Number(e.target.value) || 1))}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Longer challenges bring more scenarios and financial decisions.
                </p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-extrabold">💰 Choose your starting money</h2>
              <p className="text-sm text-muted-foreground">
                This is your virtual money for the SmartSave challenge. Choose an amount and see how well you can manage
                it.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {PRESET_AMOUNTS.map((a) => (
                  <Choice key={a} active={balance === a && !custom} onClick={() => { setCustom(""); rescale(a); }}>
                    <span className="num-display text-lg font-extrabold">{money(a)}</span>
                  </Choice>
                ))}
              </div>
              <div>
                <Label htmlFor="custom">✏️ Custom amount</Label>
                <Input
                  id="custom"
                  type="number"
                  min={1}
                  className="mt-2"
                  placeholder="Enter your amount"
                  value={custom}
                  onChange={(e) => {
                    setCustom(e.target.value);
                    const v = Number(e.target.value);
                    if (v > 0) rescale(Math.round(v));
                  }}
                />
              </div>
              <div className="rounded-2xl bg-hero-gradient p-5 text-primary-foreground shadow-soft">
                <p className="text-xs opacity-85">Your starting balance</p>
                <p className="num-display text-4xl font-extrabold">{money(balance)}</p>
                <p className="mt-1 text-xs opacity-85">Virtual demo money — not real currency.</p>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <h2 className="text-xl font-extrabold">How do you want to divide your money?</h2>
              <p className="text-sm text-muted-foreground">
                You decide — nothing is chosen for you. You can change these amounts any time in the Budget planner.
              </p>
              <div className="space-y-4">
                {(
                  [
                    ["savings", "🏦 Savings", "Money you keep and grow."],
                    ["needs", "🏠 Needs", "Food, transport, education, bills."],
                    ["wants", "🎮 Wants", "Entertainment, shopping, hobbies."],
                    ["emergency", "🚨 Emergency fund", "Reserved for surprises."],
                    ["goals", "🎯 Personal goals", "Money moved toward your goal."],
                  ] as [keyof Allocation, string, string][]
                ).map(([k, label, hint]) => (
                  <div key={k} className="rounded-2xl border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-muted-foreground">{hint}</p>
                      </div>
                      <Input
                        type="number"
                        min={0}
                        className="h-9 w-28 text-right"
                        value={alloc[k]}
                        onChange={(e) => setAllocKey(k, Number(e.target.value) || 0)}
                      />
                    </div>
                    <Slider
                      className="mt-3"
                      min={0}
                      max={balance}
                      step={Math.max(1, Math.round(balance / 100))}
                      value={[alloc[k]]}
                      onValueChange={(v) => setAllocKey(k, v[0] ?? 0)}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-secondary p-4 text-sm font-semibold">
                <span>Allocated {money(allocTotal)} of {money(balance)}</span>
                <span className={left < 0 ? "text-destructive" : "text-primary"}>{money(Math.abs(left))} {left < 0 ? "over" : "left"}</span>
              </div>

              {left < 0 && (
                <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
                  ⚠️ Your planned expenses are higher than your available money. Reduce a category before continuing.
                </div>
              )}
              {left > 0 && (
                <div className="rounded-2xl border border-accent/50 bg-accent/15 p-4 text-sm">
                  💡 You still have {money(left)} unallocated. What would you like to do with it?
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setAllocKey("savings", alloc.savings + left)}>Save it</Button>
                    <Button size="sm" variant="secondary" onClick={() => setAllocKey("goals", alloc.goals + left)}>Add to goal</Button>
                    <Button size="sm" variant="secondary" onClick={() => setAllocKey("emergency", alloc.emergency + left)}>Emergency fund</Button>
                    <Button size="sm" variant="ghost" onClick={() => setStep(5)}>Keep available</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button size="lg" onClick={() => setStep((s) => s + 1)}>
                Continue
              </Button>
            ) : (
              <Button size="lg" onClick={finish} disabled={left < 0}>
                Start my challenge 🚀
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5",
        active ? "border-primary bg-primary/10 shadow-soft" : "border-border bg-card hover:bg-secondary/60",
      )}
    >
      {children}
    </button>
  );
}
