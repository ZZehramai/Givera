import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";

import api from "../api/axios";
import AppHeader from "../components/AppHeader";
import CampaignCard from "../components/CampaignCard";

const categories = [
  ["education", "Education"],
  ["medical", "Medical"],
  ["emergency", "Emergency relief"],
  ["community", "Community"],
  ["environment", "Environment"],
  ["animals", "Animals"],
  ["other", "Other causes"],
];

const INITIAL_CATEGORY_COUNT = 4;
const INITIAL_CAMPAIGN_COUNT = 3;

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
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-20 text-center">
      <h2 className="text-xl font-extrabold text-slate-800">
        {searching ? "No matching campaigns" : "No campaigns available yet"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {searching
          ? "Try a different keyword, campaign title, or location."
          : "New verified campaigns will appear here once they are approved."}
      </p>
    </div>
  );
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [query, setQuery] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
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

  const campaignGroups = useMemo(
    () => categories
      .map(([value, label]) => ({
        value,
        label,
        campaigns: campaigns.filter((campaign) => campaign.category === value),
      })),
    [campaigns],
  );

  const visibleGroups = showAllCategories
    ? campaignGroups
    : campaignGroups.slice(0, INITIAL_CATEGORY_COUNT);
  const visibleCategoryOptions = campaignGroups.map((group) => ({
    value: group.value,
    label: group.label,
    count: group.campaigns.length,
  }));
  const isSearching = Boolean(query.trim());

  const toggleCategory = (value) => {
    setExpandedCategories((current) => ({
      ...current,
      [value]: !current[value],
    }));
  };

  const jumpToCategory = (value) => {
    const groupIndex = campaignGroups.findIndex((group) => group.value === value);
    if (groupIndex >= INITIAL_CATEGORY_COUNT) setShowAllCategories(true);
    window.setTimeout(() => {
      document.getElementById(`category-${value}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AppHeader minimal />
      <main>
        <section className="border-b border-slate-100 bg-purple-100 px-6 py-16 md:py-24">
          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <span className="rounded-full bg-[#FFF1A8] px-3 py-1.5 text-xs font-extrabold text-[#655000]">
              Givera verified campaigns
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.04em] text-[#201A36] md:text-6xl md:leading-[1.05]">
              Discover campaigns to support
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              People across Myanmar are raising support for the causes that matter most to them.
            </p>

            <div className="mt-9 flex w-full max-w-2xl items-center gap-3 rounded-full border border-slate-300 bg-white px-5 py-4 shadow-[0_8px_30px_rgba(32,26,54,.08)] transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, story, or location..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </section>

        {!isSearching && !loading && (
          <section className="px-6 pt-12 md:pt-16">
            <div className="mx-auto max-w-6xl rounded-[32px] bg-white px-6 py-8 md:px-10 md:py-10">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  {/* <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Find your cause</p> */}
                  <h2 className="mt-2 mb-4 text-2xl font-extrabold tracking-tight text-[#201A36] md:text-5xl">
                    Browse campaign categories
                  </h2>
                </div>
                {/* <p className="text-sm text-slate-500">Choose a category to jump to its campaigns.</p> */}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {visibleCategoryOptions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => jumpToCategory(item.value)}
                    className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-100 px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="font-extrabold text-slate-800">{item.label}</span>
                    {/* <span className="grid h-8 min-w-8 place-items-center rounded-full bg-[#FFF1A8] px-2 text-xs font-extrabold text-[#655000]">
                      {item.count}
                    </span> */}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          {error && (
            <div className="mb-8 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          {loading ? (
            <LoadingGrid />
          ) : isSearching ? (
            campaigns.length ? (
              <div>
                <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Search results</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                      Campaigns matching “{query.trim()}”
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#F0ECFF] px-3 py-1.5 text-xs font-bold text-primary">
                    {campaigns.length} {campaigns.length === 1 ? "campaign" : "campaigns"}
                  </span>
                </div>
                <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                  {campaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState searching />
            )
          ) : campaignGroups.length ? (
            <div>
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                {/* <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Browse by category</p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                    Causes waiting for your support
                  </h2>
                </div> */}
                {/* <p className="max-w-sm text-sm leading-6 text-slate-500">
                  Start with a category, then discover the campaign that speaks to you.
                </p> */}
              </div>

              <div className="divide-y divide-slate-100">
                {visibleGroups.map((group) => {
                  const isExpanded = Boolean(expandedCategories[group.value]);
                  const visibleCampaigns = isExpanded
                    ? group.campaigns
                    : group.campaigns.slice(0, INITIAL_CAMPAIGN_COUNT);
                  const hasMoreCampaigns = group.campaigns.length > INITIAL_CAMPAIGN_COUNT;

                  return (
                    <section id={`category-${group.value}`} key={group.value} className="scroll-mt-6 py-10 first:pt-0">
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* <span className="h-3 w-3 rounded-full bg-[#FFD66B] ring-4 ring-[#FFF7D6]" /> */}
                          <h3 className="text-3xl font-extrabold text-slate-900">{group.label}</h3>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                            {group.campaigns.length}
                          </span>
                        </div>
                        {group.campaigns.length > 0 && (
                          <button
                            type="button"
                            disabled={!hasMoreCampaigns}
                            onClick={() => toggleCategory(group.value)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#DCD3FA] bg-white px-3.5 py-2 text-sm font-extrabold text-primary transition hover:bg-[#F0ECFF] disabled:cursor-default disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
                          >
                            {hasMoreCampaigns
                              ? (isExpanded ? "Show less" : `See ${group.campaigns.length - INITIAL_CAMPAIGN_COUNT} more`)
                              : "All shown"}
                            {hasMoreCampaigns && (isExpanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />)}
                          </button>
                        )}
                      </div>

                      {visibleCampaigns.length ? (
                        <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                          {visibleCampaigns.map((campaign) => (
                            <CampaignCard key={campaign.id} campaign={campaign} />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-10 text-center">
                          <p className="font-bold text-slate-600">No campaigns in this category yet.</p>
                          <p className="mt-1 text-sm text-slate-400">New verified campaigns will appear here.</p>
                        </div>
                      )}
                    </section>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-center border-t border-slate-100 pt-8">
                <button
                  type="button"
                  onClick={() => setShowAllCategories((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#6F52D9] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-[#6044C7]"
                >
                  {showAllCategories
                    ? "Show fewer categories"
                    : `Show ${campaignGroups.length - INITIAL_CATEGORY_COUNT} more categories`}
                  {/* {showAllCategories ? <ChevronUp size={18} /> : <ChevronDown size={18} />} */}
                </button>
              </div>

            </div>
          ) : (
            <EmptyState />
          )}
        </section>
      </main>
    </div>
  );
}
