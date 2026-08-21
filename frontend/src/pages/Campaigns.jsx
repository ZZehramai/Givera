import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import api from "../api/axios";
import AppHeader from "../components/AppHeader";
import CampaignCard from "../components/CampaignCard";
import { useLanguage } from "../i18n/LanguageContext";

const categories = [
  ["all", "allCauses"],
  ["education", "education"],
  ["medical", "medical"],
  ["emergency", "emergency"],
  ["community", "community"],
  ["environment", "environment"],
  ["animals", "animals"],
  ["other", "other"],
];

function LoadingGrid() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="flex animate-pulse flex-col gap-3">
          <div className="aspect-[16/10] w-full rounded-2xl bg-slate-200" />
          <div className="h-5 w-3/4 rounded bg-slate-200" />
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200" />
          <div className="h-4 w-1/3 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ searching }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-20 text-center">
      <h2 className="text-xl font-extrabold text-slate-800">
        {searching ? t("noMatching") : t("noCampaigns")}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {searching
          ? t("differentSearch")
          : t("campaignsLater")}
      </p>
    </div>
  );
}

export default function Campaigns() {
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/campaigns/", {
          params: { q: query.trim() },
        });
        setCampaigns(response.data);
      } catch {
        setError("Campaigns could not be loaded. Is the Django server running?");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Filter campaigns by selected category pill
  const filteredCampaigns = useMemo(() => {
    if (selectedCategory === "all") return campaigns;
    return campaigns.filter((c) => c.category === selectedCategory);
  }, [campaigns, selectedCategory]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AppHeader minimal />
      <main>
        {/* Search Header */}
        <section className="border-b border-slate-100 bg-purple-100 px-6 py-12 md:py-16">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <span className="rounded-full bg-[#FFF1A8] px-3 py-1.5 text-xs font-extrabold text-[#655000]">
              {t("verifiedCampaigns")}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#201A36] md:text-5xl">
              {t("discoverCampaigns")}
            </h1>

            <div className="mt-6 flex w-full max-w-xl items-center gap-3 rounded-full border border-slate-300 bg-white px-5 py-3.5 shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchCampaigns")}
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Category Selector Pills */}
        <section className="border-b border-slate-100 px-6 py-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2">
            {categories.map(([value, labelKey]) => {
              const isActive = selectedCategory === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedCategory(value)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#6F52D9] text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </section>

        {/* Campaigns Grid */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          {error && (
            <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          {loading ? (
            <LoadingGrid />
          ) : filteredCampaigns.length > 0 ? (
            <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <EmptyState searching={Boolean(query || selectedCategory !== "all")} />
          )}
        </section>
      </main>
    </div>
  );
}
