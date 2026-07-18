
import React from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-[#d8d8d2] pb-5 sm:flex-row sm:items-end">
      <div>
        {eyebrow ? <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.11em] text-[#6e736d]">{eyebrow}</p> : null}
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#1d2522] sm:text-[26px]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-[#5f655e]">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>);

}