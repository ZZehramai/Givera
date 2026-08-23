import { Languages } from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

export default function LanguageSwitch({ compact = false, inverse = false }) {
  const { language, setLanguage, t } = useLanguage();
  return <div className={`inline-flex items-center rounded-xl border p-1 ${inverse ? "border-white/20 bg-white/10" : "border-slate-200 bg-slate-50"}`} aria-label={t("languageLabel")}>
    {!compact && <Languages size={15} className={`mx-1.5 ${inverse ? "text-white/70" : "text-slate-400"}`} />}
    {[['en', 'EN'], ['my', 'မြန်မာ']].map(([value, label]) => <button key={value} type="button" onClick={() => setLanguage(value)} aria-pressed={language === value} className={`rounded-lg px-2.5 py-1.5 text-xs font-extrabold transition ${language === value ? (inverse ? "bg-white text-[#25194B]" : "bg-[#6F52D9] text-white") : (inverse ? "text-white/75 hover:text-white" : "text-slate-500 hover:text-[#6549C9]")}`}>{label}</button>)}
  </div>;
}
