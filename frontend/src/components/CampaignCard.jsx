import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Bookmark } from "lucide-react";
import { mediaUrl } from "../utils/mediaUrl";
import { useLanguage } from "../i18n/LanguageContext";
import api from "../api/axios";

const fallbackImage =
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80";

export default function CampaignCard({ campaign, returnTo, returnLabelKey }) {
  const { t, formatKyat, formatNumber } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(Boolean(campaign.is_saved));
  const [saving, setSaving] = useState(false);
  const [loadedAt] = useState(() => Date.now());

  useEffect(() => {
    setIsSaved(Boolean(campaign.is_saved));
  }, [campaign.id, campaign.is_saved]);

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!localStorage.getItem("access")) {
      navigate("/login", { state: { from: `${location.pathname}${location.search}` } });
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/campaigns/${campaign.id}/save/`);
      } else {
        await api.post(`/campaigns/${campaign.id}/save/`);
      }
      setIsSaved((current) => !current);
      window.dispatchEvent(new Event("savedCampaignsUpdated"));
    } finally {
      setSaving(false);
    }
  };

  const amountRaised = Number(campaign.amount_raised || 0);
  const goalAmount = Number(campaign.goal_amount || 1);
  const progress = Math.min(Math.round((amountRaised / goalAmount) * 100), 100);
  const isCompleted = campaign.status === "completed";
  const daysRemaining = campaign.deadline
    ? Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - loadedAt) / 86400000))
    : null;

  return (
    <Link
      to={`/campaigns/${campaign.id}`}
      state={{
        campaignReturnTo: returnTo || `${location.pathname}${location.search}`,
        campaignReturnLabelKey: returnLabelKey,
      }}
      className="group flex flex-col transition duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={mediaUrl(campaign.cover_image, fallbackImage)}
          alt={campaign.title || t("campaignPhoto")}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
        />

        {/* Location (bottom-left) */}
        {campaign.location && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <MapPin className="mr-1 inline-block" size={13} />
            {campaign.location}
          </span>
        )}

        {/* Top Header Row: Left မှာ Category၊ Right မှာ Save Icon */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          {/* ဘယ်ဘက်အပေါ်ထောင့် (Top-Left) - Category */}
          <span className="rounded-full bg-[#FFE27A] px-2.5 py-1 text-[11px] font-bold text-[#765E00] shadow-sm">
            {t(campaign.category || "community")}
          </span>

          {/* ညာဘက်အပေါ်ထောင့် (Top-Right) - Save / Bookmark Icon */}
          <button 
            type="button" 
            onClick={toggleSave}
            disabled={saving}
            aria-label={isSaved ? t("removeSavedCampaign") : t("saveCampaign")}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur-md transition hover:bg-white disabled:cursor-wait disabled:opacity-60"
          >
            <Bookmark 
              size={18} 
              className={isSaved ? "text-[#6F52D9]" : "text-slate-700"} 
              fill={isSaved ? "#6F52D9" : "none"} 
            />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 text-base font-extrabold leading-snug text-slate-900">
            {campaign.title}
          </h2>
          {(isCompleted || daysRemaining !== null) && (
            <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-bold ${isCompleted ? "bg-[#EEE9FF] text-[#6549C9]" : "text-slate-500"}`}>
              {isCompleted ? t("completed") : <><CalendarDays size={13} /> {daysRemaining ? `${formatNumber(daysRemaining)} ${t("daysLeft")}` : t("endingToday")}</>}
            </span>
          )}
        </div>
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isCompleted ? "bg-[#6F52D9]" : "bg-emerald-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-extrabold text-slate-900">
            {formatKyat(amountRaised)} <span className="font-normal text-slate-500">{t("raised")}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
