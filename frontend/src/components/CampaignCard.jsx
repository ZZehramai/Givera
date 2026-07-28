import { Link } from "react-router-dom";

import { mediaUrl } from "../utils/mediaUrl";

const fallbackImage =
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80";

export default function CampaignCard({ campaign }) {
  const progress = Math.min(Number(campaign.progress_percentage || 0), 100);
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(campaign.deadline) - new Date()) / 86400000),
  );

  return (
    <Link
      to={`/campaigns/${campaign.id}`}
      className="group overflow-hidden rounded-2xl border border-outline-variant/30 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-52 overflow-hidden bg-surface-container">
        <img
          src={mediaUrl(campaign.cover_image, fallbackImage)}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-primary backdrop-blur">
          {campaign.category_label}
        </span>
      </div>
      <div className="p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          {campaign.location}
        </p>
        <h2 className="mb-2 text-xl font-bold text-on-surface">{campaign.title}</h2>
        <p className="mb-6 line-clamp-2 text-sm leading-6 text-on-surface-variant">
          {campaign.summary}
        </p>

        <div className="mb-2 flex items-end justify-between gap-3">
          <span className="font-bold text-primary">
            ${Number(campaign.amount_raised).toLocaleString()}
          </span>
          <span className="text-xs text-on-surface-variant">
            ${Number(campaign.goal_amount).toLocaleString()} goal
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full progress-gradient"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs text-on-surface-variant">
          <span>{progress}% funded</span>
          <span>{daysLeft} days left</span>
        </div>
      </div>
    </Link>
  );
}
