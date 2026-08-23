import { ArrowLeft, AtSign, Heart, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/axios";
import { useLanguage } from "../i18n/LanguageContext";

const inputClass =
  "w-full rounded-2xl border border-outline-variant bg-white py-3.5 pl-12 pr-4 text-on-surface outline-none transition placeholder:text-on-surface-variant/55 focus:border-primary focus:ring-4 focus:ring-primary/10";

const initialForm = {
  email: "",
  username: "",
  first_name: "",
  last_name: "",
  password: "",
  password2: "",
};

function Field({ label, icon: Icon, ...inputProps }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold">{label}</span>
      <span className="relative block">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={19} aria-hidden="true" />
        <input {...inputProps} className={inputClass} />
      </span>
    </label>
  );
}

export function Register() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register/", form);
      navigate("/login", {
        replace: true,
        state: { message: t("accountReady") },
      });
    } catch (requestError) {
      const data = requestError.response?.data;
      if (language === "my") {
        setError(t("accountCreateError"));
      } else if (data && typeof data === "object") {
        const firstError = Object.values(data).flat()[0];
        setError(firstError || t("accountCreateError"));
      } else {
        setError(t("accountCreateError"));
      }
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

      <section className="mx-auto mt-10 w-full max-w-2xl rounded-[2rem] border border-outline-variant/70 bg-white p-6 shadow-xl shadow-primary/10 sm:p-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.1em] text-primary">{t("getStarted")}</p>
          <h3 className="mt-2 text-4xl font-extrabold">{t("createYourAccount")}</h3>
          <p className="mt-3 leading-7 text-on-surface-variant">
            {t("registerDescription")}
          </p>
        </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            required
            autoComplete="given-name"
            label={t("firstName")}
            icon={UserRound}
            name="first_name"
            placeholder={t("firstName")}
            value={form.first_name}
            onChange={handleChange}
          />
          <Field
            required
            autoComplete="family-name"
            label={t("lastName")}
            icon={UserRound}
            name="last_name"
            placeholder={t("lastName")}
            value={form.last_name}
            onChange={handleChange}
          />
        </div>

        <Field
          required
          autoComplete="username"
          label={t("username")}
          icon={AtSign}
          name="username"
          placeholder={t("usernamePlaceholder")}
          value={form.username}
          onChange={handleChange}
        />

        <Field
          required
          autoComplete="email"
          label={t("email")}
          icon={Mail}
          name="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          value={form.email}
          onChange={handleChange}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            required
            autoComplete="new-password"
            label={t("password")}
            icon={LockKeyhole}
            name="password"
            type="password"
            placeholder={t("createPassword")}
            value={form.password}
            onChange={handleChange}
          />
          <Field
            required
            autoComplete="new-password"
            label={t("confirmPassword")}
            icon={LockKeyhole}
            name="password2"
            type="password"
            placeholder={t("repeatPassword")}
            value={form.password2}
            onChange={handleChange}
          />
        </div>

        <p className="text-xs leading-5 text-on-surface-variant">
          {t("passwordHelp")}
        </p>

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
          {loading ? t("creatingAccount") : t("createAccount")}
        </button>
      </form>

        <p className="mt-7 text-center text-sm text-on-surface-variant">
          {t("alreadyAccount")}{" "}
          <Link to="/login" className="font-bold text-primary hover:underline">
            {t("signInLower")}
          </Link>
        </p>
      </section>
    </main>
  );
}
