




import React from "react";
import { Link } from "react-router-dom";
import { WalletIcon, ClipboardListIcon, ShieldCheckIcon, UsersIcon, ArrowRightIcon } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { LineChart } from "../../components/ui/Charts";
import { reviewQueue, allocationTrend, formatCurrency } from "../../components/data/mockData";

export function AdminDashboard() {
  const pending = reviewQueue.filter((r) => r.state !== "Approved");
  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Operations dashboard"
        description="Organizational health, pending reviews, and allocation performance."
        actions={<Link to="/admin/analysis" className="rounded-md border border-[#cfd1ca] px-4 py-2 text-sm font-semibold text-[#2b332e] hover:bg-[#f5f6f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">View analysis</Link>} />
      

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Funds tracked (YTD)" value={formatCurrency(12800000)} icon={WalletIcon} trend={{ direction: "up", value: "+11%" }} />
        <StatCard label="Program allocation" value="94.2%" icon={ShieldCheckIcon} trend={{ direction: "up", value: "+0.6pt" }} />
        <StatCard label="Pending reviews" value={String(pending.length)} icon={ClipboardListIcon} detail="Awaiting action" />
        <StatCard label="Active donors" value="8,412" icon={UsersIcon} trend={{ direction: "up", value: "+240" }} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="rounded-lg border border-[#d8d8d2] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1d2522]">Campaigns awaiting review</h2>
            <Link to="/admin/disasters" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#16734e] hover:underline">Review queue <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" /></Link>
          </div>
          <ul className="mt-4 divide-y divide-[#eeeeea]">
            {pending.map((r) =>
            <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-[#1d2522]">{r.campaign}</p>
                  <p className="text-[11px] text-[#888b84]">{r.requester} · {r.submitted}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-[#1d2522]">{formatCurrency(r.requested)}</p>
                  <span className={`text-[11px] font-semibold ${r.state === "Needs revision" ? "text-[#a35a1f]" : "text-[#6b706a]"}`}>{r.state}</span>
                </div>
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-lg border border-[#d8d8d2] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#1d2522]">Program allocation trend</h2>
          <p className="mt-1 text-[12px] text-[#83877f]">Share of funds allocated directly to programs.</p>
          <div className="mt-4"><LineChart data={allocationTrend} /></div>
        </section>
      </div>
    </div>);

}