import { Button } from "@/components/ui/button";
import { useSmartSave } from "@/lib/smartsave/store";
import { money } from "@/lib/smartsave/selectors";
import logoAsset from "@/assets/smartsave-logo.png.asset.json";

export function Welcome() {
  const { state, login, reset } = useSmartSave();
  const hasProfile = state.onboarded && Boolean(state.name);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
        <img src={logoAsset.url} alt="SmartSave logo" className="mx-auto size-16 rounded-2xl object-contain" />
        <h1 className="mt-4 font-display text-2xl font-extrabold">Welcome to SmartSave</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Continue where you left off, or start a fresh simulation as a new user.
        </p>

        <div className="mt-6 space-y-3">
          {hasProfile && (
            <Button className="w-full" size="lg" onClick={login}>
              Continue as {state.name} · {money(state.startingBalance)} plan
            </Button>
          )}
          <Button variant={hasProfile ? "secondary" : "default"} className="w-full" size="lg" onClick={reset}>
            Join in as a new user
          </Button>
        </div>

        <p className="mt-6 text-[11px] text-muted-foreground">
          Virtual money only — SmartSave is an educational simulation.
        </p>
      </div>
    </div>
  );
}
