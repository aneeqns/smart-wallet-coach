import type { Expense } from "./types";

export type GivingKind = "zakah" | "fitr" | "sadaqah";
export const GIVING_LABELS: Record<GivingKind, string> = {
  zakah: "Zakah al-mal", fitr: "Zakah al-fitr", sadaqah: "Sadaqah",
};

/** Virtual practice only: a record is an expense, never a real payment or assessment. */
export function givingExpense(kind: GivingKind, amount: number, available: number, recipient: string, date: string): Omit<Expense, "id"> | null {
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isFinite(available) || amount > available || !recipient.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return { amount, category: "other", necessity: kind === "sadaqah" ? "want" : "need", date, description: `Virtual ${GIVING_LABELS[kind]} — ${recipient.trim()}` };
}