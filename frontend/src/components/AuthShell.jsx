import { ArrowLeft, Heart, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: ShieldCheck, text: "Campaigns reviewed with care" },
  { icon: Users, text: "A community built around generosity" },
  { icon: Sparkles, text: "Clear progress from goal to impact" },
];

export default function AuthShell({ mode, children }) {
  const isRegister = mode === "register";

  return (
    <main className="hero-mesh min-h-screen px-4 py-5 text-on-surface sm:px-6 sm:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-2xl shadow-primary/10 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-on-surface p-10 text-white lg:flex lg:flex-col xl:p-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/45 blur-2xl" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-secondary/25 blur-3xl" />
          <div className="absolute bottom-20 right-12 h-24 w-24 rounded-full border-[18px] border-white/5" />

          <Link to="/" className="relative z-10 inline-flex w-fit items-center gap-2 text-2xl font-extrabold">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-white">
              <Heart size={21} fill="currentColor" aria-hidden="true" />
            </span>
            Givera
          </Link>

          <div className="relative z-10 my-auto py-16">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary-fixed">
              {isRegister ? "Join the community" : "Welcome home"}
            </p>
            <h1 className="mt-5 max-w-md text-4xl font-extrabold leading-tight xl:text-5xl">
              {isRegister
                ? "Your next act of kindness starts here."
                : "Come back to the good you’re growing."}
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-white/65">
              {isRegister
                ? "Create an account to support meaningful causes, start a campaign, and follow every step of its impact."
                : "Sign in to discover causes, manage your campaigns, and stay close to the people and stories you support."}
            </p>

            <div className="mt-10 space-y-3">
              {benefits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm font-semibold text-white/85">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-primary-fixed">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-sm text-white/45">
            Fundraising made human.
          </p>
        </section>

        <section className="flex min-w-0 flex-col bg-surface px-5 py-6 sm:px-10 sm:py-10 xl:px-16">
          <div className="flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant transition hover:text-primary">
              <ArrowLeft size={17} aria-hidden="true" />
              Back home
            </Link>
            <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-primary lg:hidden">
              <Heart size={19} fill="currentColor" aria-hidden="true" />
              Givera
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
