import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSmartSave } from "@/lib/smartsave/store";
import { computeScore, computeStats, money } from "@/lib/smartsave/selectors";
import { SectionCard } from "@/components/smartsave/ui-bits";
import type { SmartSaveState } from "@/lib/smartsave/types";
import type { Stats } from "@/lib/smartsave/selectors";
import savebotAsset from "@/assets/savebot.png.asset.json";
import { shariahReply } from "@/lib/smartsave/shariah";

export const Route = createFileRoute("/savebot")({
  head: () => ({
    meta: [
      { title: "SaveBot Money Coach — SmartSave" },
      { name: "description", content: "Ask SaveBot about your virtual spending and get educational, plain-language coaching on budgeting and saving." },
      { property: "og:title", content: "SaveBot Money Coach — SmartSave" },
      { property: "og:description", content: "An educational money coach that explains your spending patterns and helps you plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SaveBotPage,
});

const SUGGESTIONS = [
  "Why am I running out of money?",
  "How can I reach my goal faster?",
  "Where is my money going?",
  "How do I start an emergency fund?",
  "Am I spending too much on wants?",
  "What are riba and maysir?",
  "How are zakat and sadaqah different?",
  "How do I give zakah?",
];

function reply(question: string, s: SmartSaveState, st: Stats): string {
  const educationalReply = shariahReply(question);
  if (educationalReply) return educationalReply;
  const q = question.toLowerCase();
  const topCat = [...st.byCategory].sort((a, b) => b.value - a.value)[0];
  const goal = s.goals[0];

  if (q.includes("running out") || q.includes("no money") || q.includes("broke")) {
    return `You've spent ${money(st.spent)} so far, and ${money(st.wantTotal)} of that was Wants. ${
      topCat ? `${topCat.label} is your biggest category at ${money(topCat.value)}. ` : ""
    }Try setting a weekly ceiling for your top Wants category and moving your savings aside first — spending what's left is much easier than saving what's left.`;
  }
  if (q.includes("faster") || q.includes("goal")) {
    if (!goal) return "You don't have a goal yet. Create one in the Goals page with a target amount and date — I'll help you break it into weekly amounts.";
    const remaining = Math.max(0, goal.target - goal.saved);
    const weeks = Math.max(1, Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (7 * 864e5)));
    return `Your ${goal.name} goal needs ${money(remaining)} more. Over ${weeks} week${weeks === 1 ? "" : "s"} that's about ${money(remaining / weeks)} per week. Review your weekly Wants (currently ${money(st.wantTotal)}) and decide which ones matter least — redirecting even one of them each week gets you there sooner.`;
  }
  if (q.includes("where") || q.includes("going") || q.includes("spend")) {
    return `Your spending so far: ${st.byCategory
      .sort((a, b) => b.value - a.value)
      .slice(0, 4)
      .map((c) => `${c.emoji} ${c.label} ${money(c.value)}`)
      .join(", ")}. Needs are ${money(st.needTotal)} and Wants are ${money(st.wantTotal)}. Watch the Wants side — that's the part you control most easily.`;
  }
  if (q.includes("emergency")) {
    return `You currently hold ${money(st.emergency)} as an emergency fund. A practical first target is about 10% of your balance — roughly ${money(s.startingBalance * 0.1)} for you. Add a small amount each week and only touch it for unexpected, necessary costs.`;
  }
  if (q.includes("want") || q.includes("too much")) {
    const share = st.needTotal + st.wantTotal > 0 ? Math.round((st.wantTotal / (st.needTotal + st.wantTotal)) * 100) : 0;
    return `Wants are ${share}% of your spending. Below about 30% usually leaves room to save comfortably. If you want to bring it down, pick one category and set a fixed weekly amount rather than cutting everything at once — plans that feel harsh rarely last.`;
  }
  if (q.includes("save") || q.includes("how much")) {
    return `Your savings rate is ${st.savingsRate}% (${money(st.saved)} of ${money(st.starting)}). A simple habit: move your saving amount the moment your money arrives, then plan the rest. Small and consistent beats big and rare.`;
  }
  if (q.includes("score")) {
    const sc = computeScore(s, st);
    const weakest = [...sc.parts].sort((a, b) => a.value / a.max - b.value / b.max)[0];
    return `Your SmartSave score is ${sc.score}/100 — ${sc.label}. It's an in-app learning score, not a credit score. Biggest opportunity: ${weakest?.tip}`;
  }
  return `Here's your snapshot: balance ${money(st.starting)}, spent ${money(st.spent)}, saved ${money(st.saved)} (${st.savingsRate}% savings rate). Ask me about your spending patterns, your goal timeline, budgeting, or building an emergency fund — I stick to education and budgeting, not investment or product advice.`;
}

function SaveBotPage() {
  const { state } = useSmartSave();
  const stats = useMemo(() => computeStats(state), [state]);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    {
      role: "bot",
      text: `Hi ${state.name || "there"}! I'm SaveBot 🤖 — your money coach for this simulation. Ask me why your money is disappearing, how to reach a goal faster, or how budgets work.`,
    },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }, { role: "bot", text: reply(text, state, stats) }]);
    setInput("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <img src={savebotAsset.url} alt="SaveBot mascot" className="size-16 shrink-0 object-contain" />
        <div>
          <h1 className="font-display text-2xl font-extrabold">SaveBot</h1>
          <p className="text-sm text-muted-foreground">
            Shariah-conscious budgeting and saving — educational guidance, not fatwas or product certification.
          </p>
        </div>
      </div>

      <SectionCard>
        <div className="space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex items-end justify-start gap-2"}>
              {m.role === "bot" && (
                <img src={savebotAsset.url} alt="" className="size-8 shrink-0 object-contain" />
              )}
              <p
                className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground"
                    : "max-w-[85%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-3 text-sm"
                }
              >
                {m.text}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <Button key={s} variant="outline" size="sm" onClick={() => send(s)} className="h-auto whitespace-normal text-left text-xs">
              {s}
            </Button>
          ))}
        </div>

        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask SaveBot about your money…" />
          <Button type="submit">Send</Button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">
          SaveBot explains your virtual data for learning purposes only.
        </p>
      </SectionCard>
    </div>
  );
}
