import React, { useEffect, useState } from "react";
import { CheckCircle2Icon, DownloadIcon, FileCheck2Icon, FileTextIcon, LoaderCircleIcon, ShieldCheckIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { AnnualReport, DocumentFile } from "./reportData";

type ReportPreviewProps = {
  report: AnnualReport;
};

type DownloadState = "idle" | "downloading" | "complete";

export function ReportPreview({ report }: ReportPreviewProps) {
  const [downloadState, setDownloadState] = useState<Record<string, DownloadState>>({});
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setDownloadState({});
  }, [report.id]);

  function handleDownload(document: DocumentFile) {
    setDownloadState((current) => ({ ...current, [document.id]: "downloading" }));

    window.setTimeout(() => {
      const fileBody = `Givera public record\nDocument: ${document.label}\nReporting period: ${report.fiscalYear}\nPublished: ${report.publishedDate}\n\nThis is a demonstration download record.`;
      const blob = new Blob([fileBody], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = documentCreateLink(url, document.fileName.replace(".pdf", ".txt"));
      link.click();
      URL.revokeObjectURL(url);

      setDownloadState((current) => ({ ...current, [document.id]: "complete" }));
      window.setTimeout(() => {
        setDownloadState((current) => ({ ...current, [document.id]: "idle" }));
      }, 2600);
    }, 360);
  }

  const allocation = Number.parseFloat(report.programAllocation);
  const campaignAllocation = Number.parseFloat(report.campaignAllocation);

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#fbfbf9]" aria-labelledby="report-title">
      <header className="border-b border-[#d8d8d2] bg-white px-5 py-5 sm:px-8 sm:py-6">
        <div className="flex max-w-4xl items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.11em] text-[#6e736d]">Public filing / Annual disclosure</p>
            <h1 id="report-title" className="text-[22px] font-semibold tracking-[-0.02em] text-[#1d2522] sm:text-2xl">
              {report.year} {report.title}
            </h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#666c66]">
              <span>Published {report.publishedDate}</span>
              <span className="hidden text-[#c8cbc5] sm:inline" aria-hidden="true">•</span>
              <span>{report.fiscalYear}</span>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-1.5 rounded border border-[#a9d5c2] bg-[#f0f8f4] px-2.5 py-1.5 text-[11px] font-semibold text-[#126240] sm:flex">
            <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
            Verified filing
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={report.id}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-4xl space-y-8 px-5 py-7 sm:px-8 sm:py-8">
            
            <section aria-labelledby="financial-overview-heading">
              <div className="mb-3 flex items-center gap-3">
                <h2 id="financial-overview-heading" className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#777b75]">Financial overview</h2>
                <span className="h-px flex-1 bg-[#dfdfda]" aria-hidden="true" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-[#d8d8d2] bg-white p-4">
                  <p className="text-xs font-medium text-[#606660]">Total funds tracked</p>
                  <p className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[#1d2522]">{report.totalFunds}</p>
                  <p className="mt-1 text-xs text-[#888b84]">{report.allocationDetail}</p>
                </div>
                <div className="rounded-md border border-[#d8d8d2] bg-white p-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-xs font-medium text-[#606660]">Allocated to programs</p>
                    <p className="text-xl font-semibold tracking-[-0.02em] text-[#1d2522]">{report.programAllocation}</p>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e8e9e4]" role="progressbar" aria-label="Funds allocated to programs" aria-valuemin={0} aria-valuemax={100} aria-valuenow={allocation}>
                    <motion.div
                      className="h-full rounded-full bg-[#16734e]"
                      initial={shouldReduceMotion ? false : { scaleX: 0 }}
                      animate={{ scaleX: allocation / 100 }}
                      transition={{ duration: 0.45, delay: 0.07, ease: [0.25, 1, 0.5, 1] }}
                      style={{ transformOrigin: "left" }} />
                    
                  </div>
                  <p className="mt-2 text-xs text-[#888b84]">Direct program allocation; independently reviewed.</p>
                </div>
              </div>
            </section>

            <section aria-labelledby="featured-campaign-heading">
              <div className="mb-3 flex items-center gap-3">
                <h2 id="featured-campaign-heading" className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#777b75]">Featured campaign record</h2>
                <span className="h-px flex-1 bg-[#dfdfda]" aria-hidden="true" />
              </div>
              <article className="rounded-md border border-[#d8d8d2] bg-white p-5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1d2522]">{report.campaignName}</h3>
                    <p className="mt-1 text-xs text-[#777c76]">A documented campaign sample from this reporting period.</p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-1.5 rounded border border-[#a9d5c2] bg-[#f0f8f4] px-2 py-1 text-[11px] font-semibold text-[#126240]">
                    <FileCheck2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    Record reviewed
                  </span>
                </div>
                <dl className="mt-5 divide-y divide-[#ecece8] border-y border-[#ecece8] text-[13px]">
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-[#666b65]">Funds received</dt>
                    <dd className="font-semibold text-[#1d2522]">{report.campaignFunds}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-[#666b65]">Allocated to programs</dt>
                    <dd className="font-semibold text-[#1d2522]">{report.campaignAllocation}</dd>
                  </div>
                </dl>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#e8e9e4]" role="progressbar" aria-label="Campaign funds allocated to programs" aria-valuemin={0} aria-valuemax={100} aria-valuenow={campaignAllocation}>
                  <motion.div
                    className="h-full rounded-full bg-[#16734e]"
                    initial={shouldReduceMotion ? false : { scaleX: 0 }}
                    animate={{ scaleX: campaignAllocation / 100 }}
                    transition={{ duration: 0.45, delay: 0.12, ease: [0.25, 1, 0.5, 1] }}
                    style={{ transformOrigin: "left" }} />
                  
                </div>
                <div className="mt-4 inline-flex items-center gap-2 rounded border border-[#a9d5c2] bg-[#f0f8f4] px-2.5 py-1.5 text-[11px] font-semibold text-[#126240]">
                  <CheckCircle2Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {report.auditReference}
                </div>
              </article>
            </section>

            <section aria-labelledby="documentation-heading" className="pb-4">
              <div className="mb-3 flex items-center gap-3">
                <h2 id="documentation-heading" className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#777b75]">Documentation</h2>
                <span className="h-px flex-1 bg-[#dfdfda]" aria-hidden="true" />
              </div>
              <div className="divide-y divide-[#deded9] overflow-hidden rounded-md border border-[#d8d8d2] bg-white">
                {report.documents.map((document) => {
                  const state = downloadState[document.id] ?? "idle";
                  return (
                    <button
                      key={document.id}
                      type="button"
                      onClick={() => handleDownload(document)}
                      disabled={state === "downloading"}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-[#fafaf8] focus-visible:relative focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#16734e] disabled:cursor-wait">
                      
                      <span className="flex min-w-0 items-center gap-3">
                        <FileTextIcon className="h-4 w-4 shrink-0 text-[#606660]" aria-hidden="true" />
                        <span className="min-w-0">
                          <span className="block text-[13px] font-medium text-[#202724]">{document.label}</span>
                          <span className="mt-0.5 block text-[11px] text-[#858882]">{document.format} · {document.size}</span>
                        </span>
                      </span>
                      <span className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold ${state === "complete" ? "text-[#126240]" : "text-[#1b6f4c]"}`} aria-live="polite">
                        {state === "downloading" ? <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden="true" /> : state === "complete" ? <CheckCircle2Icon className="h-4 w-4" aria-hidden="true" /> : <DownloadIcon className="h-4 w-4" aria-hidden="true" />}
                        <span>{state === "downloading" ? "Preparing" : state === "complete" ? "Downloaded" : "Download"}</span>
                      </span>
                    </button>);

                })}
              </div>
              <p className="mt-3 text-[11px] leading-4 text-[#777c76]">Downloads are public records. Generated files are available for review and archival use.</p>
            </section>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>);

}

function documentCreateLink(url: string, downloadName: string) {
  const link = window.document.createElement("a");
  link.href = url;
  link.download = downloadName;
  link.style.display = "none";
  window.document.body.appendChild(link);
  window.setTimeout(() => link.remove(), 0);
  return link;
}