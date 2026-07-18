




import React from "react";
import { ShieldCheckIcon } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { Field, inputClass } from "../../components/ui/Field";
import { DemoNotice } from "../../components/ui/DemoNotice";

const access = ["Campaign review & approval", "Public disclosure publishing", "User management", "Analytics & exports"];

export function AdminProfile() {
  return (
    <div>
      <PageHeader eyebrow="Account" title="Administrator profile" description="Your identity, access scope, and operational preferences." />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <form className="rounded-lg border border-[#d8d8d2] bg-white p-6" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-[#173d32] text-lg font-semibold text-white">LF</span>
            <div>
              <p className="text-[15px] font-semibold text-[#1d2522]">Lena Fischer</p>
              <p className="text-[13px] text-[#5f655e]">Program administrator · Since Nov 2024</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="ap-name"><input id="ap-name" defaultValue="Lena Fischer" className={inputClass} /></Field>
            <Field label="Staff email" htmlFor="ap-email"><input id="ap-email" type="email" defaultValue="lena.f@givera.org" className={inputClass} /></Field>
            <Field label="Department" htmlFor="ap-dept"><input id="ap-dept" defaultValue="Programs & Compliance" className={inputClass} /></Field>
            <Field label="Time zone" htmlFor="ap-tz"><input id="ap-tz" defaultValue="UTC−05:00" className={inputClass} /></Field>
          </div>

          <div className="mt-5"><DemoNotice>Profile changes are not saved in this prototype.</DemoNotice></div>
          <button type="submit" className="mt-5 rounded-md bg-[#16734e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#125f40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">Save changes</button>
        </form>

        <aside className="h-fit rounded-lg border border-[#d8d8d2] bg-white p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1d2522]"><ShieldCheckIcon className="h-4 w-4 text-[#16734e]" aria-hidden="true" /> Access scope</h2>
          <ul className="mt-4 space-y-2.5">
            {access.map((a) =>
            <li key={a} className="flex items-center gap-2 text-[13px] text-[#4a504a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16734e]" aria-hidden="true" /> {a}
              </li>
            )}
          </ul>
        </aside>
      </div>
    </div>);

}