import { MoreVertical, Plus, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSmartSave } from "@/lib/smartsave/store";
import logoAsset from "@/assets/smartsave-logo.png.asset.json";

export function Welcome() {
  const { accounts, login, newAccount, removeAccount } = useSmartSave();
  const saved = [...accounts].sort((a, b) => (b.lastUsedAt ?? "").localeCompare(a.lastUsedAt ?? ""));

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-soft">
        <img src={logoAsset.url} alt="SmartSave logo" className="mx-auto size-16 rounded-2xl object-contain" />
        <h1 className="mt-4 text-center font-display text-2xl font-extrabold">
          {saved.length ? "Welcome back!" : "Welcome to SmartSave"}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {saved.length
            ? "Continue with one of your saved accounts, or use another account."
            : "Start a fresh simulation and build better money habits."}
        </p>

        {saved.length > 0 && (
          <>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Continue with</p>
            <ul className="mt-2 space-y-2">
              {saved.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition-colors hover:bg-accent/40"
                >
                  <button
                    type="button"
                    onClick={() => login(a.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    {a.avatar ? (
                      <img src={a.avatar} alt="" className="size-10 rounded-full object-cover" />
                    ) : (
                      <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
                        <UserRound className="size-5" />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{a.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {a.email || "Virtual demo account"}
                      </span>
                    </span>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Options for ${a.name}`}>
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => removeAccount(a.id)}>Remove this account</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          </>
        )}

        <Button
          variant={saved.length ? "secondary" : "default"}
          className="mt-4 w-full justify-start gap-3 py-6"
          onClick={newAccount}
        >
          <span className="grid size-8 place-items-center rounded-full bg-primary/15 text-primary">
            <Plus className="size-4" />
          </span>
          {saved.length ? "Use another account" : "Join in as a new user"}
        </Button>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Removing an account only forgets it on this browser. Virtual money only — SmartSave is an educational
          simulation.
        </p>
      </div>
    </div>
  );
}
