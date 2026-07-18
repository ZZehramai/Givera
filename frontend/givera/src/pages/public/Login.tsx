



import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheckIcon } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Field, inputClass } from "../../components/ui/Field";
import { DemoNotice } from "../../components/ui/DemoNotice";

export function Login() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-14 sm:px-6">
      <div className="flex justify-center"><Logo subtitle="Accountable giving" /></div>
      <div className="mt-8 rounded-lg border border-[#d8d8d2] bg-white p-7">
        <h1 className="text-xl font-semibold text-[#1d2522]">Log in to your account</h1>
        <p className="mt-1.5 text-[13px] text-[#5f655e]">Access your donor dashboard, receipts, and giving history.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/dashboard");
          }}>
          
          <Field label="Email" htmlFor="login-email"><input id="login-email" type="email" required className={inputClass} placeholder="you@example.com" /></Field>
          <Field label="Password" htmlFor="login-pass"><input id="login-pass" type="password" required className={inputClass} placeholder="••••••••" /></Field>
          <div className="flex items-center justify-between text-[12px]">
            <label className="flex items-center gap-2 text-[#4a504a]"><input type="checkbox" className="h-4 w-4 rounded border-[#cfd1ca] text-[#16734e] focus:ring-[#16734e]" /> Remember me</label>
            <a href="#" className="font-medium text-[#16734e] hover:underline">Forgot password?</a>
          </div>
          <button type="submit" className="w-full rounded-md bg-[#16734e] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#125f40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">Log in</button>
        </form>

        <div className="mt-5"><DemoNotice>Authentication is not active. Any credentials proceed to the demo dashboard.</DemoNotice></div>

        <p className="mt-5 text-center text-[13px] text-[#5f655e]">New to Givera? <Link to="/register" className="font-semibold text-[#16734e] hover:underline">Create an account</Link></p>
      </div>
      <Link to="/admin/login" className="mt-4 inline-flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#6e736d] hover:text-[#16734e]">
        <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" /> Administrator sign-in
      </Link>
    </div>);

}