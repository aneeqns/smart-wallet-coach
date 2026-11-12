import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSmartSave } from "@/lib/smartsave/store";
import { LESSONS, type Lesson } from "@/lib/smartsave/data";
import { PageHeader, SectionCard, StatCard } from "@/components/smartsave/ui-bits";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn Money Basics — SmartSave" },
      { name: "description", content: "Short interactive money lessons with quizzes: budgets, needs vs wants, emergency funds and saving habits." },
      { property: "og:title", content: "Learn Money Basics — SmartSave" },
      { property: "og:description", content: "Bite-sized financial lessons with quizzes, XP and progress tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  const { state } = useSmartSave();
  const [active, setActive] = useState<Lesson | null>(null);
  const done = state.lessons.filter((l) => l.completed).length;

  return (
    <div className="space-y-6">
      <PageHeader emoji="🧠" title="Learn" subtitle="Short, interactive lessons. Two minutes each — then try it with your virtual money." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard tone="primary" emoji="📚" label="Lessons completed" value={`${done} / ${LESSONS.length}`} />
        <StatCard emoji="⭐" label="XP earned" value={String(state.xp)} />
        <StatCard emoji="📈" label="Course progress" value={`${Math.round((done / LESSONS.length) * 100)}%`} />
      </div>

      {active ? (
        <LessonView lesson={active} onClose={() => setActive(null)} />
      ) : (
        (["Beginner", "Intermediate"] as const).map((level) => (
          <SectionCard key={level} title={level} desc={level === "Beginner" ? "Start here" : "Next steps once basics feel easy"}>
            <div className="grid gap-3 md:grid-cols-2">
              {LESSONS.filter((l) => l.level === level).map((l) => {
                const st = state.lessons.find((x) => x.id === l.id);
                return (
                  <button
                    key={l.id}
                    onClick={() => setActive(l)}
                    className="flex items-center gap-3 rounded-2xl border border-border p-4 text-left transition hover:-translate-y-0.5 hover:bg-secondary/60"
                  >
                    <span className="grid size-11 place-items-center rounded-xl bg-secondary text-xl">{l.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{l.title}</span>
                      <span className="block text-xs text-muted-foreground">{l.minutes} min · +{l.xp} XP</span>
                    </span>
                    {st?.completed && <Badge>Done</Badge>}
                  </button>
                );
              })}
            </div>
          </SectionCard>
        ))
      )}
    </div>
  );
}

function LessonView({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const { completeLesson } = useSmartSave();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = lesson.quiz[step];

  return (
    <SectionCard>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">
          {lesson.emoji} {lesson.title}
        </h2>
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>
      <Progress className="mt-4 h-2" value={finished ? 100 : (step / (lesson.quiz.length + 1)) * 100} />

      {finished ? (
        <div className="mt-6 space-y-4">
          <p className="text-lg font-bold">🎉 Lesson complete!</p>
          <p className="text-sm text-muted-foreground">
            You answered {correct} of {lesson.quiz.length} correctly and earned {lesson.xp} XP.
          </p>
          <Button onClick={onClose}>Back to lessons</Button>
        </div>
      ) : step === 0 && picked === null ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">{lesson.intro}</p>
          <ul className="space-y-2">
            {lesson.points.map((p) => (
              <li key={p} className="rounded-xl bg-secondary/60 p-3 text-sm">• {p}</li>
            ))}
          </ul>
          <Button onClick={() => setPicked(-1)}>Start the quiz →</Button>
        </div>
      ) : q ? (
        <div className="mt-4 space-y-4">
          <p className="font-semibold">{q.q}</p>
          <div className="grid gap-2">
            {q.options.map((o, i) => (
              <button
                key={o}
                onClick={() => {
                  if (picked !== null && picked >= 0) return;
                  setPicked(i);
                  if (i === q.answer) setCorrect((c) => c + 1);
                }}
                className={cn(
                  "rounded-2xl border p-3 text-left text-sm transition",
                  picked !== null && picked >= 0
                    ? i === q.answer
                      ? "border-primary bg-primary/10"
                      : i === picked
                        ? "border-destructive bg-destructive/10"
                        : "border-border opacity-70"
                    : "border-border hover:bg-secondary",
                )}
              >
                {o}
              </button>
            ))}
          </div>
          {picked !== null && picked >= 0 && (
            <>
              <div className="rounded-2xl border border-accent/50 bg-accent/15 p-4 text-sm">💡 {q.why}</div>
              <Button
                onClick={() => {
                  if (step + 1 >= lesson.quiz.length) {
                    completeLesson(lesson.id, correct, lesson.xp);
                    setFinished(true);
                  } else {
                    setStep((s) => s + 1);
                    setPicked(-1);
                  }
                }}
              >
                {step + 1 >= lesson.quiz.length ? "Finish lesson" : "Next question →"}
              </Button>
            </>
          )}
        </div>
      ) : null}
    </SectionCard>
  );
}
