import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/smartsave/ui-bits";
import { useSmartSave } from "@/lib/smartsave/store";
import { computeStats } from "@/lib/smartsave/selectors";
import { buildSuggestions } from "@/lib/smartsave/whatif";

export function SmartSuggestions({ limit = 3, className }: { limit?: number; className?: string }) {
  const { state } = useSmartSave();
  const suggestions = useMemo(() => {
    const stats = computeStats(state);
    return buildSuggestions(state, stats).slice(0, limit);
  }, [state, limit]);

  return (
    <SectionCard
      className={className ?? ""}
      title="💡 Smart spending suggestions"
      desc="Not just what you spent — what a small change would unlock"
    >
      <ul className="space-y-3">
        {suggestions.map((s, i) => (
          <li key={i} className="rounded-2xl border border-border bg-secondary/50 p-4">
            <p className="flex items-start gap-2 text-sm font-semibold">
              <span className="text-base">{s.icon}</span>
              {s.headline}
            </p>
            <p className="mt-1.5 pl-7 text-sm text-muted-foreground">{s.body}</p>
            {s.daysEarlier ? (
              <p className="mt-2 ml-7 inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                🎯 {s.daysEarlier} day{s.daysEarlier === 1 ? "" : "s"} earlier
              </p>
            ) : null}
          </li>
        ))}
      </ul>
      <Button variant="ghost" className="mt-3" asChild>
        <Link to="/simulator">Try the “What If?” simulator →</Link>
      </Button>
    </SectionCard>
  );
}
