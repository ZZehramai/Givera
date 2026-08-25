import { useRef } from "react";
import { Check, Globe2, Languages } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageSwitch({ compact = false, inverse = false, footer = false, sidebar = false }) {
  const { language, setLanguage, t } = useLanguage();
  const detailsRef = useRef(null);

  if (sidebar) {
    const chooseLanguage = (value) => {
      setLanguage(value);
      detailsRef.current?.removeAttribute("open");
    };

    return (
      <details ref={detailsRef} className="group relative ml-auto shrink-0">
        <summary
          aria-label={t("languageLabel")}
          className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:border-primary/30 hover:bg-primary-fixed hover:text-primary focus:outline-none focus:ring-4 focus:ring-primary/10 [&::-webkit-details-marker]:hidden"
        >
          <Globe2 size={17} aria-hidden="true" />
        </summary>
        <div className="absolute bottom-11 right-0 z-30 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_35px_rgba(41,35,80,.18)]">
          {[["en", "English"], ["my", "မြန်မာ"]].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => chooseLanguage(value)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold transition ${language === value ? "bg-primary-fixed text-primary" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {label}
              {language === value && <Check size={14} aria-hidden="true" />}
            </button>
          ))}
        </div>
      </details>
    );
  }

  if (footer) {
    return (
      <label className="group relative inline-flex h-9 min-w-[120px] items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 shadow-sm transition hover:border-slate-500 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
        <span className="sr-only">{t("languageLabel")}</span>
        <span className="pointer-events-none flex items-center justify-center gap-2 px-3 text-[14px] font-bold">
          <Globe2 size={18} className="text-slate-600 dark:text-slate-300" aria-hidden="true" />
          {language === "my" ? "မြန်မာ" : "English"}
        </span>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          aria-label={t("languageLabel")}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-full opacity-0 outline-none"
        >
          <option value="en">English</option>
          <option value="my">မြန်မာ</option>
        </select>
      </label>
    );
  }

  return <div className={`inline-flex items-center rounded-xl border p-1 ${inverse ? "border-white/20 bg-white/10" : "border-slate-200 bg-slate-50"}`} aria-label={t("languageLabel")}>
    {!compact && <Languages size={15} className={`mx-1.5 ${inverse ? "text-white/70" : "text-slate-400"}`} />}
    {[['en', 'EN'], ['my', 'မြန်မာ']].map(([value, label]) => <button key={value} type="button" onClick={() => setLanguage(value)} aria-pressed={language === value} className={`rounded-lg px-2.5 py-1.5 text-xs font-extrabold transition ${language === value ? (inverse ? "bg-white text-[#25194B]" : "bg-[#6F52D9] text-white") : (inverse ? "text-white/75 hover:text-white" : "text-slate-500 hover:text-[#6549C9]")}`}>{label}</button>)}
  </div>;
}
