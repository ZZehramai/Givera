import React from "react";
import { ArchiveIcon, CheckCircle2Icon, XIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { AnnualReport } from "./reportData";

type ReportIndexProps = {
  reports: AnnualReport[];
  selectedId: string;
  onSelect: (report: AnnualReport) => void;
  onClose?: () => void;
  mobile?: boolean;
};

export function ReportIndex({ reports, selectedId, onSelect, onClose, mobile = false }: ReportIndexProps) {
  return (
    <aside
      aria-label="Annual report archive"
      className="flex h-full w-80 shrink-0 flex-col border-r border-[#d8d8d2] bg-white">
      
      <div className="border-b border-[#d8d8d2] bg-[#fbfbf9] px-4 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#676762]">Public accountability</p>
            <h2 className="mt-1 text-sm font-semibold text-[#1e2624]">Annual reports</h2>
          </div>
          {mobile ?
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 rounded p-1.5 text-[#5f6560] transition-colors hover:bg-[#eef0ec] hover:text-[#1e2624] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]"
            aria-label="Close report archive">
            
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button> :
          null}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-[#686d68]">
          <ArchiveIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{reports.length} published disclosures</span>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto py-2" aria-label="Published annual reports">
        {reports.map((report) => {
          const isSelected = selectedId === report.id;
          return (
            <button
              key={report.id}
              type="button"
              onClick={() => onSelect(report)}
              aria-current={isSelected ? "page" : undefined}
              className={`relative block w-full border-b border-[#eeeeea] px-4 py-3 text-left transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#16734e] ${
              isSelected ? "bg-[#f0f8f4]" : "bg-white hover:bg-[#fafaf8]"}`
              }>
              
              {isSelected ?
              <motion.span
                layoutId="selected-report-mark"
                transition={{ type: "spring", stiffness: 520, damping: 40 }}
                className="absolute inset-y-0 left-0 w-[3px] bg-[#16734e]" /> :

              null}
              <span className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#686d68]">{report.year}</span>
              <span className="mt-0.5 block text-[13px] font-semibold text-[#202724]">{report.title}</span>
              <span className="mt-1 block text-[11px] text-[#858882]">Published {report.publishedDate.replace(", ", " ")}</span>
              {isSelected ?
              <span className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-[#16734e]">
                  <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  Selected record
                </span> :
              null}
            </button>);

        })}
      </nav>

      <div className="border-t border-[#d8d8d2] bg-[#fbfbf9] px-4 py-3">
        <p className="text-[11px] leading-4 text-[#747871]">Records are retained in accordance with Givera’s public disclosure policy.</p>
      </div>
    </aside>);

}