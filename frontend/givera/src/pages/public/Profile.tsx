



import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Field, inputClass } from "../../components/ui/Field";
import { DemoNotice } from "../../components/ui/DemoNotice";

export function Profile() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader eyebrow="Account" title="Profile & preferences" description="Manage your donor identity, contact details, and giving preferences." />

      <div className="mt-6 flex items-center gap-4 rounded-lg border border-[#d8d8d2] bg-white p-5">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[#173d32] text-lg font-semibold text-white">AO</span>
        <div>
          <p className="text-[15px] font-semibold text-[#1d2522]">Amara Okafor</p>
          <p className="text-[13px] text-[#5f655e]">amara.okafor@example.com · Verified donor since Jan 2025</p>
        </div>
      </div>

      <form className="mt-6 rounded-lg border border-[#d8d8d2] bg-white p-6" onSubmit={(e) => e.preventDefault()}>
        <h2 className="text-sm font-semibold text-[#1d2522]">Personal information</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="p-fn"><input id="p-fn" defaultValue="Amara" className={inputClass} /></Field>
          <Field label="Last name" htmlFor="p-ln"><input id="p-ln" defaultValue="Okafor" className={inputClass} /></Field>
          <Field label="Email" htmlFor="p-email" className="sm:col-span-2"><input id="p-email" type="email" defaultValue="amara.okafor@example.com" className={inputClass} /></Field>
          <Field label="Country" htmlFor="p-country"><input id="p-country" defaultValue="United States" className={inputClass} /></Field>
          <Field label="Preferred cause" htmlFor="p-cause">
            <select id="p-cause" className={inputClass} defaultValue="disaster">
              <option value="disaster">Natural disasters</option>
              <option value="underprivileged">Underprivileged</option>
              <option value="both">Both</option>
            </select>
          </Field>
        </div>

        <h2 className="mt-6 border-t border-[#eeeeea] pt-6 text-sm font-semibold text-[#1d2522]">Communication preferences</h2>
        <div className="mt-3 space-y-2">
          {["Allocation and disclosure updates", "Campaign milestones", "Receipts and tax summaries"].map((label, i) =>
          <label key={label} className="flex items-center gap-2.5 text-[13px] text-[#4a504a]">
              <input type="checkbox" defaultChecked={i < 2} className="h-4 w-4 rounded border-[#cfd1ca] text-[#16734e] focus:ring-[#16734e]" /> {label}
            </label>
          )}
        </div>

        <div className="mt-5"><DemoNotice>Profile changes are not saved in this prototype.</DemoNotice></div>

        <div className="mt-5 flex gap-2">
          <button type="submit" className="rounded-md bg-[#16734e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#125f40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">Save changes</button>
          <button type="reset" className="rounded-md border border-[#cfd1ca] px-4 py-2 text-sm font-semibold text-[#2b332e] hover:bg-[#f5f6f3]">Reset</button>
        </div>
      </form>
    </div>);

}