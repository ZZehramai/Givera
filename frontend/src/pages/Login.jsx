import { GoogleLogin } from "@react-oauth/google";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { login, loginWithGoogle } from "../services/authService";
import { useLanguage } from "../i18n/LanguageContext";

const inputClass =
  "w-full rounded-2xl border border-outline-variant bg-white py-3.5 pl-12 pr-4 text-on-surface outline-none transition placeholder:text-on-surface-variant/55 focus:border-primary focus:ring-4 focus:ring-primary/10";

export function Login() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (requestError) {
      const data = requestError.response?.data;
      if (language === "my") {
        setError(t("signInError"));
      } else if (data?.non_field_errors) {
        setError(data.non_field_errors[0]);
      } else if (typeof data === "string") {
        setError(data);
      } else {
        setError(t("signInError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate("/dashboard");
    } catch (requestError) {
      setError(
        (language === "en" && requestError.response?.data?.detail) ||
          t("googleSignInError"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface px-4 py-6 text-on-surface sm:px-6 sm:py-8">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-on-surface-variant transition hover:text-primary">
          <ArrowLeft size={17} aria-hidden="true" />
          {t("backHome")}
        </Link>
        {/* <Link to="/" className="inline-flex items-center gap-2 text-xl font-extrabold text-primary">
          <Heart size={21} fill="currentColor" aria-hidden="true" />
          Givera
        </Link> */}
      </header>

      <section className="mx-auto mt-10 w-full max-w-lg rounded-[2rem] border border-outline-variant/70 bg-white p-6 shadow-xl shadow-primary/10 sm:mt-14 sm:p-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.1em] text-primary">{t("welcomeBack")}</p>
          <h3 className="mt-2 text-4xl font-extrabold">{t("signInGivera")}</h3>
          <p className="mt-3 leading-7 text-on-surface-variant">
            {t("signInDescription")}
          </p>
        </div>

      {location.state?.message && (
        <div className="mt-6 rounded-2xl bg-tertiary-container px-4 py-3 text-sm font-semibold text-tertiary">
          {location.state.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-bold">{t("email")}</span>
          <span className="relative block">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={19} aria-hidden="true" />
            <input
              required
              autoComplete="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputClass}
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-bold">{t("password")}</span>
            <Link to="/forgot-password" className="text-xs font-bold text-primary transition hover:underline">{t("forgotPassword")}</Link>
          </span>
          <span className="relative block">
            <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={19} aria-hidden="true" />
            <input
              required
              autoComplete="current-password"
              type="password"
              placeholder={t("enterPassword")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={inputClass}
            />
          </span>
        </label>

        {error && (
          <div role="alert" className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-primary px-6 py-4 font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {loading ? t("signingIn") : t("signInLower")}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-outline-variant" />
        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{t("continueWith")}</span>
        <div className="h-px flex-1 bg-outline-variant" />
      </div>

      <div className="flex min-h-11 justify-center overflow-hidden rounded-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError(t("googleSignInCancelled"))}
          useOneTap={false}
          shape="pill"
          size="large"
          width="320"
        />
      </div>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          {t("newToGivera")}{" "}
          <Link to="/register" className="font-bold text-primary hover:underline">
            {t("createAccount")}
          </Link>
        </p>
      </section>
    </main>
  );
}
