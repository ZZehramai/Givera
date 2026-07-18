




import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheckIcon } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Field, inputClass } from "../../components/ui/Field";
import { DemoNotice } from "../../components/ui/DemoNotice";

export function AdminLogin() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#173d32] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center"><Logo variant="dark" subtitle="Admin console" /></div>
        <div className="mt-8 rounded-lg border border-[#26503f] bg-white p-7">
          <span className="inline-flex items-center gap-1.5 rounded border border-[#a9d5c2] bg-[#f0f8f4] px-2.5 py-1 text-[11px] font-semibold text-[#126240]">
            <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" /> Internal access
          </span>
          <h1 className="mt-4 text-xl font-semibold text-[#1d2522]">Administrator sign-in</h1>
          <p className="mt-1.5 text-[13px] text-[#5f655e]">Restricted to authorized Givera operations staff.</p>

          <form className="mt-6 space-y-4" onSubmit={(e) => {e.preventDefault();navigate("/admin");}}>
            <Field label="Staff email" htmlFor="a-email"><input id="a-email" type="email" required className={inputClass} placeholder="name@givera.org" /></Field>
            <Field label="Password" htmlFor="a-pass"><input id="a-pass" type="password" required className={inputClass} placeholder="••••••••" /></Field>
            <button type="submit" className="w-full rounded-md bg-[#173d32] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f2c24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">Enter console</button>
          </form>

          <div className="mt-5"><DemoNotice>Authentication is not active. Any credentials enter the demo console.</DemoNotice></div>
        </div>
        <Link to="/" className="mt-4 block text-center text-[12px] font-medium text-[#a9c3b7] hover:text-white">← Back to public site</Link>
      </div>
    </div>);

}