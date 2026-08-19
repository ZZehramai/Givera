import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
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
  Smartphone,
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
  pending: "bg-amber-100 text-amber-800",
  rejected: "bg-rose-100 text-rose-700",
  draft: "bg-slate-100 text-slate-600",
  completed: "bg-amber-100 text-amber-900",
};

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

/* SIDEBAR UPDATED TO MATCH ADMIN DASHBOARD STYLE WITH PURPLE THEME */
function DashboardSidebar({ onLogout, activeSection, onSectionChange, counts }) {
  const items = [
    ["overview", "Overview", LayoutDashboard],
    ["browse", "Browse campaigns", Compass],
    ["my-campaigns", "My campaigns", Megaphone],
    ["history", "History", History],
    ["profile", "Profile & settings", Settings]
  ];

  return (
    <aside className="lg:sticky lg:top-4 lg:self-start">
      <div className="flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-[0_18px_45px_rgba(41,35,80,.09)] lg:h-[calc(100vh-2rem)]">
        {/* LOGO */}
        <div className="border-b border-slate-100 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#6F52D9] text-lg font-black text-white">G</div>
            <div>
              <p className="text-xl font-extrabold tracking-tight text-[#24184a]">Givera</p>
              <p className="text-xs font-medium text-slate-400">User workspace</p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-1 px-3 py-4">
          {items.map(([section, label, Icon]) => {
            const isActive = activeSection === section;
            const badgeValue =
              section === "my-campaigns"
                ? counts.myCampaigns
                : section === "history"
                ? counts.history
                : null;

            return (
              <button
                key={section}
                type="button"
                onClick={() => onSectionChange(section)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                  isActive
                    ? "bg-[#F0ECFF] text-[#6549C9]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#6549C9]"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>

                {badgeValue !== undefined && badgeValue !== null && badgeValue > 0 && (
                  <span
                    className={`grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-xs ${
                      isActive
                        ? "bg-[#6F52D9] text-white"
                        : "bg-[#E9E2FF] text-[#6549C9]"
                    }`}
                  >
                    {badgeValue}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="mt-auto border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={17} /> Sign out
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
      style={{ background: `conic-gradient(#6F52D9 ${progress * 3.6}deg, #F0ECFF 0deg)` }}
    >
      <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center shadow-inner">
        <div>
          <p className="text-2xl font-extrabold text-[#6F52D9]">{Math.round(progress)}%</p>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

function HistoryPanel({ donations, campaigns, demoPayments }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
        <h1 className="text-2xl font-extrabold text-slate-900">Activity History</h1>
        <p className="mt-1 text-sm text-slate-500">Track your past contributions and completed campaigns.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)] space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Heart size={18} className="text-rose-500" /> Donation History
          </h2>
          {donations.length ? (
            <div className="space-y-3">
              {donations.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                  <div>
                    <p className="font-semibold text-slate-800">{item.campaign?.title || "Supported Campaign"}</p>
                    <p className="text-xs text-slate-400">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}</p>
                  </div>
                  <span className="font-bold text-[#6549C9]">{money(item.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No donation history available yet.</p>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)] space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Megaphone size={18} className="text-[#6F52D9]" /> Created Campaigns
          </h2>
          {campaigns.length ? (
            <div className="space-y-3">
              {campaigns.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
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
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)] space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Smartphone size={18} className="text-[#6F52D9]" /> Demo Payment Activity</h2>
        <p className="text-sm text-slate-500">Sandbox records only — no money was transferred.</p>
        {demoPayments.length ? <div className="space-y-3">{demoPayments.map((payment) => <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4"><div><p className="font-semibold text-slate-800">{payment.provider_label}</p><p className="text-xs text-slate-400">{payment.transaction_reference}</p></div><div className="text-right"><p className="font-bold text-[#6549C9]">{Number(payment.amount).toLocaleString()} Ks</p><span className={`text-xs font-bold ${payment.status === "paid" ? "text-emerald-700" : payment.status === "pending" ? "text-amber-700" : "text-rose-600"}`}>{payment.status}</span></div></div>)}</div> : <p className="py-5 text-center text-sm text-slate-400">No demo payment activity yet.</p>}
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
      <div className="relative overflow-hidden rounded-3xl bg-[#25194B] p-7 text-white shadow-xl shadow-violet-950/15 md:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#FFD66B]">Verified causes</p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Browse campaigns</h1>
        <p className="mt-3 max-w-2xl leading-7 text-indigo-100">Find a cause that matters to you, without leaving your dashboard.</p>
        <div className="mt-7 grid gap-3 rounded-2xl bg-white p-3 text-slate-800 sm:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-[#7A5BE6]">
            <Search size={18} className="text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search campaigns" className="min-w-0 flex-1 outline-none" />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#7A5BE6]">
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
          <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-20 text-center shadow-[0_12px_30px_rgba(43,37,80,.06)]">
            <h2 className="text-2xl font-bold text-slate-800">No campaigns found</h2>
            <p className="mt-2 text-slate-500">Try another search or category.</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}

function MyCampaignsPanel({
  campaigns,
  loading,
  submittedId,
  submissionMessage,
  campaignTitle,
  onDismissSubmission,
  onViewSubmission,
  onBackToDashboard,
}) {
  const submittedCampaign = campaigns.find(
    (campaign) => String(campaign.id) === String(submittedId)
  );

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="relative overflow-hidden rounded-3xl bg-[#25194B] p-7 text-white shadow-xl shadow-violet-950/15 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#FFD66B]">
            Organizer area
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">My campaigns</h1>
        </div>
        <Link
          to="/campaigns/create"
          className="rounded-2xl bg-[#FFD66B] px-5 py-3 font-extrabold text-[#2b1d52] shadow-lg shadow-black/10 transition"
        >
          Request Campaign
        </Link>
      </div>

      {submittedId && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mt-7 overflow-hidden rounded-3xl border border-emerald-200 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)] md:p-7"
        >
          <button
            type="button"
            onClick={onDismissSubmission}
            aria-label="Dismiss confirmation"
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
          <div className="flex gap-4 pr-10">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Check size={24} strokeWidth={3} />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-emerald-700">
                Request received
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                {submissionMessage || "Campaign submitted successfully"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                <strong>{submittedCampaign?.title || campaignTitle || "Your campaign"}</strong> is now pending administrator review. You’ll receive a notification when it is approved or needs changes.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["1", "Submitted", "Complete"],
              ["2", "Admin review", "In progress"],
              ["3", "Decision", "You’ll be notified"],
            ].map(([number, label, note], index) => (
              <div
                key={label}
                className={`rounded-2xl border p-4 ${
                  index === 0
                    ? "border-emerald-200 bg-emerald-50"
                    : index === 1
                    ? "border-amber-200 bg-amber-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-xs font-extrabold ${
                      index === 0
                        ? "bg-emerald-600 text-white"
                        : index === 1
                        ? "bg-amber-400 text-amber-950"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {index === 0 ? <Check size={14} strokeWidth={3} /> : number}
                  </span>
                  <p className="font-bold text-slate-800">{label}</p>
                </div>
                <p className="ml-10 mt-1 text-xs text-slate-500">{note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onViewSubmission}
              className="inline-flex items-center gap-2 rounded-xl bg-[#6F52D9] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20"
            >
              View submitted campaign <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:border-[#7A5BE6] hover:text-[#6549C9]"
            >
              Back to dashboard
            </button>
          </div>
        </motion.section>
      )}

      <div className="mt-7">
        {loading ? (
          <p className="py-20 text-center text-slate-500">Loading campaigns…</p>
        ) : campaigns.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="relative">
                <CampaignCard campaign={campaign} />

                {campaign.rejection_reason && (
                  <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                    <p>
                      <strong>Why it was rejected:</strong> {campaign.rejection_reason}
                    </p>
                    <Link
                      to={`/campaigns/${campaign.id}/edit`}
                      className="mt-2 inline-block rounded-xl bg-[#6F52D9] px-4 py-2 text-xs font-bold text-white"
                    >
                      Fix and resubmit
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-20 text-center shadow-[0_12px_30px_rgba(43,37,80,.06)]">
            <h2 className="text-2xl font-bold text-slate-800">
              You have not submitted a campaign yet
            </h2>
            <p className="mt-2 text-slate-500">
              Tell your story and send it to the review team.
            </p>
          </div>
        )}
      </div>
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

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#6F52D9]">Account centre</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl text-slate-900">Your profile</h1>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6F52D9] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20"
          >
            <Edit3 size={16} /> Edit details
          </button>
        )}
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[235px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-slate-800 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
          <div className="relative px-6 pb-7 pt-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#6F52D9] text-2xl font-extrabold text-white">
              {initial}
            </div>
            <h2 className="mt-4 truncate text-lg font-extrabold text-slate-900">{user.username}</h2>
            <p className="mt-1 truncate text-sm text-slate-500">{user.email}</p>
          </div>
        </aside>

        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(43,37,80,.06)]">
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
                  <Icon size={17} className="text-[#6F52D9]" /> {label}
                </div>
                {editing ? (
                  <input
                    type={type}
                    value={form[name]}
                    onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold outline-none focus:border-[#7A5BE6]"
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
              <button onClick={save} disabled={saving} className="rounded-xl bg-[#6F52D9] px-6 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/20">
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
  const location = useLocation();
  const initialParams = new URLSearchParams(location.search);
  const submittedId = initialParams.get("submitted");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const [owned, setOwned] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [donated, setDonated] = useState([]);
  const [demoPayments, setDemoPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(initialParams.get("section") || "overview");
  const [showSubmissionSuccess, setShowSubmissionSuccess] = useState(Boolean(submittedId));

  useEffect(() => {
    Promise.allSettled([
      api.get("/campaigns/mine/"),
      api.get("/campaigns/"),
      api.get("/donations/mine/"),
      api.get("/donations/demo-checkout/mine/"),
    ]).then(([ownedResult, discoverResult, donatedResult, demoPaymentsResult]) => {
      if (ownedResult.status === "fulfilled") setOwned(ownedResult.value.data);
      if (discoverResult.status === "fulfilled") setDiscover(discoverResult.value.data);
      if (donatedResult.status === "fulfilled") setDonated(donatedResult.value.data);
      if (demoPaymentsResult.status === "fulfilled") setDemoPayments(demoPaymentsResult.value.data);
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

  const clearSubmissionConfirmation = () => {
    setShowSubmissionSuccess(false);
    navigate("/dashboard?section=my-campaigns", { replace: true, state: {} });
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (section !== "my-campaigns") setShowSubmissionSuccess(false);
  };

  const backToDashboard = () => {
    setShowSubmissionSuccess(false);
    setActiveSection("overview");
    navigate("/dashboard", { replace: true, state: {} });
  };

  const viewSubmittedCampaign = () => {
    setShowSubmissionSuccess(false);
    navigate(`/campaigns/${submittedId}`, { replace: true, state: {} });
  };

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-slate-900">
      <div className="mx-auto max-w-[1500px] p-4 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        <DashboardSidebar
          onLogout={handleLogout}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          counts={{ myCampaigns: owned.length, history: donated.length }}
        />

        <main className="min-w-0 py-6 lg:py-4">
          {activeSection === "browse" ? (
            <BrowseCampaigns campaigns={discover} loading={loading} />
          ) : activeSection === "my-campaigns" ? (
            <MyCampaignsPanel
              campaigns={owned}
              loading={loading}
              submittedId={showSubmissionSuccess ? submittedId : null}
              submissionMessage={location.state?.submissionMessage}
              campaignTitle={location.state?.campaignTitle}
              onDismissSubmission={clearSubmissionConfirmation}
              onViewSubmission={viewSubmittedCampaign}
              onBackToDashboard={backToDashboard}
            />
          ) : activeSection === "history" ? (
            <HistoryPanel donations={donated} campaigns={owned} demoPayments={demoPayments} />
          ) : activeSection === "profile" ? (
            <ProfilePanel onLogout={handleLogout} />
          ) : (
            <>
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative flex overflow-hidden flex-col gap-6 rounded-3xl bg-[#25194B] p-7 text-white shadow-xl shadow-violet-950/15 md:flex-row md:items-center md:justify-between md:p-9"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-[#D7C8FF]">
                    Your Givera home
                  </p>
                  <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                    Welcome back, {firstName}.
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100">
                    Discover causes, manage your campaigns, and follow the impact you help create.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSection("browse")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-[#2b1d52] shadow-lg shadow-black/10 transition"
                  >
                    <Compass size={18} /> Browse
                  </button>
                  <Link
                    to="/campaigns/create"
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#FFD66B] px-5 py-3 text-sm font-extrabold text-[#2b1d52] shadow-lg shadow-black/10 transition"
                  >
                    <Plus size={18} /> Request Campaign
                  </Link>
                </div>
              </motion.section>

              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { Icon: CircleDollarSign, label: "Raised by your campaigns", value: money(metrics.raised), tone: "bg-violet-100 text-[#6549C9]" },
                  { Icon: Target, label: "Combined campaign goals", value: money(metrics.goal), tone: "bg-emerald-100 text-emerald-700" },
                  { Icon: BarChart3, label: "Active campaigns", value: metrics.active, tone: "bg-amber-100 text-amber-700" },
                  { Icon: Heart, label: "Your total donations", value: money(metrics.donatedAmount), tone: "bg-sky-100 text-sky-700" },
                ].map(({ Icon, label, value, tone }, index) => (
                  <motion.article
                    key={label}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index }}
                    className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_30px_rgba(43,37,80,.06)]"
                  >
                    <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>
                      <Icon size={21} />
                    </span>
                    <p className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">
                      {loading ? "—" : value}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-700">{label}</p>
                  </motion.article>
                ))}
              </section>

              <section className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#6F52D9]">CAMPAIGN PERFORMANCE</p>
                      <h2 className="mt-2 text-xl font-extrabold text-slate-900">Funds raised</h2>
                    </div>
                    <div className="rounded-xl bg-violet-50 p-2.5 text-[#6F52D9]">
                      <BarChart3 size={20} />
                    </div>
                  </div>
                  <div className="mt-8 space-y-5">
                    {owned.length ? (
                      owned.slice(0, 5).map((campaign) => {
                        const percentage = Math.min(Number(campaign.progress_percentage || 0), 100);
                        return (
                          <div key={campaign.id}>
                            <div className="mb-2 flex justify-between gap-4 text-sm">
                              <span className="truncate font-bold text-slate-700">{campaign.title}</span>
                              <span className="shrink-0 font-bold text-[#6549C9]">{money(campaign.amount_raised)}</span>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8 }}
                                className="h-full rounded-full bg-[#7A5BE6]"
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
                <article className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-[0_12px_30px_rgba(43,37,80,.06)]">
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