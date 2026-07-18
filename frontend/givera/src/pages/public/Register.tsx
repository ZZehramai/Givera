



import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "../../components/ui/Logo";
import { Field, inputClass } from "../../components/ui/Field";
import { DemoNotice } from "../../components/ui/DemoNotice";

export function Register() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-14 sm:px-6">
      <div className="flex justify-center"><Logo subtitle="Accountable giving" /></div>
      <div className="mt-8 rounded-lg border border-[#d8d8d2] bg-white p-7">
        <h1 className="text-xl font-semibold text-[#1d2522]">Create your account</h1>
        <p className="mt-1.5 text-[13px] text-[#5f655e]">Track your contributions and access transparent records.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/dashboard");
          }}>
          
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" htmlFor="fn"><input id="fn" required className={inputClass} placeholder="First" /></Field>
            <Field label="Last name" htmlFor="ln"><input id="ln" required className={inputClass} placeholder="Last" /></Field>
          </div>
          <Field label="Email" htmlFor="reg-email"><input id="reg-email" type="email" required className={inputClass} placeholder="you@example.com" /></Field>
          <Field label="Password" htmlFor="reg-pass" hint="At least 8 characters."><input id="reg-pass" type="password" required className={inputClass} placeholder="Create a password" /></Field>
          <label className="flex items-start gap-2.5 text-[13px] text-[#4a504a]">
            <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-[#cfd1ca] text-[#16734e] focus:ring-[#16734e]" />
            I agree to Givera’s terms and public transparency principles.
          </label>
          <button type="submit" className="w-full rounded-md bg-[#16734e] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#125f40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">Create account</button>
        </form>

        <div className="mt-5"><DemoNotice>Registration is not active. This creates no account and proceeds to the demo dashboard.</DemoNotice></div>

        <p className="mt-5 text-center text-[13px] text-[#5f655e]">Already have an account? <Link to="/login" className="font-semibold text-[#16734e] hover:underline">Log in</Link></p>
      </div>
    </div>);

}