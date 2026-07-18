

import React from "react";
import { Link } from "react-router-dom";
import { MapPinIcon, UsersIcon, ArrowRightIcon } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";
import { formatCurrency, type Campaign } from "../data/mockData";

export function CampaignCard({ campaign }: {campaign: Campaign;}) {
  const progress = Math.round(campaign.raised / campaign.goal * 100);
  return (
    <article className="flex flex-col rounded-md border border-[#d8d8d2] bg-white p-5 transition-colors hover:border-[#b7c4bc]">
      <div className="flex items-start justify-between gap-3">
        <StatusBadge status={campaign.status} />
        <span className="text-[11px] font-medium text-[#9a9d96]">{campaign.reference}</span>
      </div>
      <h3 className="mt-3 text-[15px] font-semibold text-[#1d2522]">{campaign.name}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#71766f]">
        <MapPinIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {campaign.location}
      </p>
      <p className="mt-3 line-clamp-2 text-[13px] leading-5 text-[#5f655e]">{campaign.summary}</p>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-semibold text-[#1d2522]">{formatCurrency(campaign.raised)}</span>
          <span className="text-[#888b84]">of {formatCurrency(campaign.goal)}</span>
        </div>
        <ProgressBar value={progress} label={`${campaign.name} funding progress`} className="mt-2" />
        <div className="mt-2 flex items-center justify-between text-[11px] text-[#83877f]">
          <span>{progress}% funded</span>
          <span className="inline-flex items-center gap-1"><UsersIcon className="h-3.5 w-3.5" aria-hidden="true" />{campaign.donors.toLocaleString()} donors</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-[#eeeeea] pt-4">
        <Link
          to={`/donate?campaign=${campaign.slug}`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#16734e] px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#125f40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">
          
          Donate
        </Link>
        <Link
          to={`/transparency`}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[#cfd1ca] px-3 py-2 text-[13px] font-semibold text-[#2b332e] transition-colors hover:bg-[#f5f6f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">
          
          Records <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>);

}