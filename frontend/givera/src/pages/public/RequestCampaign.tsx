


import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2Icon, SendIcon } from "lucide-react";
import { Field, inputClass } from "../../components/ui/Field";
import { PageHeader } from "../../components/ui/PageHeader";
import { DemoNotice } from "../../components/ui/DemoNotice";

const steps = ["Organization details", "Verification documents", "Public disclosure agreement"];

export function RequestCampaign() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
        <div className="rounded-lg border border-[#a9d5c2] bg-white p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f0f8f4] text-[#16734e]"><CheckCircle2Icon className="h-6 w-6" aria-hidden="true" /></span>
          <h1 className="mt-4 text-xl font-semibold text-[#1d2522]">Request submitted for review</h1>
          <p className="mt-2 text-[14px] text-[#5f655e]">This is a demonstration submission. In a live platform, your campaign request would enter the verification queue for administrative review.</p>
          <Link to="/" className="mt-6 inline-block rounded-md bg-[#16734e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#125f40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">Return home</Link>
        </div>
      </div>);

  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader eyebrow="Campaign intake" title="Request a campaign" description="Submit your cause for verification. Approved campaigns are published with mandatory public disclosure of funds and allocation." />

      <ol className="mt-5 flex flex-wrap gap-3">
        {steps.map((step, i) =>
        <li key={step} className="inline-flex items-center gap-2 rounded-md border border-[#d8d8d2] bg-white px-3 py-1.5 text-[12px] font-medium text-[#4a504a]">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[#f0f8f4] text-[11px] font-bold text-[#126240]">{i + 1}</span>
            {step}
          </li>
        )}
      </ol>

      <form
        className="mt-6 rounded-lg border border-[#d8d8d2] bg-white p-6"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Campaign name" htmlFor="cname" className="sm:col-span-2"><input id="cname" required className={inputClass} placeholder="e.g. Monsoon Relief Coalition" /></Field>
          <Field label="Organization" htmlFor="org"><input id="org" required className={inputClass} placeholder="Registered organization" /></Field>
          <Field label="Category" htmlFor="cat">
            <select id="cat" className={inputClass} defaultValue="disaster">
              <option value="disaster">Natural disaster</option>
              <option value="underprivileged">Underprivileged</option>
            </select>
          </Field>
          <Field label="Location" htmlFor="loc"><input id="loc" required className={inputClass} placeholder="Region, country" /></Field>
          <Field label="Funding goal (USD)" htmlFor="goal"><input id="goal" inputMode="numeric" required className={inputClass} placeholder="150000" /></Field>
          <Field label="Registration / tax ID" htmlFor="taxid" className="sm:col-span-2"><input id="taxid" required className={inputClass} placeholder="Organization identifier" /></Field>
          <Field label="Campaign summary" htmlFor="summary" hint="Describe the need, the plan, and how funds will be allocated." className="sm:col-span-2">
            <textarea id="summary" required rows={4} className={inputClass} placeholder="Describe your campaign and its intended impact" />
          </Field>
        </div>

        <label className="mt-5 flex items-start gap-2.5 text-[13px] text-[#4a504a]">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-[#cfd1ca] text-[#16734e] focus:ring-[#16734e]" />
          I agree to publish full financial disclosures and submit to independent audit for this campaign.
        </label>

        <div className="mt-5">
          <DemoNotice>This intake form is static. Submissions are not stored or sent for review in this prototype.</DemoNotice>
        </div>

        <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#16734e] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#125f40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">
          <SendIcon className="h-4 w-4" aria-hidden="true" /> Submit for review
        </button>
      </form>
    </div>);

}