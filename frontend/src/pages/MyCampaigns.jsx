import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import api from "../api/axios";
import AppHeader from "../components/AppHeader";
import { useLanguage } from "../i18n/LanguageContext";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-700",
  completed: "bg-blue-100 text-blue-800",
};

export default function MyCampaigns() {
  const { t } = useLanguage();
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
            <p className="text-sm font-bold uppercase tracking-widest text-primary">{t("organizerArea")}</p>
            <h1 className="mt-2 text-4xl font-bold">{t("myCampaigns")}</h1>
          </div>
          <Link
            to="/campaigns/create"
            className="rounded-xl bg-primary px-5 py-3 font-bold text-white"
          >
            {t("createCampaign")}
          </Link>
        </div>

        {location.state?.message && (
          <div className="mt-8 rounded-xl bg-green-50 p-4 text-green-800">
            {location.state.message}
          </div>
        )}

        {loading ? (
          <p className="py-20 text-center">{t("loading")}</p>
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
                      {t(campaign.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-on-surface-variant">{campaign.summary}</p>
                  {campaign.rejection_reason && (
                    <div className="mt-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                      <p><strong>{t("whyRejected")}:</strong> {campaign.rejection_reason}</p>
                      <p className="mt-2 text-xs text-red-600">{t("rejectionFixHint")}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 md:justify-end">
                  {campaign.status === "rejected" && (
                    <Link to={`/campaigns/${campaign.id}/edit`} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white">
                      {t("fixResubmitShort")}
                    </Link>
                  )}
                  <Link
                    to={`/campaigns/${campaign.id}`}
                    state={{ campaignReturnTo: "/my-campaigns", campaignReturnLabelKey: "backToMyCampaigns" }}
                    className="px-2 py-2.5 font-semibold text-primary hover:underline"
                  >
                    {t("viewDetails")} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl bg-white px-6 py-20 text-center">
            <h2 className="text-2xl font-bold">{t("noSubmittedCampaign")}</h2>
            <p className="mt-2 text-on-surface-variant">
              {t("tellStory")}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
