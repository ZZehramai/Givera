


import React, { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { campaigns, formatCurrency, type CampaignCategory, type CampaignStatus } from "../../components/data/mockData";
import { CampaignCard } from "../../components/ui/CampaignCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { inputClass } from "../../components/ui/Field";

type CampaignListProps = {
  category: CampaignCategory;
  eyebrow: string;
  title: string;
  description: string;
};

const filters: {value: CampaignStatus | "all";label: string;}[] = [
{ value: "all", label: "All" },
{ value: "urgent", label: "Urgent" },
{ value: "verified", label: "Verified" },
{ value: "in-review", label: "In review" }];


export function CampaignList({ category, eyebrow, title, description }: CampaignListProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CampaignStatus | "all">("all");

  const list = useMemo(
    () =>
    campaigns.
    filter((c) => c.category === category).
    filter((c) => status === "all" ? true : c.status === status).
    filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.location.toLowerCase().includes(query.toLowerCase())),
    [category, status, query]
  );

  const totalRaised = campaigns.filter((c) => c.category === category).reduce((sum, c) => sum + c.raised, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-[#d8d8d2] bg-white p-4">
          <p className="text-xs font-medium text-[#606660]">Total raised</p>
          <p className="mt-1.5 text-xl font-semibold text-[#1d2522]">{formatCurrency(totalRaised)}</p>
        </div>
        <div className="rounded-md border border-[#d8d8d2] bg-white p-4">
          <p className="text-xs font-medium text-[#606660]">Active campaigns</p>
          <p className="mt-1.5 text-xl font-semibold text-[#1d2522]">{campaigns.filter((c) => c.category === category).length}</p>
        </div>
        <div className="rounded-md border border-[#d8d8d2] bg-white p-4">
          <p className="text-xs font-medium text-[#606660]">Avg. program allocation</p>
          <p className="mt-1.5 text-xl font-semibold text-[#1d2522]">83%</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9d96]" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaigns or locations"
            aria-label="Search campaigns"
            className={`${inputClass} pl-9`} />
          
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {filters.map((f) =>
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            aria-pressed={status === f.value}
            className={`rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e] ${
            status === f.value ? "border-[#16734e] bg-[#f0f8f4] text-[#126240]" : "border-[#cfd1ca] bg-white text-[#4a504a] hover:bg-[#f5f6f3]"}`
            }>
            
              {f.label}
            </button>
          )}
        </div>
      </div>

      {list.length > 0 ?
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) =>
        <CampaignCard key={c.id} campaign={c} />
        )}
        </div> :

      <div className="mt-8 rounded-md border border-dashed border-[#cfd1ca] bg-white p-10 text-center">
          <p className="text-sm font-semibold text-[#1d2522]">No campaigns match your filters</p>
          <p className="mt-1 text-[13px] text-[#6e736d]">Try clearing the search or selecting a different status.</p>
        </div>
      }
    </div>);

}