



import React from "react";
import { Link } from "react-router-dom";
import { WalletIcon, HeartIcon, ReceiptTextIcon, ArrowRightIcon } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { campaigns, donorTransactions, formatCurrency } from "../../components/data/mockData";

export function Dashboard() {
  const supported = campaigns.slice(0, 3);
  const recent = donorTransactions.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Welcome back"
        title="Your giving dashboard"
        description="A summary of your contributions, supported campaigns, and available records."
        actions={<Link to="/donate" className="rounded-md bg-[#16734e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#125f40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">New donation</Link>} />
      

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Total contributed" value={formatCurrency(1245)} detail="Lifetime" icon={WalletIcon} trend={{ direction: "up", value: "+18%" }} />
        <StatCard label="Campaigns supported" value="5" detail="3 active" icon={HeartIcon} />
        <StatCard label="Receipts on file" value="5" detail="All downloadable" icon={ReceiptTextIcon} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-[#d8d8d2] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1d2522]">Campaigns you support</h2>
            <Link to="/disasters" className="text-[13px] font-semibold text-[#16734e] hover:underline">Explore more</Link>
          </div>
          <ul className="mt-4 space-y-4">
            {supported.map((c) => {
              const progress = Math.round(c.raised / c.goal * 100);
              return (
                <li key={c.id} className="border-b border-[#eeeeea] pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold text-[#1d2522]">{c.name}</p>
                    <span className="text-[11px] text-[#888b84]">{progress}% funded</span>
                  </div>
                  <ProgressBar value={progress} label={`${c.name} progress`} className="mt-2" />
                </li>);

            })}
          </ul>
        </section>

        <section className="rounded-lg border border-[#d8d8d2] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1d2522]">Recent contributions</h2>
            <Link to="/history" className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#16734e] hover:underline">History <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" /></Link>
          </div>
          <ul className="mt-4 divide-y divide-[#eeeeea]">
            {recent.map((t) =>
            <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-[13px] font-medium text-[#1d2522]">{t.campaign}</p>
                  <p className="text-[11px] text-[#888b84]">{t.date} · {t.receipt}</p>
                </div>
                <span className="text-[13px] font-semibold text-[#1d2522]">{formatCurrency(t.amount)}</span>
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>);

}