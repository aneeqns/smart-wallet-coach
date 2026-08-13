import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateCoachAdvice } from "./coach.server";

const CoachInput = z.object({
  name: z.string().max(60).default(""),
  question: z.string().max(400).default(""),
  starting: z.number(),
  spent: z.number(),
  saved: z.number(),
  remaining: z.number(),
  savingsRate: z.number(),
  needTotal: z.number(),
  wantTotal: z.number(),
  score: z.number(),
  streak: z.number(),
  topCategories: z.array(z.object({ label: z.string(), value: z.number() })).max(8),
  goals: z
    .array(z.object({ name: z.string(), target: z.number(), saved: z.number(), targetDate: z.string() }))
    .max(8),
});

export const getCoachAdvice = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CoachInput.parse(input))
  .handler(async ({ data }) => ({ text: await generateCoachAdvice(data) }));
