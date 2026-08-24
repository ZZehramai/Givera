import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import { useLanguage } from "../i18n/LanguageContext";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password/", { email });
      setSent(true);
    } catch {
      setError(t("resetRequestError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface px-4 py-6 text-on-surface sm:px-6 sm:py-8">
      <header className="mx-auto w-full max-w-6xl">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant transition hover:text-primary">
          <ArrowLeft size={17} aria-hidden="true" /> {t("backToSignIn")}
        </Link>
      </header>
      <section className="mx-auto mt-10 w-full max-w-lg rounded-[2rem] border border-outline-variant/70 bg-white p-6 shadow-xl shadow-primary/10 sm:mt-14 sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.1em] text-primary">{t("accountRecovery")}</p>
        <h1 className="mt-2 text-4xl font-extrabold">{t("forgotPasswordTitle")}</h1>
        <p className="mt-3 leading-7 text-on-surface-variant">{t("forgotPasswordDescription")}</p>
        {sent ? (
          <div className="mt-8">
            <div role="status" className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm leading-6 text-emerald-800">
              <p className="font-extrabold">{t("checkYourEmail")}</p>
              <p className="mt-1">{t("resetEmailSent")}</p>
            </div>
            <button type="button" onClick={() => setSent(false)} className="mt-5 w-full rounded-2xl border border-outline-variant px-6 py-3.5 text-sm font-bold text-primary transition hover:bg-primary-fixed/50">{t("tryAnotherEmail")}</button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold">{t("email")}</span>
              <span className="relative block">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={19} aria-hidden="true" />
                <input required autoFocus autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("emailPlaceholder")} className="w-full rounded-2xl border border-outline-variant bg-white py-3.5 pl-12 pr-4 outline-none transition placeholder:text-on-surface-variant/55 focus:border-primary focus:ring-4 focus:ring-primary/10" />
              </span>
            </label>
            {error && <div role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
            <button disabled={loading} className="w-full rounded-2xl bg-primary px-6 py-4 font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55">{loading ? t("sendingResetLink") : t("sendResetLink")}</button>
          </form>
        )}
      </section>
    </main>
  );
}
