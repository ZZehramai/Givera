
import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheckIcon } from "lucide-react";

type LogoProps = {
  to?: string;
  variant?: "light" | "dark";
  subtitle?: string;
};

export function Logo({ to = "/", variant = "light", subtitle }: LogoProps) {
  const markClass = variant === "dark" ? "bg-white text-[#173d32]" : "bg-[#173d32] text-white";
  const titleClass = variant === "dark" ? "text-white" : "text-[#1d2522]";
  const subClass = variant === "dark" ? "text-[#a9c3b7]" : "text-[#6e736d]";

  return (
    <Link to={to} className="flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">
      <span className={`grid h-8 w-8 place-items-center rounded ${markClass}`}>
        <ShieldCheckIcon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className={`block text-[15px] font-semibold tracking-[-0.01em] ${titleClass}`}>Givera</span>
        {subtitle ? <span className={`block text-[10px] font-medium uppercase tracking-[0.14em] ${subClass}`}>{subtitle}</span> : null}
      </span>
    </Link>);

}