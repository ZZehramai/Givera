
import React from "react";

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

export function Field({ label, htmlFor, hint, children, className = "" }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-[#2b332e]">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-[11px] text-[#888b84]">{hint}</p> : null}
    </div>);

}

export const inputClass =
"w-full rounded-md border border-[#cfd1ca] bg-white px-3 py-2 text-[14px] text-[#1d2522] placeholder:text-[#a2a69f] transition-colors focus:border-[#16734e] focus:outline-none focus:ring-2 focus:ring-[#16734e]/25";