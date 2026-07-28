import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  CircleDollarSign,
  Compass,
  LayoutDashboard,
  Heart,
  Megaphone,
  Plus,
  Settings,
  Target,
  UserRound,
} from "lucide-react";

import api from "../api/axios";
import AppHeader from "../components/AppHeader";
import CampaignCard from "../components/CampaignCard";

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
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/campaigns", label: "Browse campaigns", icon: Compass },
  { to: "/my-campaigns", label: "My campaigns", icon: Megaphone },
  { to: "/profile", label: "Profile & settings", icon: Settings },
];

function DashboardSidebar({ firstName, user }) {
  const navClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
      isActive
        ? "bg-primary-fixed text-primary"
        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
    }`;

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-3xl border border-outline-variant/60 bg-white p-3 lg:p-4">
        <div className="hidden items-center gap-3 border-b border-outline-variant/50 px-2 pb-4 lg:flex">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-lg font-extrabold text-white">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold">{user?.username || firstName}</p>
            <p className="truncate text-xs text-on-surface-variant">{user?.email || "Givera member"}</p>
          </div>
        </div>

        <nav aria-label="Dashboard navigation" className="flex gap-2 overflow-x-auto lg:mt-3 lg:flex-col lg:overflow-visible">
          {sidebarItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={navClass}>
              <Icon size={18} aria-hidden="true" />
              <span className="whitespace-nowrap">{label}</span>
              <ChevronRight size={16} aria-hidden="true" className="ml-auto hidden opacity-0 transition group-hover:opacity-100 lg:block" />
            </NavLink>
          ))}
        </nav>

        <div className="mt-3 hidden rounded-2xl bg-on-surface p-4 text-white lg:block">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-secondary-container text-on-secondary-container">
            <Plus size={19} aria-hidden="true" />
          </div>
          <p className="mt-4 font-bold">Bring an idea to life</p>
          <p className="mt-1 text-xs leading-5 text-white/60">Create a fundraiser and rally your community.</p>
          <Link to="/campaigns/create" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-primary-fixed">
            Start a campaign <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
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

export default function Dashboard() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const [owned, setOwned] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [donated, setDonated] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader />
      <div className="mx-auto max-w-container-max px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-8 lg:py-10">
        <DashboardSidebar firstName={firstName} user={storedUser} />
        <main className="mt-6 min-w-0 lg:mt-0">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 rounded-[2rem] bg-on-surface p-7 text-white md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary-fixed">Your Givera home</p>
            <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Welcome back, {firstName}.</h1>
            <p className="mt-3 max-w-xl leading-7 text-white/65">Discover causes, manage your campaigns, and follow the impact you help create.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/campaigns" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-on-surface"><Compass size={18} /> Browse</Link>
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
            <motion.article key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * index }} className="rounded-2xl border border-outline-variant/60 bg-white p-5">
              <span className={`inline-grid rounded-xl p-2.5 ${color}`}><Icon size={21} /></span>
              <p className="mt-5 text-sm text-on-surface-variant">{label}</p>
              <p className="mt-1 text-2xl font-extrabold">{loading ? "—" : value}</p>
            </motion.article>
          ))}
        </section>

        <section className="mt-7 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="rounded-3xl border border-outline-variant/60 bg-white p-6">
            <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold text-primary">CAMPAIGN PERFORMANCE</p><h2 className="mt-1 text-2xl font-extrabold">Funds raised by campaign</h2></div><BarChart3 className="text-primary" /></div>
            <div className="mt-8 space-y-5">
              {owned.length ? owned.slice(0, 5).map((campaign) => {
                const percentage = Math.min(Number(campaign.progress_percentage || 0), 100);
                return <div key={campaign.id}><div className="mb-2 flex justify-between gap-4 text-sm"><span className="truncate font-semibold">{campaign.title}</span><span className="shrink-0 text-on-surface-variant">{money(campaign.amount_raised)}</span></div><div className="h-3 overflow-hidden rounded-full bg-surface-container-high"><motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full progress-gradient" /></div></div>;
              }) : <p className="py-12 text-center text-on-surface-variant">Create a campaign to see performance charts.</p>}
            </div>
          </article>
          <article className="flex flex-col items-center justify-center rounded-3xl border border-outline-variant/60 bg-white p-6 text-center">
            <DonutChart value={metrics.progress} label="of goal" />
            <h2 className="mt-5 text-xl font-extrabold">Overall fundraising progress</h2>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">{money(metrics.raised)} raised across {owned.length} campaign{owned.length === 1 ? "" : "s"}.</p>
          </article>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-primary">Organizer area</p><h2 className="mt-1 text-3xl font-extrabold">Campaigns you created</h2></div><Link to="/my-campaigns" className="inline-flex items-center gap-2 font-bold text-primary">Manage all <ArrowRight size={18} /></Link></div>
          <div className="mt-6 overflow-hidden rounded-3xl border border-outline-variant/60 bg-white">
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
            {donated.length ? <div className="mt-5 space-y-3">{donated.slice(0, 3).map((donation) => <Link key={donation.id} to={`/campaigns/${donation.campaign?.id || donation.campaign}`} className="flex items-center justify-between rounded-2xl bg-white/70 p-4"><span className="font-semibold">{donation.campaign?.title || "Supported campaign"}</span><span className="font-bold text-secondary">{money(donation.amount)}</span></Link>)}</div> : <div className="mt-8 rounded-2xl bg-white/55 p-6 text-center"><p className="font-semibold">No donation history yet</p><p className="mt-1 text-sm text-on-secondary-fixed-variant">When donation tracking is available, supported campaigns will appear here.</p><Link to="/campaigns" className="mt-4 inline-flex items-center gap-2 font-bold text-primary">Find a cause <ArrowRight size={17} /></Link></div>}
          </article>
          <article className="rounded-3xl bg-primary-fixed p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-primary">Account</p><h2 className="mt-1 text-2xl font-extrabold">Your profile</h2></div><UserRound className="text-primary" /></div>
            <div className="mt-8 flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-2xl font-extrabold text-white">{firstName.charAt(0).toUpperCase()}</div><div><p className="text-lg font-bold">{storedUser?.username || firstName}</p><p className="text-sm text-on-surface-variant">{storedUser?.email || "Manage your account details"}</p></div></div>
            <Link to="/profile" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-primary">View profile <ArrowRight size={18} /></Link>
          </article>
        </section>

        <section className="mt-12 pb-10">
          <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-widest text-primary">Discover</p><h2 className="mt-1 text-3xl font-extrabold">All community campaigns</h2><p className="mt-2 text-sm text-on-surface-variant">Explore every approved campaign created by the Givera community.</p></div><Link to="/campaigns" className="hidden items-center gap-2 font-bold text-primary sm:inline-flex">Search campaigns <ArrowRight size={18} /></Link></div>
          {discover.length ? <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{discover.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}</div> : <p className="mt-6 rounded-2xl bg-white p-8 text-center text-on-surface-variant">Campaigns will appear here when available.</p>}
        </section>
        </main>
      </div>
    </div>
  );
}
