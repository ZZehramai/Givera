import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import api from "../api/axios";
import PasswordInput from "../components/PasswordInput";
import { useLanguage } from "../i18n/LanguageContext";

const inputClass = "w-full rounded-2xl border border-outline-variant bg-white py-3.5 pl-12 pr-4 outline-none transition placeholder:text-on-surface-variant/55 focus:border-primary focus:ring-4 focus:ring-primary/10";

export default function ResetPassword() {
  const { language, t } = useLanguage();
  const [params] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const uid = params.get("uid");
  const token = params.get("token");
  const linkMissing = !uid || !token;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (password !== confirmation) return setError(t("passwordMismatch"));
    setLoading(true);
    try {
      await api.post("/auth/reset-password/", { uid, token, new_password: password, new_password2: confirmation });
      setComplete(true);
    } catch (requestError) {
      const data = requestError.response?.data;
      const firstError = data && typeof data === "object" ? data.detail || Object.values(data).flat()[0] : null;
      setError((language === "en" && firstError) || t("resetPasswordError"));
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
        <h1 className="mt-2 text-4xl font-extrabold">{t("resetPasswordTitle")}</h1>
        <p className="mt-3 leading-7 text-on-surface-variant">{t("resetPasswordDescription")}</p>
        {complete ? (
          <div className="mt-8">
            <div role="status" className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-sm leading-6 text-emerald-800"><p className="font-extrabold">{t("passwordResetComplete")}</p><p className="mt-1">{t("passwordResetCompleteText")}</p></div>
            <Link to="/login" className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-6 py-4 font-bold text-white shadow-lg shadow-primary/20">{t("signInLower")}</Link>
          </div>
        ) : linkMissing ? (
          <div className="mt-8">
            <div role="alert" className="rounded-2xl bg-rose-50 p-5 text-sm leading-6 text-rose-700">{t("invalidResetLink")}</div>
            <Link to="/forgot-password" className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-6 py-4 font-bold text-white">{t("requestNewLink")}</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-bold">{t("newPassword")}</span><PasswordInput required autoFocus autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("createPassword")} className={inputClass} /></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">{t("confirmNewPassword")}</span><PasswordInput required autoComplete="new-password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder={t("repeatPassword")} className={inputClass} /></label>
            <p className="text-xs leading-5 text-on-surface-variant">{t("passwordHelp")}</p>
            {error && <div role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
            <button disabled={loading} className="w-full rounded-2xl bg-primary px-6 py-4 font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55">{loading ? t("resettingPassword") : t("resetPassword")}</button>
          </form>
        )}
      </section>
    </main>
  );
}
