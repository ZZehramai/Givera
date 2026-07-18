
import React from "react";
import { CheckCircle2Icon, ClockIcon, AlertTriangleIcon, CircleDotIcon } from "lucide-react";
import type { CampaignStatus } from "../data/mockData";
import { statusLabels } from "../data/mockData";

const styles: Record<CampaignStatus, string> = {
  verified: "border-[#a9d5c2] bg-[#f0f8f4] text-[#126240]",
  "in-review": "border-[#d8d8d2] bg-[#f6f6f3] text-[#6b706a]",
  urgent: "border-[#e6c3ac] bg-[#fbf1e9] text-[#a35a1f]",
  completed: "border-[#c2ccd6] bg-[#eef2f6] text-[#3d5670]"
};

const icons: Record<CampaignStatus, typeof CheckCircle2Icon> = {
  verified: CheckCircle2Icon,
  "in-review": ClockIcon,
  urgent: AlertTriangleIcon,
  completed: CircleDotIcon
};

export function StatusBadge({ status }: {status: CampaignStatus;}) {
  const Icon = icons[status];
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-semibold ${styles[status]}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {statusLabels[status]}
    </span>);

}