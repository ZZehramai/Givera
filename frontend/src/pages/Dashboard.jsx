import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  Compass,
  Edit3,
  Heart,
  History,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Target,
  UserRound,
  Check,
  X,
} from "lucide-react";

import api from "../api/axios";
import CampaignCard from "../components/CampaignCard";
import { logout } from "../services/authService";
import AdminDashboard from "./AdminDashboard";

const statusColor = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-rose-100 text-rose-700",
  draft: "bg-slate-100 text-slate-600",
  completed: "bg-violet-100 text-violet-700",
};

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

// Updated Sidebar Items including "History"
const sidebarItems = [
  { section: "overview", label: "Overview", icon: LayoutDashboard },
  { section: "browse", label: "Browse campaigns", icon: Compass },
  { section: "my-campaigns", label: "My campaigns", icon: Megaphone, badge: "2" },
  { section: "history", label: "History", icon: History },
  { section: "profile", label: "Profile & settings", icon: Settings },
];

/* SIDEBAR MATCHING REFERENCE UI */
function DashboardSidebar({ onLogout, activeSection, onSectionChange, counts }) {
  return (
    <aside className="lg:sticky lg:top-4 lg:self-start">
      <div className="relative flex flex-col rounded-[2rem] bg-[#5B50BC] py-6 text-white shadow-xl lg:min-h-[calc(100vh-2rem)]">
        {/* LOGO */}
        <div className="flex items-center justify-between px-6 pb-6">
          <Link to="/" className="text-2xl font-black tracking-wider text-white">
            GIVERA
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl p-2 text-white/70 hover:bg-white/10 lg:hidden"
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex flex-col space-y-1">
          {sidebarItems.map(({ section, label, icon: Icon, badge }) => {
            const isActive = activeSection === section;
            const badgeValue =
              section === "my-campaigns"
                ? counts.myCampaigns
                : section === "history"
                ? counts.history
                : badge;

            return (
              <div key={section} className="relative pl-3">
                {/* INVERTED CORNER GRAPHICS FOR ACTIVE ITEM */}
                {isActive && (
                  <>
                    <div className="absolute right-0 -top-4 h-4 w-4 bg-[#f7f7fb]">
                      <div className="h-full w-full rounded-br-2xl bg-[#5B50BC]" />
                    </div>
                    <div className="absolute right-0 -bottom-4 h-4 w-4 bg-[#f7f7fb]">
                      <div className="h-full w-full rounded-tr-2xl bg-[#5B50BC]" />
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => onSectionChange(section)}
                  className={`relative flex w-full items-center gap-3.5 px-5 py-3.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "rounded-l-full bg-[#f7f7fb] text-slate-900 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-[#5B50BC]" : "text-white/80"} />
                  <span className="flex-1 text-left">{label}</span>

                  {/* BADGE COUNT */}
                  {badgeValue !== undefined && badgeValue !== null && (
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                        isActive
                          ? "bg-[#5B50BC]/10 text-[#5B50BC]"
                          : "bg-white/20 text-white"
                      }`}
                    >
                      {badgeValue}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="mt-auto px-6 pt-6 hidden lg:block">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}

function DonutChart({ value, label }) {
  const progress = Math.max(0, Math.min(value, 100));
  return (
    <div
      className="relative grid h-36 w-36 place-items-center rounded-full"
      style={{ background: `conic-gradient(#5B50BC ${progress * 3.6}deg, #ebe2ff 0deg)` }}
    >
      <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
        <div>
          <p className="text-2xl font-extrabold">{Math.round(progress)}%</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function HistoryPanel({ donations, campaigns }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-[2rem] bg-white p-7 shadow-sm border border-slate-100">
        <h1 className="text-2xl font-extrabold text-slate-900">Activity History</h1>
        <p className="mt-1 text-sm text-slate-500">Track your past contributions and completed campaigns.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* DONATIONS HISTORY */}
        <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Heart size={18} className="text-[#5B50BC]" /> Donation History
          </h2>
          {donations.length ? (
            <div className="space-y-3">
              {donations.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold text-slate-800">{item.campaign?.title || "Supported Campaign"}</p>
                    <p className="text-xs text-slate-400">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}</p>
                  </div>
                  <span className="font-bold text-[#5B50BC]">{money(item.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No donation history available yet.</p>
          )}
        </div>

        {/* CAMPAIGNS CREATED HISTORY */}
        <div className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Megaphone size={18} className="text-[#5B50BC]" /> Created Campaigns
          </h2>
          {campaigns.length ? (
            <div className="space-y-3">
              {campaigns.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-400">Raised {money(item.amount_raised)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor[item.status] || statusColor.draft}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No created campaigns history yet.</p>
          )}
        </div>
      </div>
    </motion.section>
  );
}

function BrowseCampaigns({ campaigns, loading }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const filteredCampaigns = useMemo(() => {
    const term = query.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const searchable = [campaign.title, campaign.summary, campaign.story, campaign.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return (!term || searchable.includes(term)) && (!category || campaign.category === category);
    });
  }, [campaigns, query, category]);

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="relative overflow-hidden rounded-[2rem] bg-[#5B50BC] p-7 text-white shadow-md md:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">Verified causes</p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Browse campaigns</h1>
        <p className="mt-3 max-w-2xl leading-7 text-white/80">Find a cause that matters to you, without leaving your dashboard.</p>
        <div className="mt-7 grid gap-3 rounded-2xl bg-white p-3 text-slate-800 sm:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-[#5B50BC]">
            <Search size={18} className="text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search campaigns" className="min-w-0 flex-1 outline-none" />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#5B50BC]">
            <option value="">All causes</option>
            <option value="education">Education</option>
            <option value="medical">Medical</option>
            <option value="emergency">Emergency relief</option>
            <option value="community">Community</option>
            <option value="environment">Environment</option>
            <option value="animals">Animals</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="mt-7">
        {loading ? (
          <p className="py-20 text-center text-slate-500">Loading campaigns…</p>
        ) : filteredCampaigns.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white px-6 py-20 text-center">
            <h2 className="text-2xl font-bold text-slate-800">No campaigns found</h2>
            <p className="mt-2 text-slate-500">Try another search or category.</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}

function MyCampaignsPanel({ campaigns, loading }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="relative overflow-hidden rounded-[2rem] bg-[#5B50BC] p-7 text-white shadow-md md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">Organizer area</p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">My campaigns</h1>
        </div>
        <Link to="/campaigns/create" className="rounded-full bg-white px-5 py-3 font-bold text-[#5B50BC] shadow-md hover:bg-slate-50">
          Request Campaign
        </Link>
      </div>
      {loading ? (
        <p className="py-20 text-center text-slate-500">Loading campaigns…</p>
      ) : campaigns.length ? (
        <div className="mt-7 space-y-4">
          {campaigns.map((campaign) => (
            <article key={campaign.id} className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-800">{campaign.title}</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor[campaign.status] || statusColor.draft}`}>
                    {campaign.status_label || campaign.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{campaign.summary}</p>
                {campaign.rejection_reason && (
                  <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
                    <strong>Review note:</strong> {campaign.rejection_reason}
                  </p>
                )}
              </div>
              <Link to={`/campaigns/${campaign.id}`} className="font-semibold text-[#5B50BC] hover:underline">
                View details →
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-3xl bg-white px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-800">You have not submitted a campaign yet</h2>
          <p className="mt-2 text-slate-500">Tell your story and send it to the review team.</p>
        </div>
      )}
    </motion.section>
  );
}

function ProfilePanel({ onLogout }) {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", phone_number: "", country: "" });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/auth/profile/")
      .then((response) => {
        setUser(response.data);
        setForm({
          username: response.data.username || "",
          email: response.data.email || "",
          phone_number: response.data.phone_number || "",
          country: response.data.country || "",
        });
      })
      .catch(() => setMessage("Your profile could not be loaded."));
  }, []);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await api.patch("/auth/profile/", form);
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      window.dispatchEvent(new Event("userUpdated"));
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch {
      setMessage("Profile could not be updated.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <p className="py-20 text-center text-slate-500">{message || "Loading profile…"}</p>;
  const fields = [
    ["Name", "username", "text", UserRound],
    ["Email", "email", "email", Mail],
    ["Phone", "phone_number", "tel", Phone],
    ["Location", "country", "text", MapPin],
  ];
  const initial = user.username?.trim().charAt(0).toUpperCase() || "G";
  const success = message === "Profile updated successfully.";

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#5B50BC]">Account centre</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl text-slate-900">Your profile</h1>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5B50BC] px-5 py-3 text-sm font-bold text-white shadow-md"
          >
            <Edit3 size={16} /> Edit details
          </button>
        )}
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[235px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[1.75rem] bg-[#5B50BC] text-white shadow-md">
          <div className="relative px-6 pb-7 pt-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-2xl font-extrabold text-[#5B50BC]">
              {initial}
            </div>
            <h2 className="mt-4 truncate text-lg font-extrabold">{user.name}</h2>
            <p className="mt-1 truncate text-sm text-white/70">{user.email}</p>
          </div>
        </aside>

        <section className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">Personal information</h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <ShieldCheck size={15} /> Account verified
            </div>
          </div>
          <div className="px-6 py-3">
            {fields.map(([label, name, type, Icon]) => (
              <div key={name} className="grid gap-2 border-b border-slate-100 py-5 last:border-none md:grid-cols-[145px_minmax(0,1fr)] md:items-center">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <Icon size={17} className="text-[#5B50BC]" /> {label}
                </div>
                {editing ? (
                  <input
                    type={type}
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold outline-none focus:border-[#5B50BC]"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">{user[name] || "Not provided"}</p>
                )}
              </div>
            ))}
          </div>
          {editing && (
            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4">
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm font-bold text-slate-500">
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="rounded-full bg-[#5B50BC] px-6 py-2 text-sm font-bold text-white shadow-sm">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          )}
        </section>
      </div>
    </motion.section>
  );
}

function UserDashboard() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const [owned, setOwned] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [donated, setDonated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    Promise.allSettled([
      api.get("/campaigns/mine/"),
      api.get("/campaigns/"),
      api.get("/donations/mine/"),
    ]).then(([ownedResult, discoverResult, donatedResult]) => {
      if (ownedResult.status === "fulfilled") setOwned(ownedResult.value.data);
      if (discoverResult.status === "fulfilled") setDiscover(discoverResult.value.data);
      if (donatedResult.status === "fulfilled") setDonated(donatedResult.value.data);
      setLoading(false);
    });
  }, []);

  const metrics = useMemo(() => {
    const raised = owned.reduce((sum, item) => sum + Number(item.amount_raised || 0), 0);
    const goal = owned.reduce((sum, item) => sum + Number(item.goal_amount || 0), 0);
    const active = owned.filter((item) => item.status === "approved").length;
    const donatedAmount = donated.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return { raised, goal, active, donatedAmount, progress: goal ? (raised / goal) * 100 : 0 };
  }, [owned, donated]);

  const firstName = storedUser?.first_name || storedUser?.username || "there";
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#f7f7fb]">
      <div className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 lg:grid lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-8">
        <DashboardSidebar
          onLogout={handleLogout}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          counts={{ myCampaigns: owned.length, history: donated.length }}
        />

        <main className="mt-6 min-w-0 lg:mt-0">
          {activeSection === "browse" ? (
            <BrowseCampaigns campaigns={discover} loading={loading} />
          ) : activeSection === "my-campaigns" ? (
            <MyCampaignsPanel campaigns={owned} loading={loading} />
          ) : activeSection === "history" ? (
            <HistoryPanel donations={donated} campaigns={owned} />
          ) : activeSection === "profile" ? (
            <ProfilePanel onLogout={handleLogout} />
          ) : (
            <>
              {/* OVERVIEW HERO */}
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative flex overflow-hidden flex-col gap-6 rounded-[2rem] bg-[#5B50BC] p-7 text-white shadow-md md:flex-row md:items-center md:justify-between md:p-10"
              >
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">
                    Your Givera home
                  </p>
                  <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
                    Welcome back, {firstName}.
                  </h1>
                  <p className="mt-3 max-w-xl leading-7 text-white/80">
                    Discover causes, manage your campaigns, and follow the impact you help create.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSection("browse")}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-[#5B50BC] shadow-sm"
                  >
                    <Compass size={18} /> Browse
                  </button>
                  <Link
                    to="/campaigns/create"
                    className="inline-flex items-center gap-2 rounded-full bg-white/20 border border-white/30 px-5 py-3 font-bold text-white hover:bg-white/30"
                  >
                    <Plus size={18} /> Request Campaign
                  </Link>
                </div>
              </motion.section>

              {/* STATS OVERVIEW CARDS */}
              <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  [CircleDollarSign, "Raised by your campaigns", money(metrics.raised)],
                  [Target, "Combined campaign goals", money(metrics.goal)],
                  [BarChart3, "Active campaigns", metrics.active],
                  [Heart, "Your total donations", money(metrics.donatedAmount)],
                ].map(([Icon, label, value], index) => (
                  <motion.article
                    key={label}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index }}
                    className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                  >
                    <span className="inline-grid rounded-xl p-2.5 bg-[#5B50BC]/10 text-[#5B50BC]">
                      <Icon size={21} />
                    </span>
                    <p className="mt-5 text-sm text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-extrabold text-slate-900">
                      {loading ? "—" : value}
                    </p>
                  </motion.article>
                ))}
              </section>

              {/* CAMPAIGN PERFORMANCE CHART */}
              <section className="mt-7 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#5B50BC]">CAMPAIGN PERFORMANCE</p>
                      <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Funds raised</h2>
                    </div>
                    <BarChart3 className="text-[#5B50BC]" />
                  </div>
                  <div className="mt-8 space-y-5">
                    {owned.length ? (
                      owned.slice(0, 5).map((campaign) => {
                        const percentage = Math.min(Number(campaign.progress_percentage || 0), 100);
                        return (
                          <div key={campaign.id}>
                            <div className="mb-2 flex justify-between gap-4 text-sm">
                              <span className="truncate font-semibold text-slate-800">{campaign.title}</span>
                              <span className="shrink-0 text-slate-500">{money(campaign.amount_raised)}</span>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full rounded-full bg-[#5B50BC]"
                              />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="py-12 text-center text-slate-400">Create a campaign to see performance charts.</p>
                    )}
                  </div>
                </article>
                <article className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-sm">
                  <DonutChart value={metrics.progress} label="of goal" />
                  <h2 className="mt-5 text-xl font-extrabold text-slate-900">Overall progress</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {money(metrics.raised)} raised across {owned.length} campaign{owned.length === 1 ? "" : "s"}.
                  </p>
                </article>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  return storedUser?.role === "admin" || storedUser?.is_staff ? (
    <AdminDashboard />
  ) : (
    <UserDashboard />
  );
}