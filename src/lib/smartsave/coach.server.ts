import { streamText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { SHARIAH_COACH_RULES, shariahReply } from "./shariah";

export interface CoachSnapshot {
  name: string;
  question: string;
  starting: number;
  spent: number;
  saved: number;
  remaining: number;
  savingsRate: number;
  needTotal: number;
  wantTotal: number;
  score: number;
  streak: number;
  topCategories: { label: string; value: number }[];
  goals: { name: string; target: number; saved: number; targetDate: string }[];
}

const SYSTEM = `You are Savings Coach inside SmartSave, an educational money simulator that uses virtual demo money.
Give practical, encouraging budgeting and saving coaching based only on the user's numbers.
Rules:
- Educational only. No investment, credit, tax or financial product advice.
- Be concrete: reference their actual amounts, categories and goals.
- Answer in short markdown: a one-line summary, then 3-5 bullet actions, then one motivating sentence.
- Never invent data that is not in the snapshot.`;

export async function generateCoachAdvice(data: CoachSnapshot): Promise<string> {
  const educationalReply = shariahReply(data.question);
  if (educationalReply) return educationalReply;
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const gateway = createLovableAiGatewayProvider(key);
  const result = streamText({
    model: gateway("google/gemini-3.6-flash"),
    system: `${SYSTEM}\n${SHARIAH_COACH_RULES}`,
    prompt: `User: ${data.name || "Saver"}
Question: ${data.question || "Give me a personalised savings plan for this week."}

Snapshot (virtual money, USD):
- Starting balance: ${data.starting}
- Spent: ${data.spent}
- Saved: ${data.saved} (savings rate ${data.savingsRate}%)
- Unallocated remaining: ${data.remaining}
- Needs spending: ${data.needTotal}; Wants spending: ${data.wantTotal}
- SmartSave score: ${data.score}/100; streak: ${data.streak} days
- Top categories: ${data.topCategories.map((c) => `${c.label} ${c.value}`).join(", ") || "none yet"}
- Goals: ${data.goals.map((g) => `${g.name} ${g.saved}/${g.target} by ${g.targetDate}`).join("; ") || "none yet"}`,
  });

  return await result.text;
}
