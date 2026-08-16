import { Link } from "react-router-dom";
import { CalendarDays, MapPin } from "lucide-react";
import { mediaUrl } from "../utils/mediaUrl";

const fallbackImage =
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80";

export default function CampaignCard({ campaign }) {
  const amountRaised = Number(campaign.amount_raised || 0);
  const goalAmount = Number(campaign.goal_amount || 1);
  const progress = Math.min(Math.round((amountRaised / goalAmount) * 100), 100);
  const isCompleted = campaign.status === "completed";
  const daysRemaining = campaign.deadline
    ? Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <Link
      to={`/campaigns/${campaign.id}`}
      className="group flex flex-col transition duration-200 hover:-translate-y-1"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
        <img
          src={mediaUrl(campaign.cover_image, fallbackImage)}
          alt={campaign.title || "Campaign image"}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = fallbackImage;
          }}
        />
        {campaign.location && (
          <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
            <MapPin className="mr-1 inline-block" size={13} />
            {campaign.location}
          </span>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-[#FFE27A] px-2.5 py-1 text-[11px] font-bold text-[#765E00] shadow-sm">
          {campaign.category_label || "Community"}
        </span>
      </div>

      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 text-base font-extrabold leading-snug text-slate-900">
            {campaign.title}
          </h2>
          {(isCompleted || daysRemaining !== null) && (
            <span className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-bold ${isCompleted ? "bg-[#EEE9FF] text-[#6549C9]" : "text-slate-500"}`}>
              {isCompleted ? "Completed" : <><CalendarDays size={13} /> {daysRemaining ? `${daysRemaining} days left` : "Ending today"}</>}
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
            {amountRaised.toLocaleString()} Ks <span className="font-normal text-slate-500">raised</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
