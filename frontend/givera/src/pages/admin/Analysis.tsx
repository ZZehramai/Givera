




import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { BarChart, LineChart, DonutChart } from "../../components/ui/Charts";
import { allocationTrend, monthlyInflow, fundingByCategory, campaigns, formatCurrency } from "../../components/data/mockData";

export function Analysis() {
  const topCampaigns = [...campaigns].sort((a, b) => b.raised - a.raised).slice(0, 5);
  return (
    <div>
      <PageHeader eyebrow="Insights" title="Analysis" description="Allocation trends, funding inflow, and campaign performance across the platform." />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Avg. allocation" value="93.5%" trend={{ direction: "up", value: "+1.1pt" }} />
        <StatCard label="Inflow (Jun)" value="$2.8M" trend={{ direction: "up", value: "+16%" }} />
        <StatCard label="Cost ratio" value="6.5%" trend={{ direction: "down", value: "-0.4pt" }} />
        <StatCard label="Repeat donors" value="41%" trend={{ direction: "up", value: "+3pt" }} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-[#d8d8d2] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#1d2522]">Monthly inflow (USD millions)</h2>
          <div className="mt-4"><BarChart data={monthlyInflow} unit="M" /></div>
        </section>
        <section className="rounded-lg border border-[#d8d8d2] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#1d2522]">Program allocation trend</h2>
          <div className="mt-4"><LineChart data={allocationTrend} /></div>
        </section>
        <section className="rounded-lg border border-[#d8d8d2] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#1d2522]">Funding by category</h2>
          <div className="mt-5"><DonutChart data={fundingByCategory} /></div>
        </section>
        <section className="rounded-lg border border-[#d8d8d2] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#1d2522]">Top campaigns by funds raised</h2>
          <ul className="mt-4 space-y-3">
            {topCampaigns.map((c, i) =>
            <li key={c.id} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-[#f0f8f4] text-[11px] font-bold text-[#126240]">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#1d2522]">{c.name}</span>
                <span className="text-[13px] font-semibold text-[#1d2522]">{formatCurrency(c.raised)}</span>
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>);

}