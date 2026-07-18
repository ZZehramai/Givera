


import React from "react";
import { Link } from "react-router-dom";
import { ArrowRightIcon, ShieldCheckIcon, FileTextIcon, ScaleIcon, DatabaseIcon } from "lucide-react";
import { campaigns } from "../../components/data/mockData";
import { CampaignCard } from "../../components/ui/CampaignCard";

const trustPoints = [
{ icon: ScaleIcon, title: "Independently audited", text: "Every campaign is verified and its fund allocation is reviewed against published records." },
{ icon: DatabaseIcon, title: "Open by default", text: "Financials, allocation ratios, and disclosures are public and downloadable at any time." },
{ icon: FileTextIcon, title: "Documented outcomes", text: "Annual reports and receipts trace contributions from intake through program delivery." }];


export function Landing() {
  const featured = campaigns.slice(0, 3);
  return (
    <div className="w-full">
      <section className="border-b border-[#d8d8d2] bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded border border-[#a9d5c2] bg-[#f0f8f4] px-2.5 py-1 text-[11px] font-semibold text-[#126240]">
              <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" /> Transparency-first charity platform
            </span>
            <h1 className="mt-5 text-[34px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#1d2522] sm:text-[44px]">
              Giving that can be verified, line by line.
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-6 text-[#5f655e]">
              Givera publishes where every contribution goes — with open financials, independent audits, and public annual reports for disaster relief and underprivileged communities.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/donate" className="inline-flex items-center gap-2 rounded-md bg-[#16734e] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#125f40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">
                Donate now <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/transparency" className="inline-flex items-center gap-2 rounded-md border border-[#cfd1ca] px-5 py-2.5 text-sm font-semibold text-[#2b332e] transition-colors hover:bg-[#f5f6f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">
                View the record
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 self-center">
            <Stat label="Funds tracked" value="$12.8M" detail="Across 48 campaigns" wide />
            <Stat label="Allocated to programs" value="94.2%" />
            <Stat label="Verified campaigns" value="48" />
            <Stat label="Public disclosures" value="5 yrs" detail="Downloadable annual reports" wide />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.title} className="rounded-md border border-[#d8d8d2] bg-white p-5">
                <span className="grid h-9 w-9 place-items-center rounded bg-[#f0f8f4] text-[#16734e]"><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
                <h3 className="mt-3 text-sm font-semibold text-[#1d2522]">{point.title}</h3>
                <p className="mt-1.5 text-[13px] leading-5 text-[#5f655e]">{point.text}</p>
              </div>);

          })}
        </div>
      </section>

      <section className="border-t border-[#d8d8d2] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#6e736d]">Active campaigns</p>
              <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-[#1d2522]">Verified causes in need of support</h2>
            </div>
            <Link to="/disasters" className="hidden shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[#16734e] hover:underline sm:inline-flex">
              Browse all <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) =>
            <CampaignCard key={c.id} campaign={c} />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-lg border border-[#d8d8d2] bg-[#173d32] p-8 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">Running a cause that needs funding?</h2>
            <p className="mt-2 max-w-lg text-[14px] text-[#c3d6cd]">Submit a campaign request for review. Verified campaigns are published with full public disclosure requirements.</p>
          </div>
          <Link to="/request-campaign" className="inline-flex shrink-0 items-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-[#173d32] transition-colors hover:bg-[#eef5f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            Request a campaign <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>);

}

function Stat({ label, value, detail, wide }: {label: string;value: string;detail?: string;wide?: boolean;}) {
  return (
    <div className={`rounded-md border border-[#d8d8d2] bg-[#fbfbf9] p-4 ${wide ? "col-span-2" : ""}`}>
      <p className="text-xs font-medium text-[#606660]">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tracking-[-0.025em] text-[#1d2522]">{value}</p>
      {detail ? <p className="mt-0.5 text-[11px] text-[#888b84]">{detail}</p> : null}
    </div>);

}