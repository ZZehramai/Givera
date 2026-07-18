




import React, { useState } from "react";
import { CheckCircle2Icon, PencilLineIcon, EyeIcon } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { DemoNotice } from "../../components/ui/DemoNotice";
import { campaigns, formatCurrency, type CampaignCategory } from "../../components/data/mockData";

type AdminCampaignReviewProps = {
  category: CampaignCategory;
  eyebrow: string;
  title: string;
  description: string;
};

export function AdminCampaignReview({ category, eyebrow, title, description }: AdminCampaignReviewProps) {
  const list = campaigns.filter((c) => c.category === category);
  const [selectedId, setSelectedId] = useState(list[0]?.id);
  const selected = list.find((c) => c.id === selectedId) ?? list[0];
  const progress = selected ? Math.round(selected.raised / selected.goal * 100) : 0;

  return (
    <div>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="overflow-hidden rounded-lg border border-[#d8d8d2] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <thead className="border-b border-[#e3e3de] bg-[#fbfbf9] text-[11px] font-bold uppercase tracking-[0.06em] text-[#777b75]">
                <tr>
                  <th scope="col" className="px-4 py-3">Campaign</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3 text-right">Raised</th>
                  <th scope="col" className="px-4 py-3 text-right">Alloc.</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Select</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeea]">
                {list.map((c) =>
                <tr key={c.id} className={selectedId === c.id ? "bg-[#f0f8f4]" : "hover:bg-[#fafaf8]"}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#1d2522]">{c.name}</p>
                      <p className="text-[11px] text-[#888b84]">{c.reference} · {c.location}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-right font-semibold text-[#1d2522]">{formatCurrency(c.raised)}</td>
                    <td className="px-4 py-3 text-right text-[#5f655e]">{c.allocated}%</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => setSelectedId(c.id)} aria-pressed={selectedId === c.id} className="inline-flex items-center gap-1 rounded-md border border-[#cfd1ca] px-2.5 py-1 text-[12px] font-semibold text-[#2b332e] hover:bg-[#f5f6f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">
                        <EyeIcon className="h-3.5 w-3.5" aria-hidden="true" /> Review
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {selected ?
        <aside className="h-fit rounded-lg border border-[#d8d8d2] bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#1d2522]">Review panel</h2>
              <StatusBadge status={selected.status} />
            </div>
            <p className="mt-3 text-[15px] font-semibold text-[#1d2522]">{selected.name}</p>
            <p className="mt-1 text-[12px] text-[#888b84]">{selected.reference} · Opened {selected.openedDate}</p>
            <p className="mt-3 text-[13px] leading-5 text-[#5f655e]">{selected.summary}</p>

            <dl className="mt-4 divide-y divide-[#eeeeea] border-y border-[#eeeeea] text-[13px]">
              <div className="flex justify-between py-2.5"><dt className="text-[#666b65]">Goal</dt><dd className="font-semibold text-[#1d2522]">{formatCurrency(selected.goal)}</dd></div>
              <div className="flex justify-between py-2.5"><dt className="text-[#666b65]">Raised</dt><dd className="font-semibold text-[#1d2522]">{formatCurrency(selected.raised)}</dd></div>
              <div className="flex justify-between py-2.5"><dt className="text-[#666b65]">Donors</dt><dd className="font-semibold text-[#1d2522]">{selected.donors.toLocaleString()}</dd></div>
            </dl>
            <div className="mt-3"><ProgressBar value={progress} label="Funding progress" /><p className="mt-1.5 text-[11px] text-[#83877f]">{progress}% funded · {selected.allocated}% allocated to programs</p></div>

            <div className="mt-5 flex gap-2">
              <button type="button" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#16734e] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#125f40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]"><CheckCircle2Icon className="h-4 w-4" aria-hidden="true" /> Approve</button>
              <button type="button" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-[#cfd1ca] px-3 py-2 text-[13px] font-semibold text-[#2b332e] hover:bg-[#f5f6f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]"><PencilLineIcon className="h-4 w-4" aria-hidden="true" /> Request revision</button>
            </div>
            <div className="mt-4"><DemoNotice>Review actions are static and do not change campaign records.</DemoNotice></div>
          </aside> :
        null}
      </div>
    </div>);

}