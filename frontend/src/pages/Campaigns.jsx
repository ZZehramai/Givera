import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import api from "../api/axios";
import CampaignCard from "../components/CampaignCard";

const categories = [
  ["", "All causes"],
  ["education", "Education"],
  ["medical", "Medical"],
  ["emergency", "Emergency relief"],
  ["community", "Community"],
  ["environment", "Environment"],
  ["animals", "Animals"],
  ["other", "Other"],
];

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/campaigns/", {
          params: { q: query, category },
        });
        setCampaigns(response.data);
      } catch {
        setError("Campaigns could not be loaded. Is the Django server running?");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, category]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main>
        {/* HERO / SEARCH SECTION */}
        <section className="border-b border-slate-100 bg-[#FAF8F5] px-6 py-14 md:py-16">
          <div className="mx-auto max-w-6xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
              Verified Causes
            </p>
            <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Find a cause that matters to you
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium text-slate-600 md:text-base">
              Every campaign is reviewed before it becomes visible to donors.
            </p>

            {/* Search Bar */}
            <div className="mt-8 flex max-w-2xl items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, story, or location..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="mt-6 flex flex-wrap items-center gap-2 pt-2">
              {categories.map(([value, label]) => {
                const isActive = category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(value)}
                    className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* CAMPAIGNS GRID SECTION */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          {error && (
            <div className="mb-8 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse flex flex-col gap-3">
                  <div className="aspect-[16/10] w-full rounded-2xl bg-slate-200" />
                  <div className="h-5 w-3/4 rounded bg-slate-200" />
                  <div className="h-2 w-full rounded-full bg-slate-200 mt-2" />
                  <div className="h-4 w-1/3 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : campaigns.length ? (
            /* Clean Campaign Grid */
            <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-20 text-center">
              <h2 className="text-xl font-bold text-slate-800">No campaigns found</h2>
              <p className="mt-2 text-sm text-slate-500">
                Try another keyword or select a different category.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}