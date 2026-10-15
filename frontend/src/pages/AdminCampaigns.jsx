import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../api/axios";
import AppHeader from "../components/AppHeader";
import { useLanguage } from "../i18n/LanguageContext";

export default function AdminCampaigns() {
  const { language, t, formatKyat } = useLanguage();
  const [campaigns, setCampaigns] = useState([]);
  const [reasons, setReasons] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/campaigns/pending/").then((response) => {
      if (active) {
        setCampaigns(response.data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const review = async (campaign, status) => {
    setMessage("");
    try {
      await api.patch(`/campaigns/${campaign.id}/review/`, {
        status,
        rejection_reason: reasons[campaign.id] || "",
      });
      setCampaigns((current) => current.filter((item) => item.id !== campaign.id));
      setMessage(`${t("reviewSaved")} “${campaign.title}” — ${t(status)}.`);
    } catch (error) {
      const data = error.response?.data;
      setMessage(
        (language === "en" && (data?.rejection_reason?.[0] || data?.non_field_errors?.[0])) ||
          t("reviewSaveError"),
      );
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">{t("administration")}</p>
        <h1 className="mt-2 text-4xl font-bold">{t("reviewQueue")}</h1>
        <p className="mt-3 text-on-surface-variant">
          {t("reviewDescription")}
        </p>

        {message && <div className="mt-6 rounded-xl bg-secondary-container p-4">{message}</div>}

        <div className="mt-8 space-y-6">
          {campaigns.length ? (
            campaigns.map((campaign) => (
              <article
                key={campaign.id}
                className="rounded-3xl border border-outline-variant/30 bg-white p-7 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {t(campaign.category)}
                    </span>
                    <h2 className="mt-1 text-2xl font-bold">{campaign.title}</h2>
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {t("by")} {campaign.owner_name} · {campaign.owner_email} · {campaign.location}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-primary">
                    {formatKyat(campaign.goal_amount)}
                  </p>
                </div>
                <p className="mt-5 leading-7 text-on-surface-variant">{campaign.summary}</p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    to={`/campaigns/${campaign.id}`}
                    className="rounded-xl border border-outline-variant px-4 py-2.5 font-semibold"
                  >
                    {t("readFullStory")}
                  </Link>
                  <button
                    type="button"
                    onClick={() => review(campaign, "approved")}
                    className="rounded-xl bg-green-600 px-5 py-2.5 font-bold text-white"
                  >
                    {t("approve")}
                  </button>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    value={reasons[campaign.id] || ""}
                    onChange={(event) =>
                      setReasons((current) => ({
                        ...current,
                        [campaign.id]: event.target.value,
                      }))
                    }
                    placeholder={t("rejectReasonRequired")}
                    className="rounded-xl border border-outline-variant px-4 py-3 outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => review(campaign, "rejected")}
                    className="rounded-xl bg-red-600 px-5 py-2.5 font-bold text-white"
                  >
                    {t("reject")}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl bg-white px-6 py-20 text-center">
              <h2 className="text-2xl font-bold">{t("reviewClear")}</h2>
              <p className="mt-2 text-on-surface-variant">
                {t("newCampaignSubmissions")}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
