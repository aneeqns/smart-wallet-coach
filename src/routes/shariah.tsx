import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { HeartHandshake, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSmartSave } from "@/lib/smartsave/store";
import { computeStats, money } from "@/lib/smartsave/selectors";
import { givingExpense, GIVING_LABELS, type GivingKind } from "@/lib/smartsave/giving";
import { PageHeader } from "@/components/smartsave/ui-bits";

export const Route = createFileRoute("/shariah")({
  head: () => ({ meta: [
    { title: "Shariah & Giving — Zakah and Sadaqah | SmartSave" },
    { name: "description", content: "Learn Islamic money principles, zakah eligibility and recipients, and practise giving with virtual money." },
    { property: "og:title", content: "Shariah & Giving — SmartSave" },
    { property: "og:description", content: "Educational guidance on zakah, sadaqah, lawful spending and fair dealings; virtual giving only." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ShariahPage,
});

const PRINCIPLES = [
  ["Lawful income & spending", "Choose permissible work and purchases. Avoid prohibited goods and services; a Need or Want label does not establish permissibility."],
  ["No riba or gambling", "Avoid interest (riba), gambling (maysir) and paid chance-based rewards. Savings forecasts here use your contributions only."],
  ["Fair, clear dealings", "Avoid fraud, bribery and excessive contractual uncertainty (gharar). Honour agreements, disclose relevant terms and respect others’ rights."],
  ["Moderation & responsibilities", "Avoid waste (israf). Meet essential responsibilities and others’ rights; voluntary generosity should not neglect dependants."],
  ["Worship & family rights", "Prayer, fasting, zakah and Hajj when able are religious duties, not savings challenges. Inheritance has prescribed rules; seek qualified guidance rather than dividing an estate using a budget."],
];

function ShariahPage() {
  const { state, addExpense, removeExpense } = useSmartSave();
  const stats = computeStats(state);
  const [kind, setKind] = useState<GivingKind>("zakah");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notice, setNotice] = useState("");
  const records = state.expenses.filter(e => /^Virtual (Zakah al-mal|Zakah al-fitr|Sadaqah) — /.test(e.description));

  return <div className="space-y-8">
    <PageHeader emoji="🤲" title="Shariah & Giving" subtitle="Zakah is an obligation when its conditions are met. Sadaqah is voluntary generosity." />
    <p className="border-l-4 border-primary bg-secondary/50 p-4 text-sm leading-relaxed">
      This guide covers core Islamic money principles, not every Shariah ruling or scholarly certification. Schools of thought differ on some details. Consult a qualified scholar for your circumstances. All giving below is virtual — no money is donated and no real obligation is fulfilled.
    </p>

    <section aria-labelledby="principles-title" className="space-y-4">
      <h2 id="principles-title" className="font-display text-xl font-bold">Islamic money principles</h2>
      <dl className="grid gap-x-8 md:grid-cols-2">
        {PRINCIPLES.map(([title, text]) => <div key={title} className="border-b border-border py-4">
          <dt className="font-semibold">{title}</dt><dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</dd>
        </div>)}
      </dl>
    </section>

    <section aria-labelledby="zakah-title" className="space-y-4">
      <h2 id="zakah-title" className="font-display text-xl font-bold">Giving zakah correctly</h2>
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4 text-sm leading-relaxed">
          <h3 className="font-semibold">Zakah al-mal: wealth</h3>
          <ul className="list-disc space-y-3 pl-5">
            <li>Assess real qualifying assets, ownership and allowable liabilities. Personal-use essentials are generally excluded; jewellery, business assets and debts need specific guidance.</li>
            <li>Nisab is the minimum wealth threshold. Gold and silver standards and their valuation differ; confirm your chosen standard and current value with a qualified scholar. SmartSave does not supply a live nisab.</li>
            <li>For qualifying monetary wealth, a lunar holding period (hawl) generally applies. Rules for falling below nisab and some asset classes differ.</li>
            <li>A common monetary-wealth rate is <strong>2.5%</strong>, only once eligibility is established. For example, $1,000 of qualifying wealth would give $25 at that rate; this is not an assessment of your virtual or real balance. Crops, livestock and other assets have different rules.</li>
            <li>Make the intention of zakah and give when due to eligible recipients, directly or through a trusted zakah distributor. A general charity donation does not automatically count as zakah.</li>
          </ul>
        </div>
        <div className="space-y-4 text-sm leading-relaxed">
          <h3 className="font-semibold">Who can receive it?</h3>
          <p className="text-muted-foreground">Qur’an 9:60 names eight categories; their application requires qualified guidance:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>The poor</li><li>The needy</li><li>Those appointed to administer zakah</li><li>Those whose hearts are to be reconciled</li><li>Freeing people from bondage</li><li>Those eligible because of debt</li><li>In the cause of Allah</li><li>Stranded travellers</li>
          </ol>
          <p className="text-muted-foreground">Not every cause or family member is eligible. Maintenance obligations and the interpretation of categories matter; verify before giving.</p>
          <h3 className="font-semibold">Zakah al-fitr: Ramadan</h3>
          <p>Distinct from wealth zakah, with separate eligibility and household rules. It is due before the Eid al-Fitr prayer. Confirm the local food measure, eligible recipients and whether a cash equivalent is accepted with your scholar or trusted local organisation.</p>
          <h3 className="font-semibold">Sadaqah: voluntary</h3>
          <p>Give voluntarily from lawful means, without neglecting essentials. Sadaqah does not replace zakah that is due.</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">References: <a className="underline" href="https://quran.com/9/60" target="_blank" rel="noreferrer">Qur’an 9:60</a> · <a className="underline" href="https://islamic-relief.org/zakat/" target="_blank" rel="noreferrer">Islamic Relief: Zakat</a> · <a className="underline" href="https://islamic-relief.org/zakat-faq/" target="_blank" rel="noreferrer">Zakat FAQ and differences of opinion</a></p>
    </section>

    <section aria-labelledby="giving-title" className="border-t border-border pt-6">
      <div className="mb-5 flex items-center gap-3"><HeartHandshake className="size-6 shrink-0 text-primary" /><h2 id="giving-title" className="font-display text-xl font-bold">Virtual giving practice</h2></div>
      <div className="grid gap-8 lg:grid-cols-2">
        <form className="space-y-4" onSubmit={e => {
          e.preventDefault();
          const expense = givingExpense(kind, Number(amount), stats.remaining, recipient, date);
          if (!expense) { setNotice("Enter a recipient, date and positive amount within your available virtual balance."); return; }
          addExpense(expense); setAmount(""); setRecipient(""); setNotice("Virtual giving recorded. No real donation was made.");
        }}>
          <fieldset><legend className="mb-2 text-sm font-medium">Giving type</legend><div className="flex flex-wrap gap-2">{(Object.keys(GIVING_LABELS) as GivingKind[]).map(k => <Button key={k} type="button" variant={kind === k ? "default" : "outline"} aria-pressed={kind === k} onClick={() => setKind(k)}>{GIVING_LABELS[k]}</Button>)}</div></fieldset>
          <p className="text-xs text-muted-foreground">Available virtual money: {money(stats.remaining)}. Obligatory giving is recorded under Needs; voluntary sadaqah under Wants (optional spending, not a judgement of its value).</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="giving-amount">Virtual amount (USD)</Label><Input className="mt-2" id="giving-amount" type="number" min="0.01" step="0.01" max={stats.remaining} required value={amount} onChange={e => setAmount(e.target.value)} /></div>
            <div><Label htmlFor="giving-date">Date</Label><Input className="mt-2" id="giving-date" type="date" required value={date} onChange={e => setDate(e.target.value)} /></div>
          </div>
          <div><Label htmlFor="giving-recipient">Practice recipient or cause</Label><Input className="mt-2" id="giving-recipient" required maxLength={120} value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="e.g. An eligible family in need" /></div>
          <Button type="submit" disabled={stats.remaining <= 0}>Record virtual giving</Button>
          <p role="status" className="text-sm text-primary">{notice}</p>
        </form>
        <div>
          <h3 className="mb-3 font-semibold">Your practice records</h3>
          <ul className="divide-y divide-border">{records.map(e => <li key={e.id} className="flex items-start gap-3 py-3">
            <div className="min-w-0 flex-1"><p className="break-words text-sm font-medium">{e.description}</p><p className="text-xs text-muted-foreground">{e.date} · {e.necessity === "need" ? "Obligatory giving practice" : "Voluntary giving practice"}</p></div>
            <span className="shrink-0 text-sm font-bold">{money(e.amount)}</span>
            <Button type="button" variant="ghost" size="icon" aria-label={`Remove giving record for ${e.date}`} onClick={() => removeExpense(e.id)}><Trash2 className="size-4" /></Button>
          </li>)}</ul>
          {!records.length && <p className="text-sm text-muted-foreground">No virtual giving recorded yet.</p>}
          <Button className="mt-4" variant="outline" asChild><Link to="/learn">Zakah lessons</Link></Button>
        </div>
      </div>
    </section>
  </div>;
}