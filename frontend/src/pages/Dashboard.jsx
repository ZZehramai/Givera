import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  CircleDollarSign,
  CircleUserRound,
  Compass,
  Edit3,
  LayoutDashboard,
  Heart,
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

const sidebarItems = [
  { section: "overview", label: "Overview", icon: LayoutDashboard },
  { section: "browse", label: "Browse campaigns", icon: Compass },
  { section: "my-campaigns", label: "My campaigns", icon: Megaphone },
  { section: "profile", label: "Profile & settings", icon: Settings },
];

function DashboardSidebar({ firstName, user, onLogout, activeSection, onSectionChange }) {
  const navClass = (isActive) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
      isActive
        ? "bg-primary text-white shadow-[0_8px_18px_rgba(118,87,217,0.22)]"
        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
    }`;

  return (
    <aside className="lg:sticky lg:top-4 lg:self-start">
      <div className="flex flex-col rounded-3xl border border-white/80 bg-white/90 p-3 shadow-[0_18px_50px_rgba(40,35,62,0.08)] backdrop-blur lg:min-h-[calc(100vh-2rem)] lg:p-4">
        <div className="flex w-full items-center justify-between gap-4 border-b border-outline-variant/50 px-2 pb-3 lg:block lg:pb-5">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-extrabold text-primary">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
              <Heart size={18} fill="currentColor" aria-hidden="true" />
            </span>
            Givera
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="inline-grid h-9 w-9 place-items-center rounded-xl text-on-surface-variant transition hover:bg-rose-50 hover:text-rose-600 lg:hidden"
            aria-label="Log out"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="hidden items-center gap-3 border-b border-outline-variant/50 px-2 py-5 lg:flex">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-lg font-extrabold text-white">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold">{user?.username || firstName}</p>
            <p className="truncate text-xs text-on-surface-variant">{user?.email || "Givera member"}</p>
          </div>
        </div>

        <nav aria-label="Dashboard navigation" className="mt-3 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {sidebarItems.map(({ to, section, label, icon: Icon }) =>
            section ? (
              <button
                key={section}
                type="button"
                onClick={() => onSectionChange(section)}
                className={`${navClass(activeSection === section)} text-left`}
                aria-current={activeSection === section ? "page" : undefined}
              >
                <Icon size={18} aria-hidden="true" />
                <span className="whitespace-nowrap">{label}</span>
                <ChevronRight size={16} aria-hidden="true" className="ml-auto hidden opacity-0 transition group-hover:opacity-100 lg:block" />
              </button>
            ) : (
              <Link key={to} to={to} className={navClass(false)}>
                <Icon size={18} aria-hidden="true" />
                <span className="whitespace-nowrap">{label}</span>
                <ChevronRight size={16} aria-hidden="true" className="ml-auto hidden opacity-0 transition group-hover:opacity-100 lg:block" />
              </Link>
            ),
          )}
        </nav>

        <div className="mt-auto hidden pt-5 lg:block">
          
          <button
            type="button"
            onClick={onLogout}
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface-variant transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={18} aria-hidden="true" />
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
    <div className="relative grid h-36 w-36 place-items-center rounded-full" style={{ background: `conic-gradient(#7657d9 ${progress * 3.6}deg, #ebe2ff 0deg)` }}>
      <div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center">
        <div><p className="text-2xl font-extrabold">{Math.round(progress)}%</p><p className="text-xs text-on-surface-variant">{label}</p></div>
      </div>
    </div>
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
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-on-surface via-[#3a2b6a] to-primary p-7 text-white shadow-[0_22px_45px_rgba(73,48,143,0.2)] md:p-10">
        <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary-fixed">Verified causes</p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Browse campaigns</h1>
        <p className="mt-3 max-w-2xl leading-7 text-white/65">Find a cause that matters to you, without leaving your dashboard.</p>
        <div className="mt-7 grid gap-3 rounded-2xl bg-white p-3 text-on-surface sm:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-2 rounded-xl border border-outline-variant px-4 py-3 focus-within:border-primary">
            <Search size={18} className="text-on-surface-variant" aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search campaigns" className="min-w-0 flex-1 outline-none" />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-outline-variant bg-white px-4 py-3 outline-none focus:border-primary">
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
        {loading ? <p className="py-20 text-center text-on-surface-variant">Loading campaigns…</p> : filteredCampaigns.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{filteredCampaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}</div>
        ) : <div className="rounded-3xl bg-white px-6 py-20 text-center"><h2 className="text-2xl font-bold">No campaigns found</h2><p className="mt-2 text-on-surface-variant">Try another search or category.</p></div>}
      </div>
    </motion.section>
  );
}

