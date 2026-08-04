import { Link } from "react-router-dom";
import { mediaUrl } from "../utils/mediaUrl";

const fallbackImage =
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80";

export default function CampaignCard({ campaign }) {
  const amountRaised = Number(campaign.amount_raised || 0);
  const goalAmount = Number(campaign.goal_amount || 1);
  const progress = Math.min(Math.round((amountRaised / goalAmount) * 100), 100);

  return (
    <Link
      to={`/campaigns/${campaign.id}`}
      className="group flex flex-col transition duration-200 hover:-translate-y-1"
    >
      {/* Thumbnail Image Container */}
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

        {/* Location Badge (Dark semi-transparent overlay pill on bottom-left) */}
        {campaign.location && (
          <span className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
            {campaign.location}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        {/* Title */}
        <h2 className="line-clamp-2 text-base font-extrabold leading-snug text-slate-900 group-hover:text-primary">
          {campaign.title}
        </h2>

        {/* Progress & Raised Amount */}
        <div className="mt-4">
          {/* Thin Green Progress Bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Amount Raised Text */}
          <p className="mt-2 text-sm font-extrabold text-slate-900">
            ${amountRaised.toLocaleString()}{" "}
            <span className="font-normal text-slate-500">raised</span>
          </p>
        </div>
      </div>
    </Link>
  );
}