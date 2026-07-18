



import React from "react";
import { DownloadIcon } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { donorTransactions, formatCurrency } from "../../components/data/mockData";

const statusStyles: Record<string, string> = {
  settled: "border-[#a9d5c2] bg-[#f0f8f4] text-[#126240]",
  processing: "border-[#d8d8d2] bg-[#f6f6f3] text-[#6b706a]",
  refunded: "border-[#c2ccd6] bg-[#eef2f6] text-[#3d5670]"
};

export function History() {
  const total = donorTransactions.filter((t) => t.status !== "refunded").reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Your records"
        title="Contribution history"
        description="A complete ledger of your gifts, methods, and downloadable receipts."
        actions={<button type="button" className="inline-flex items-center gap-2 rounded-md border border-[#cfd1ca] px-4 py-2 text-sm font-semibold text-[#2b332e] hover:bg-[#f5f6f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]"><DownloadIcon className="h-4 w-4" aria-hidden="true" /> Export CSV</button>} />
      

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="rounded-md border border-[#d8d8d2] bg-white px-4 py-3"><p className="text-xs text-[#606660]">Total given</p><p className="text-lg font-semibold text-[#1d2522]">{formatCurrency(total)}</p></div>
        <div className="rounded-md border border-[#d8d8d2] bg-white px-4 py-3"><p className="text-xs text-[#606660]">Transactions</p><p className="text-lg font-semibold text-[#1d2522]">{donorTransactions.length}</p></div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-[#d8d8d2] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead className="border-b border-[#e3e3de] bg-[#fbfbf9] text-[11px] font-bold uppercase tracking-[0.06em] text-[#777b75]">
              <tr>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3">Campaign</th>
                <th scope="col" className="px-4 py-3">Method</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3 text-right">Amount</th>
                <th scope="col" className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeea]">
              {donorTransactions.map((t) =>
              <tr key={t.id} className="hover:bg-[#fafaf8]">
                  <td className="px-4 py-3 text-[#5f655e]">{t.date}</td>
                  <td className="px-4 py-3 font-medium text-[#1d2522]">{t.campaign}</td>
                  <td className="px-4 py-3 text-[#5f655e]">{t.method}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold capitalize ${statusStyles[t.status]}`}>{t.status}</span></td>
                  <td className="px-4 py-3 text-right font-semibold text-[#1d2522]">{formatCurrency(t.amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#16734e] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">
                      <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" /> {t.receipt}
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}