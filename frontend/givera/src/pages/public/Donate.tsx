


import React, { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2Icon, LockIcon, ShieldCheckIcon } from "lucide-react";
import { campaigns, formatCurrency } from "../../components/data/mockData";
import { Field, inputClass } from "../../components/ui/Field";
import { DemoNotice } from "../../components/ui/DemoNotice";

const amounts = [50, 100, 250, 500];

export function Donate() {
  const [params] = useSearchParams();
  const slug = params.get("campaign");
  const campaign = campaigns.find((c) => c.slug === slug) ?? campaigns[0];
  const [amount, setAmount] = useState<number>(100);
  const [custom, setCustom] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const effectiveAmount = custom ? Number(custom) || 0 : amount;

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
        <div className="rounded-lg border border-[#a9d5c2] bg-white p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f0f8f4] text-[#16734e]"><CheckCircle2Icon className="h-6 w-6" aria-hidden="true" /></span>
          <h1 className="mt-4 text-xl font-semibold text-[#1d2522]">Contribution recorded</h1>
          <p className="mt-2 text-[14px] text-[#5f655e]">This is a demonstration confirmation for a {formatCurrency(effectiveAmount)} gift to {campaign.name}. A receipt would normally be issued and logged to the public ledger.</p>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/history" className="rounded-md bg-[#16734e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#125f40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">View history</Link>
            <button type="button" onClick={() => setSubmitted(false)} className="rounded-md border border-[#cfd1ca] px-4 py-2 text-sm font-semibold text-[#2b332e] hover:bg-[#f5f6f3]">Make another gift</button>
          </div>
        </div>
      </div>);

  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form
          className="rounded-lg border border-[#d8d8d2] bg-white p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}>
          
          <p className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#6e736d]">Make a donation</p>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-[#1d2522]">Support {campaign.name}</h1>

          <div className="mt-5">
            <span className="mb-2 block text-[13px] font-medium text-[#2b332e]">Amount</span>
            <div className="grid grid-cols-4 gap-2">
              {amounts.map((a) =>
              <button
                key={a}
                type="button"
                onClick={() => {setAmount(a);setCustom("");}}
                aria-pressed={!custom && amount === a}
                className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e] ${
                !custom && amount === a ? "border-[#16734e] bg-[#f0f8f4] text-[#126240]" : "border-[#cfd1ca] bg-white text-[#2b332e] hover:bg-[#f5f6f3]"}`
                }>
                
                  {formatCurrency(a)}
                </button>
              )}
            </div>
            <div className="mt-3">
              <Field label="Custom amount" htmlFor="custom-amount">
                <input id="custom-amount" inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))} placeholder="Enter an amount" className={inputClass} />
              </Field>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t border-[#eeeeea] pt-6 sm:grid-cols-2">
            <Field label="Full name" htmlFor="name"><input id="name" required className={inputClass} placeholder="Your name" /></Field>
            <Field label="Email" htmlFor="email"><input id="email" type="email" required className={inputClass} placeholder="you@example.com" /></Field>
            <Field label="Card number" htmlFor="card" className="sm:col-span-2"><input id="card" inputMode="numeric" required className={inputClass} placeholder="1234 5678 9012 3456" /></Field>
            <Field label="Expiry" htmlFor="expiry"><input id="expiry" required className={inputClass} placeholder="MM / YY" /></Field>
            <Field label="CVC" htmlFor="cvc"><input id="cvc" inputMode="numeric" required className={inputClass} placeholder="123" /></Field>
          </div>

          <div className="mt-5">
            <DemoNotice>Payment processing is disabled in this prototype. Submitting shows a demonstration confirmation only.</DemoNotice>
          </div>

          <button type="submit" className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-[#16734e] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#125f40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">
            <LockIcon className="h-4 w-4" aria-hidden="true" /> Give {formatCurrency(effectiveAmount)}
          </button>
        </form>

        <aside className="h-fit rounded-lg border border-[#d8d8d2] bg-[#fbfbf9] p-6">
          <h2 className="text-sm font-semibold text-[#1d2522]">Allocation review</h2>
          <dl className="mt-4 space-y-3 text-[13px]">
            <div className="flex justify-between"><dt className="text-[#666b65]">Campaign</dt><dd className="font-semibold text-[#1d2522]">{campaign.reference}</dd></div>
            <div className="flex justify-between"><dt className="text-[#666b65]">Program allocation</dt><dd className="font-semibold text-[#1d2522]">{campaign.allocated}%</dd></div>
            <div className="flex justify-between"><dt className="text-[#666b65]">Your contribution</dt><dd className="font-semibold text-[#1d2522]">{formatCurrency(effectiveAmount)}</dd></div>
            <div className="flex justify-between border-t border-[#e3e3de] pt-3"><dt className="text-[#666b65]">To programs (est.)</dt><dd className="font-semibold text-[#126240]">{formatCurrency(Math.round(effectiveAmount * (campaign.allocated / 100)))}</dd></div>
          </dl>
          <div className="mt-5 flex items-center gap-2 rounded-md border border-[#a9d5c2] bg-[#f0f8f4] px-3 py-2 text-[12px] font-semibold text-[#126240]">
            <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" /> Verified campaign · audit on record
          </div>
          <p className="mt-4 text-[11px] leading-4 text-[#83877f]">Allocation percentages reflect published records. Every gift is traceable in the public transparency archive.</p>
        </aside>
      </div>
    </div>);

}