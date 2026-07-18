import React from "react";
import { TrendingUpIcon, TrendingDownIcon, BoxIcon } from "lucide-react";
type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  icon?: BoxIcon;
  trend?: {
    direction: "up" | "down";
    value: string;
  };
};
export function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  trend
}: StatCardProps) {
  return <div className="rounded-md border border-[#d8d8d2] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-[#606660]">{label}</p>
        {Icon ? <Icon className="h-4 w-4 text-[#8a8f88]" aria-hidden="true" /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[#1d2522]">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        {trend ? <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${trend.direction === "up" ? "text-[#126240]" : "text-[#a35a1f]"}`}>
            {trend.direction === "up" ? <TrendingUpIcon className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDownIcon className="h-3.5 w-3.5" aria-hidden="true" />}
            {trend.value}
          </span> : null}
        {detail ? <span className="text-xs text-[#888b84]">{detail}</span> : null}
      </div>
    </div>;
}