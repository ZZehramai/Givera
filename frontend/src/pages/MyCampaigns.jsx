import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import api from "../api/axios";
import AppHeader from "../components/AppHeader";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-700",
  completed: "bg-blue-100 text-blue-800",
};

export default function MyCampaigns() {
  const location = useLocation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/campaigns/mine/")
      .then((response) => setCampaigns(response.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Organizer area</p>
            <h1 className="mt-2 text-4xl font-bold">My campaigns</h1>
          </div>
          <Link
            to="/campaigns/create"
            className="rounded-xl bg-primary px-5 py-3 font-bold text-white"
          >
            Create campaign
          </Link>
        </div>

        {location.state?.message && (
          <div className="mt-8 rounded-xl bg-green-50 p-4 text-green-800">
            {location.state.message}
          </div>
        )}

        {loading ? (
          <p className="py-20 text-center">Loading…</p>
        ) : campaigns.length ? (
          <div className="mt-8 space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="grid gap-4 rounded-2xl border border-outline-variant/30 bg-white p-6 md:grid-cols-[1fr_auto] md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold">{campaign.title}</h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        statusStyles[campaign.status] || statusStyles.draft
                      }`}
                    >
                      {campaign.status_label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-on-surface-variant">{campaign.summary}</p>
                  {campaign.rejection_reason && (
                    <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      <strong>Review note:</strong> {campaign.rejection_reason}
                    </p>
                  )}
                </div>
                <Link
                  to={`/campaigns/${campaign.id}`}
                  className="font-semibold text-primary hover:underline"
                >
                  View details →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl bg-white px-6 py-20 text-center">
            <h2 className="text-2xl font-bold">You have not submitted a campaign yet</h2>
            <p className="mt-2 text-on-surface-variant">
              Tell your story and send it to the review team.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
