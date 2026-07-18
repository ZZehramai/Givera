import React, { useEffect, useRef, useState } from "react";
import { FileStackIcon, MenuIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ReportIndex } from "./ReportIndex";
import { ReportPreview } from "./ReportPreview";
import { annualReports, type AnnualReport } from "./reportData";

export function ReportArchive() {
  const [selectedReport, setSelectedReport] = useState<AnnualReport>(annualReports[0]);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const archiveTriggerRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeArchive();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function closeArchive() {
    setIsArchiveOpen(false);
    window.setTimeout(() => archiveTriggerRef.current?.focus(), 0);
  }

  function selectReport(report: AnnualReport) {
    setSelectedReport(report);
    closeArchive();
  }

  return (
    <div className="min-h-screen w-full bg-[#f5f5f3] text-[#1d2522]">
      <header className="flex h-14 items-center justify-between border-b border-[#d8d8d2] bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded bg-[#173d32] text-white"><FileStackIcon className="h-4 w-4" aria-hidden="true" /></span>
          <span className="text-sm font-semibold tracking-[-0.01em]">Givera</span>
        </div>
        <button
          ref={archiveTriggerRef}
          type="button"
          onClick={() => setIsArchiveOpen(true)}
          aria-expanded={isArchiveOpen}
          aria-controls="mobile-report-archive"
          className="inline-flex items-center gap-2 rounded border border-[#cfd1ca] bg-white px-3 py-1.5 text-xs font-semibold text-[#27302c] shadow-sm transition-colors hover:bg-[#f5f6f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">
          
          <MenuIcon className="h-4 w-4" aria-hidden="true" />
          Archive
        </button>
      </header>

      <div className="h-[calc(100vh-3.5rem)] min-h-[620px] lg:h-screen lg:min-h-[680px]">
        <div className="hidden h-full lg:flex">
          <ReportIndex reports={annualReports} selectedId={selectedReport.id} onSelect={selectReport} />
          <ReportPreview report={selectedReport} />
        </div>
        <div className="h-full lg:hidden">
          <ReportPreview report={selectedReport} />
        </div>
      </div>

      <AnimatePresence>
        {isArchiveOpen ?
        <motion.div
          className="fixed inset-0 z-50 lg:hidden"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}>
          
            <button type="button" className="absolute inset-0 cursor-default bg-[#17201d]/25" onClick={closeArchive} aria-label="Close report archive" />
            <motion.div
            id="mobile-report-archive"
            role="dialog"
            aria-modal="true"
            aria-label="Annual report archive"
            className="relative h-full w-[min(20rem,88vw)] shadow-2xl"
            initial={shouldReduceMotion ? false : { x: -24 }}
            animate={{ x: 0 }}
            exit={{ x: -24 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}>
            
              <ReportIndex reports={annualReports} selectedId={selectedReport.id} onSelect={selectReport} onClose={closeArchive} mobile />
            </motion.div>
          </motion.div> :
        null}
      </AnimatePresence>
    </div>);

}