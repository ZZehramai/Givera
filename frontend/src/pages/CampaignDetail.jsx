import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../api/axios";
import AppHeader from "../components/AppHeader";

const fallbackImage =
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80";

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/campaigns/${id}/`)
      .then((response) => setCampaign(response.data))
      .catch(() => setError("This campaign could not be found."));
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen bg-surface">
        <AppHeader />
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-bold">{error}</h1>
          <Link to="/campaigns" className="mt-6 inline-block text-primary underline">
            Return to campaigns
          </Link>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return <p className="p-20 text-center">Loading campaign…</p>;
  }

  const progress = Math.min(Number(campaign.progress_percentage || 0), 100);

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader />
      <main className="mx-auto max-w-container-max px-6 py-10">
        <Link to="/campaigns" className="text-sm font-semibold text-primary">
          ← All campaigns
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_0.8fr]">
          <article>
            <img
              src={campaign.cover_image || fallbackImage}
              alt=""
              className="aspect-[16/9] w-full rounded-3xl object-cover"
            />
            <div className="py-8">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold">
                  {campaign.category_label}
                </span>
                <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold">
                  {campaign.location}
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight text-on-surface">
                {campaign.title}
              </h1>
              <p className="mt-4 text-lg leading-8 text-on-surface-variant">
                {campaign.summary}
              </p>

              <div className="my-8 border-y border-outline-variant/40 py-5 text-sm text-on-surface-variant">
                Organized by <strong>{campaign.owner_name}</strong> for{" "}
                <strong>{campaign.beneficiary}</strong>
              </div>

              <h2 className="text-2xl font-bold">The story</h2>
              <div className="mt-4 whitespace-pre-wrap text-base leading-8 text-on-surface-variant">
                {campaign.story}
              </div>
            </div>
          </article>

          <aside>
            <div className="sticky top-24 rounded-3xl border border-outline-variant/30 bg-white p-7 shadow-lg">
              <p className="text-3xl font-bold text-primary">
                ${Number(campaign.amount_raised).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                raised of ${Number(campaign.goal_amount).toLocaleString()} goal
              </p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full progress-gradient"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <strong>{progress}% funded</strong>
                <span>Ends {new Date(campaign.deadline).toLocaleDateString()}</span>
              </div>
              <button
                type="button"
                disabled
                className="mt-7 w-full rounded-xl bg-primary px-5 py-4 font-bold text-white opacity-60"
              >
                Donations coming next
              </button>
              <p className="mt-3 text-center text-xs text-on-surface-variant">
                Payment support will be added after campaign approval is complete.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
