import { useEffect, useState } from "react";

import api from "../api/axios";
import AppHeader from "../components/AppHeader";
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
    <div className="min-h-screen bg-surface">
      <AppHeader />
      <main>
        <section className="hero-mesh border-b border-outline-variant/30 px-6 py-16">
          <div className="mx-auto max-w-container-max">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">
              Verified causes
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-on-surface md:text-5xl">
              Find a cause that matters to you
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-on-surface-variant">
              Every campaign is reviewed before it becomes visible to donors.
            </p>

            <div className="mt-8 grid max-w-3xl gap-3 rounded-2xl bg-white p-3 shadow-lg sm:grid-cols-[1fr_220px]">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title, story, or location"
                className="rounded-xl border border-outline-variant px-4 py-3 outline-none focus:border-primary"
              />
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-xl border border-outline-variant bg-white px-4 py-3 outline-none focus:border-primary"
              >
                {categories.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-container-max px-6 py-12">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-red-700">{error}</div>
          )}
          {loading ? (
            <p className="py-20 text-center text-on-surface-variant">Loading campaigns…</p>
          ) : campaigns.length ? (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white px-6 py-20 text-center">
              <h2 className="text-2xl font-bold text-on-surface">No campaigns found</h2>
              <p className="mt-2 text-on-surface-variant">
                Try another search or be the first to submit one.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
