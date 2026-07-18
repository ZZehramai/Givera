
import React from "react";
import { InfoIcon } from "lucide-react";

export function DemoNotice({ children }: {children: React.ReactNode;}) {
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-[#c9dbe8] bg-[#eff5f9] px-3.5 py-2.5 text-[13px] text-[#39536a]">
      <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{children}</p>
    </div>);

}