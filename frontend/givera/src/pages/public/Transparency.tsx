


import React from "react";
import { ReportArchive } from "../../components/ReportArchive";

export function Transparency() {
  return (
    <div className="w-full">
      <div className="border-b border-[#d8d8d2] bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#6e736d]">Public accountability</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-[#1d2522]">Transparency archive</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#5f655e]">Browse Givera’s published annual reports, financial statements, and independent audit records. All disclosures are public and downloadable.</p>
        </div>
      </div>
      <ReportArchive />
    </div>);

}