function MyCampaignsPanel({ campaigns, loading }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-on-surface via-[#3a2b6a] to-primary p-7 text-white shadow-[0_22px_45px_rgba(73,48,143,0.2)] md:p-10">
        <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
        <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary-fixed">Organizer area</p><h1 className="mt-2 text-3xl font-extrabold md:text-4xl">My campaigns</h1></div>
        <Link to="/campaigns/create" className="rounded-full bg-secondary-container px-5 py-3 font-bold text-on-secondary-container">Create campaign</Link>
      </div>
      {loading ? <p className="py-20 text-center text-on-surface-variant">Loading campaigns…</p> : campaigns.length ? (
        <div className="mt-7 space-y-4">{campaigns.map((campaign) => (
          <article key={campaign.id} className="grid gap-4 rounded-2xl border border-outline-variant/60 bg-white p-6 md:grid-cols-[1fr_auto] md:items-center">
            <div><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-bold">{campaign.title}</h2><span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor[campaign.status] || statusColor.draft}`}>{campaign.status_label || campaign.status}</span></div><p className="mt-2 text-sm text-on-surface-variant">{campaign.summary}</p>{campaign.rejection_reason && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"><strong>Review note:</strong> {campaign.rejection_reason}</p>}</div>
            <Link to={`/campaigns/${campaign.id}`} className="font-semibold text-primary hover:underline">View details →</Link>
          </article>
        ))}</div>
      ) : <div className="mt-7 rounded-3xl bg-white px-6 py-20 text-center"><h2 className="text-2xl font-bold">You have not submitted a campaign yet</h2><p className="mt-2 text-on-surface-variant">Tell your story and send it to the review team.</p></div>}
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
    api.get("/auth/profile/").then((response) => {
      setUser(response.data);
      setForm({ username: response.data.username || "", email: response.data.email || "", phone_number: response.data.phone_number || "", country: response.data.country || "" });
    }).catch(() => setMessage("Your profile could not be loaded.")).finally(() => {});
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
    } catch { setMessage("Profile could not be updated."); } finally { setSaving(false); }
  };

  if (!user) return <p className="py-20 text-center text-on-surface-variant">{message || "Loading profile…"}</p>;
  const fields = [
    ["Name", "username", "text", UserRound],
    ["Email", "email", "email", Mail],
    ["Phone", "phone_number", "tel", Phone],
    ["Location", "country", "text", MapPin],
  ];
  const initial = user.username?.trim().charAt(0).toUpperCase() || "G";
  const success = message === "Profile updated successfully.";
  const cancel = () => {
    setForm({ username: user.username || "", email: user.email || "", phone_number: user.phone_number || "", country: user.country || "" });
    setEditing(false);
    setMessage("");
  };

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Account centre</p><h1 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] md:text-4xl">Your profile</h1><p className="mt-2 text-sm text-on-surface-variant">Manage the details connected to your Givera account.</p></div>
        {!editing && <button type="button" onClick={() => { setMessage(""); setForm({ username: user.username || "", email: user.email || "", phone_number: user.phone_number || "", country: user.country || "" }); setEditing(true); }} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_10px_22px_rgba(118,87,217,0.25)]"><Edit3 size={16} />Edit details</button>}
      </div>
      <div className="grid items-start gap-6 md:grid-cols-[235px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[1.75rem] bg-on-surface text-white shadow-[0_18px_42px_rgba(41,35,62,0.15)]">
          <div className="relative overflow-hidden bg-primary px-6 pb-7 pt-6"><div className="absolute -right-9 -top-10 h-32 w-32 rounded-full border-[16px] border-white/15" /><div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-white text-2xl font-extrabold text-primary">{initial}</div><h2 className="relative mt-4 truncate text-lg font-extrabold">{user.username}</h2><p className="relative mt-1 truncate text-sm text-white/70">{user.email}</p></div>
          <div className="p-4"><p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Profile settings</p><div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-3 text-sm font-bold"><CircleUserRound size={18} className="text-secondary-fixed" />Personal details</div><button type="button" onClick={onLogout} className="mt-4 flex w-full items-center gap-2 border-t border-white/10 px-2 pt-4 text-sm font-bold text-white/65 transition hover:text-white"><LogOut size={17} />Log out</button></div>
        </aside>
        <section className="overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[0_12px_30px_rgba(40,35,62,0.06)]">
          <div className="flex flex-col gap-3 border-b border-outline-variant/60 px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8"><div><h2 className="text-xl font-extrabold">Personal information</h2><p className="mt-1 text-sm text-on-surface-variant">{editing ? "Make your changes below, then save when you’re ready." : "Your basic contact and location details."}</p></div><div className="inline-flex w-fit items-center gap-2 rounded-full bg-tertiary-container px-3 py-1.5 text-xs font-bold text-[#176b5b]"><ShieldCheck size={15} />Account verified</div></div>
          <div className="px-6 py-3 md:px-8">{fields.map(([label, name, type, Icon]) => <div key={name} className="grid gap-2 border-b border-outline-variant/45 py-5 last:border-none md:grid-cols-[145px_minmax(0,1fr)] md:items-center md:gap-6"><div className="flex items-center gap-3 text-sm font-bold text-on-surface-variant"><span className="grid h-9 w-9 place-items-center rounded-lg bg-surface-container-low text-primary"><Icon size={17} /></span>{label}</div>{editing ? <input type={type} name={name} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" /> : <p className="pl-12 text-sm font-semibold md:pl-0">{user[name] || <span className="font-medium text-on-surface-variant">Not provided</span>}</p>}</div>)}</div>
          {message && <p role="status" className={`mx-6 mb-2 rounded-xl px-4 py-3 text-sm font-semibold md:mx-8 ${success ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{message}</p>}
          {editing && <div className="flex flex-col-reverse gap-3 border-t border-outline-variant/60 bg-surface-container-low px-6 py-5 sm:flex-row sm:justify-end md:px-8"><button type="button" onClick={cancel} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-on-surface-variant transition hover:bg-white disabled:opacity-50"><X size={17} />Discard changes</button><button type="button" onClick={save} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(118,87,217,0.22)] disabled:opacity-50"><Check size={17} />{saving ? "Saving…" : "Save changes"}</button></div>}
        </section>
      </div>
    </motion.section>
  );
}

export default function Dashboard() {
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
        <DashboardSidebar firstName={firstName} user={storedUser} onLogout={handleLogout} activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="mt-6 min-w-0 lg:mt-0">
        {activeSection === "browse" ? <BrowseCampaigns campaigns={discover} loading={loading} /> : activeSection === "my-campaigns" ? <MyCampaignsPanel campaigns={owned} loading={loading} /> : activeSection === "profile" ? <ProfilePanel onLogout={handleLogout} /> : <>
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative flex overflow-hidden flex-col gap-6 rounded-[2rem] bg-gradient-to-br from-on-surface via-[#3a2b6a] to-primary p-7 text-white shadow-[0_22px_45px_rgba(73,48,143,0.2)] md:flex-row md:items-center md:justify-between md:p-10">
          <div className="absolute -right-12 -top-20 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary-fixed">Your Givera home</p>
            <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Welcome back, {firstName}.</h1>
            <p className="mt-3 max-w-xl leading-7 text-white/65">Discover causes, manage your campaigns, and follow the impact you help create.</p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <button type="button" onClick={() => setActiveSection("browse")} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-on-surface"><Compass size={18} /> Browse</button>
            <Link to="/campaigns/create" className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-5 py-3 font-bold text-on-secondary-container"><Plus size={18} /> Start campaign</Link>
          </div>
        </motion.section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [CircleDollarSign, "Raised by your campaigns", money(metrics.raised), "bg-primary-fixed text-primary"],
            [Target, "Combined campaign goals", money(metrics.goal), "bg-secondary-container text-secondary"],
            [BarChart3, "Active campaigns", metrics.active, "bg-tertiary-container text-tertiary"],
            [Heart, "Your total donations", money(metrics.donatedAmount), "bg-rose-100 text-rose-600"],
          ].map(([Icon, label, value, color], index) => (
            <motion.article key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * index }} className="rounded-2xl border border-white/80 bg-white p-5 shadow-[0_12px_30px_rgba(40,35,62,0.06)]">
              <span className={`inline-grid rounded-xl p-2.5 ${color}`}><Icon size={21} /></span>
              <p className="mt-5 text-sm text-on-surface-variant">{label}</p>
              <p className="mt-1 text-2xl font-extrabold">{loading ? "—" : value}</p>
            </motion.article>
          ))}
        </section>

        <section className="mt-7 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-3xl border border-white/80 bg-white p-6 shadow-[0_12px_30px_rgba(40,35,62,0.06)]">
            <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-primary">CAMPAIGN PERFORMANCE</p><h2 className="mt-1 text-2xl font-extrabold">Funds raised by campaign</h2></div><BarChart3 className="text-primary" /></div>
            <div className="mt-8 space-y-5">
              {owned.length ? owned.slice(0, 5).map((campaign) => {
                const percentage = Math.min(Number(campaign.progress_percentage || 0), 100);
                return <div key={campaign.id}><div className="mb-2 flex justify-between gap-4 text-sm"><span className="truncate font-semibold">{campaign.title}</span><span className="shrink-0 text-on-surface-variant">{money(campaign.amount_raised)}</span></div><div className="h-3 overflow-hidden rounded-full bg-surface-container-high"><motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full progress-gradient" /></div></div>;
              }) : <p className="py-12 text-center text-on-surface-variant">Create a campaign to see performance charts.</p>}
            </div>
          </article>
          <article className="flex flex-col items-center justify-center rounded-3xl border border-white/80 bg-white p-6 text-center shadow-[0_12px_30px_rgba(40,35,62,0.06)]">
            <DonutChart value={metrics.progress} label="of goal" />
            <h2 className="mt-5 text-xl font-extrabold">Overall fundraising progress</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{money(metrics.raised)} raised across {owned.length} campaign{owned.length === 1 ? "" : "s"}.</p>
          </article>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-primary">Organizer area</p><h2 className="mt-1 text-3xl font-extrabold">Campaigns you created</h2></div><button type="button" onClick={() => setActiveSection("my-campaigns")} className="inline-flex items-center gap-2 font-bold text-primary">Manage all <ArrowRight size={18} /></button></div>
          <div className="mt-6 overflow-hidden rounded-3xl border border-white/80 bg-white shadow-[0_12px_30px_rgba(40,35,62,0.06)]">
            {owned.length ? owned.slice(0, 4).map((campaign) => (
              <Link key={campaign.id} to={`/campaigns/${campaign.id}`} className="grid gap-3 border-b border-outline-variant/50 p-5 last:border-0 hover:bg-surface-container-low sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div><p className="font-bold">{campaign.title}</p><p className="mt-1 line-clamp-1 text-sm text-on-surface-variant">{campaign.summary}</p></div>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusColor[campaign.status] || statusColor.draft}`}>{campaign.status_label || campaign.status}</span>
                <ArrowUpRight className="text-primary" size={18} />
              </Link>
            )) : <div className="p-10 text-center"><p className="font-bold">No campaigns created yet</p><Link to="/campaigns/create" className="mt-3 inline-flex items-center gap-2 text-primary">Start your first campaign <ArrowRight size={17} /></Link></div>}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl bg-secondary-container p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-secondary">Your giving</p><h2 className="mt-1 text-2xl font-extrabold">Campaigns you donated to</h2></div><Heart className="text-secondary" /></div>
            {donated.length ? <div className="mt-5 space-y-3">{donated.slice(0, 3).map((donation) => <Link key={donation.id} to={`/campaigns/${donation.campaign?.id || donation.campaign}`} className="flex items-center justify-between rounded-2xl bg-white/70 p-4"><span className="font-semibold">{donation.campaign?.title || "Supported campaign"}</span><span className="font-bold text-secondary">{money(donation.amount)}</span></Link>)}</div> : <div className="mt-8 rounded-2xl bg-white/55 p-6 text-center"><p className="font-semibold">No donation history yet</p><p className="mt-1 text-sm text-on-secondary-fixed-variant">When donation tracking is available, supported campaigns will appear here.</p><button type="button" onClick={() => setActiveSection("browse")} className="mt-4 inline-flex items-center gap-2 font-bold text-primary">Find a cause <ArrowRight size={17} /></button></div>}
          </article>
          <article className="rounded-3xl bg-primary-fixed p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-primary">Account</p><h2 className="mt-1 text-2xl font-extrabold">Your profile</h2></div><UserRound className="text-primary" /></div>
            <div className="mt-8 flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-2xl font-extrabold text-white">{firstName.charAt(0).toUpperCase()}</div><div><p className="text-lg font-bold">{storedUser?.username || firstName}</p><p className="text-sm text-on-surface-variant">{storedUser?.email || "Manage your account details"}</p></div></div>
            <button type="button" onClick={() => setActiveSection("profile")} className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-primary">View profile <ArrowRight size={18} /></button>
          </article>
        </section>

        <section className="mt-12 pb-10">
          <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-primary">Discover</p><h2 className="mt-1 text-3xl font-extrabold">All community campaigns</h2><p className="mt-2 text-sm text-on-surface-variant">Explore every approved campaign created by the Givera community.</p></div><button type="button" onClick={() => setActiveSection("browse")} className="hidden items-center gap-2 font-bold text-primary sm:inline-flex">Search campaigns <ArrowRight size={18} /></button></div>
          {discover.length ? <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{discover.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}</div> : <p className="mt-6 rounded-2xl bg-white p-8 text-center text-on-surface-variant">Campaigns will appear here when available.</p>}
        </section>
        </>}
        </main>
      </div>
    </div>
  );
}
