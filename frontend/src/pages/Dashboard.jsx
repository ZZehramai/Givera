import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  ArrowUpRight,
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
  Sparkles,
  Target,
  UserRound,
  Check,
  X,
  Bookmark,
  CreditCard,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import api from "../api/axios";
import CampaignCard from "../components/CampaignCard";
import { logout } from "../services/authService";
import AdminDashboard from "./AdminDashboard";
import LanguageSwitch from "../components/LanguageSwitch";
import { useLanguage } from "../i18n/LanguageContext";

const money = (value) => {
  const myanmar = localStorage.getItem("givera-language") === "my";
  return `${new Intl.NumberFormat(myanmar ? "my-MM" : "en-US", { maximumFractionDigits: 0 }).format(Number(value || 0))} ${myanmar ? "ကျပ်" : "Ks"}`;
};
const CAMPAIGNS_PER_PAGE = 6;

/* SIDEBAR */
function DashboardSidebar({ onLogout, activeSection, onSectionChange, counts, user }) {
  const { t } = useLanguage();
  const items = [
    ["overview", t("overview"), LayoutDashboard],
    ["browse", t("browseCampaigns"), Compass],
    ["my-campaigns", t("myCampaigns"), Megaphone],
    ["saved-campaigns", t("savedCampaigns"), Bookmark],
    ["history", t("history"), History],
    ["profile", t("profileSettings"), Settings]
  ];

  return (
    <aside className="lg:sticky lg:top-4 lg:self-start">
      <div className="flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-[0_18px_45px_rgba(41,35,80,.09)] lg:h-[calc(100vh-2rem)]">
        {/* LOGO */}
        <div className="border-b border-slate-100 px-6 py-6">
          <Link to="/" aria-label={t("goGiveraHome")} className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6F52D9]/30">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#6F52D9] text-lg font-black text-white">G</div>
            <div>
              <p className="text-xl font-extrabold tracking-tight text-[#24184a]">Givera</p>
              <p className="text-xs font-medium text-slate-400">{t("userWorkspace")}</p>
            </div>
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-1 px-3 py-4">
          {items.map(([section, label, Icon]) => {
            const isActive = activeSection === section;
            const badgeValue =
              section === "my-campaigns"
                ? counts.myCampaigns
                : section === "saved-campaigns"
                ? counts.savedCampaigns
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

        {/* USER PROFILE & LOGOUT SECTION */}
        <div className="mt-auto border-t border-slate-100 p-4 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#FFD66B] to-[#FFAD66] font-extrabold text-[#24184a]">
              {user?.username?.[0]?.toUpperCase() || "G"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800">{user?.username || t("user")}</p>
              <p className="text-xs text-slate-400">{t("userWorkspace")}</p>
            </div>
          </div>

          {/* MOVED LANGUAGE SWITCH HERE */}
          <div className="px-1">
            <LanguageSwitch />
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={17} /> {t("signOut")}
          </button>
        </div>
      </div>
    </aside>
  );
}

function DashboardMetricCard({ icon: Icon, label, value, note, tone, loading }) {
  return (
    <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
      <div className="flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}>
          <Icon size={21} />
        </span>
        <ArrowUpRight size={18} className="text-slate-300" />
      </div>
      <p className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">{loading ? "—" : value}</p>
      <p className="mt-1 text-sm font-bold text-slate-700">{label}</p>
      <p className="mt-1 text-xs text-slate-400">{note}</p>
    </article>
  );
}

function RecommendationsPanel({ recommendations, loading, onBrowse }) {
  const { t } = useLanguage();
  const reasonLabels = {
    donated_category: "recommendSupportedReason",
    saved_category: "recommendSavedReason",
    ending_soon: "recommendEndingReason",
    new_campaign: "recommendNewReason",
    popular: "recommendPopularReason",
    active_campaign: "recommendActiveReason",
  };

  return (
    <section className="mt-6 rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#6F52D9]">{t("pickedForYou")}</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">{t("recommendedCampaigns")}</h2>
          </div>
        </div>
        <button type="button" onClick={onBrowse} className="rounded-full border border-[#D8CFFA] bg-[#F7F4FF] px-4 py-2 text-sm font-extrabold text-[#6549C9] transition hover:bg-[#EEE9FF]">
          {t("browseAll")}
        </button>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((item) => <div key={item} className="h-72 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      ) : recommendations.length ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {recommendations.slice(0, 3).map((campaign) => (
            <div key={campaign.id} className="bg-white border border-slate-100 rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-[#EEE9FF] px-2.5 py-1 text-[11px] font-extrabold text-[#6549C9]">
                  {t(reasonLabels[campaign.recommendation_reason] || "recommendActiveReason")}
                </span>
              </div>
              <CampaignCard campaign={campaign} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-[#D8CFFA] bg-[#FAF8FF] px-5 py-10 text-center">
          <p className="font-extrabold text-slate-800">{t("noRecommendations")}</p>
          <p className="mt-2 text-sm text-slate-500">{t("noRecommendationsText")}</p>
        </div>
      )}
    </section>
  );
}

function CampaignPagination({ page, pages, onPageChange, className = "" }) {
  const { t, formatNumber } = useLanguage();
  return (
    <div className={`flex items-center justify-end gap-2 ${className}`}>
      <span className="mr-1 text-xs font-bold text-slate-400">
        {formatNumber(page)} / {formatNumber(pages)}
      </span>
      <button
        type="button"
        aria-label={t("previousCampaigns")}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#B9A8F5] hover:text-[#6549C9] disabled:cursor-not-allowed disabled:opacity-35"
      >
        <ChevronLeft size={19} />
      </button>
      <button
        type="button"
        aria-label={t("nextCampaigns")}
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
        className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#B9A8F5] hover:text-[#6549C9] disabled:cursor-not-allowed disabled:opacity-35"
      >
        <ChevronRight size={19} />
      </button>
    </div>
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

function SavedCampaignsPanel() {
  const { t } = useLanguage();
  const [savedCampaigns, setSavedCampaigns] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadSaved = () => {
      const items = JSON.parse(localStorage.getItem("saved_campaigns") || "[]");
      setSavedCampaigns(items);
      setPage(1);
    };
    loadSaved();
    window.addEventListener("savedCampaignsUpdated", loadSaved);
    return () => window.removeEventListener("savedCampaignsUpdated", loadSaved);
  }, []);
  const pages = Math.max(1, Math.ceil(savedCampaigns.length / CAMPAIGNS_PER_PAGE));
  const safePage = Math.min(page, pages);
  const visibleCampaigns = savedCampaigns.slice((safePage - 1) * CAMPAIGNS_PER_PAGE, safePage * CAMPAIGNS_PER_PAGE);

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        {savedCampaigns.length ? (
          <>
            <CampaignPagination page={safePage} pages={pages} onPageChange={setPage} className="mb-4" />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-20 text-center shadow-[0_12px_30px_rgba(43,37,80,.06)]">
            <h2 className="text-2xl font-bold text-slate-800">{t("noSaved")}</h2>
            <p className="mt-2 text-slate-500">{t("noSavedText")}</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}

function HistoryPanel({ donations, campaigns, demoPayments }) {
  const { t, formatDate, formatKyat, formatNumber } = useLanguage();
  const [campaignPage, setCampaignPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const [certificateBusy, setCertificateBusy] = useState("");
  const [certificateError, setCertificateError] = useState("");
  const totalDonatedAmount = donations.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const campaignPages = Math.max(1, Math.ceil(campaigns.length / CAMPAIGNS_PER_PAGE));
  const safeCampaignPage = Math.min(campaignPage, campaignPages);
  const visibleCampaigns = campaigns.slice((safeCampaignPage - 1) * CAMPAIGNS_PER_PAGE, safeCampaignPage * CAMPAIGNS_PER_PAGE);
  const paymentPages = Math.max(1, Math.ceil(demoPayments.length / CAMPAIGNS_PER_PAGE));
  const safePaymentPage = Math.min(paymentPage, paymentPages);
  const visiblePayments = demoPayments.slice((safePaymentPage - 1) * CAMPAIGNS_PER_PAGE, safePaymentPage * CAMPAIGNS_PER_PAGE);
  const paymentTime = (value) => formatDate(value, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const paymentStatus = {
    paid: [t("paymentPaid"), "bg-emerald-100 text-emerald-700"],
    pending: [t("paymentPending"), "bg-amber-100 text-amber-800"],
    failed: [t("paymentFailed"), "bg-rose-100 text-rose-700"],
    cancelled: [t("paymentCancelled"), "bg-slate-100 text-slate-700"],
    expired: [t("paymentExpired"), "bg-orange-100 text-orange-700"],
  };
  const downloadCertificate = async (payment) => {
    setCertificateBusy(payment.id);
    setCertificateError("");
    try {
      const response = await api.get(
        `/donations/demo-checkout/${payment.id}/certificate/`,
        { responseType: "blob" },
      );
      const disposition = response.headers["content-disposition"] || "";
      const filename = disposition.match(/filename="?([^";]+)"?/)?.[1]
        || `givera-certificate-${payment.transaction_reference}.pdf`;
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setCertificateError(t("certificateDownloadError"));
    } finally {
      setCertificateBusy("");
    }
  };

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-violet-100 text-[#6F52D9]">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("totalDonated")}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{money(totalDonatedAmount)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#FFE27A]/50 text-[#765E00]">
            <Megaphone size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("campaignsSupported")}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{formatNumber(donations.length)}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-100 text-indigo-700">
            <UserRound size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("livesImpacted")}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">{formatNumber(3200)}+</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Megaphone size={18} className="text-[#6F52D9]" /> {t("createdCampaigns")}
          </h2>
          {campaigns.length > 0 && <CampaignPagination page={safeCampaignPage} pages={campaignPages} onPageChange={setCampaignPage} />}
        </div>
          {campaigns.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {visibleCampaigns.map((item) => {
                const raised = Number(item.amount_raised || 0);
                const goal = Number(item.goal_amount || 1);
                const progress = Math.min(Math.round((raised / goal) * 100), 100);
                return (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-slate-900 truncate">{item.title}</p>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${item.status === "approved" ? "bg-violet-100 text-[#6F52D9]" : "bg-slate-200 text-slate-700"}`}>
                        {item.status === "approved" ? t("active") : t(item.status)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                      <div className="h-full rounded-full bg-[#6F52D9]" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-500">
                      <span>{formatKyat(raised)} {t("raised")}</span>
                      <span>{t("goal")}: {formatKyat(goal)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">{t("noCreatedHistory")}</p>
          )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <CreditCard size={18} className="text-[#6F52D9]" /> {t("paymentActivity")}
          </h2>
          {demoPayments.length > 0 && <CampaignPagination page={safePaymentPage} pages={paymentPages} onPageChange={setPaymentPage} />}
        </div>
        {demoPayments.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1360px] text-left text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2 pr-5 font-semibold">{t("initiatedAt")}</th>
                  <th className="px-5 pb-3 font-semibold">{t("paymentCampaign")}</th>
                  <th className="px-5 pb-3 font-semibold">{t("transactionId")}</th>
                  <th className="px-5 pb-3 font-semibold">{t("method")}</th>
                  <th className="px-5 pb-3 font-semibold text-right">{t("amount")}</th>
                  <th className="px-5 pb-3 font-semibold">{t("completedAt")}</th>
                  <th className="pb-3 pl-5 pr-2 font-semibold text-right">{t("status")}</th>
                  <th className="pb-3 pl-5 pr-2 font-semibold text-right">{t("certificate")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
                {visiblePayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50">
                    <td className="whitespace-nowrap py-4 pl-2 pr-5 text-xs text-slate-500">
                      {payment.created_at ? paymentTime(payment.created_at) : "—"}
                    </td>
                    <td className="min-w-56 px-5 py-4">
                      {payment.campaign_id ? (
                        <Link to={`/campaigns/${payment.campaign_id}`} className="line-clamp-2 font-bold text-slate-900 hover:text-[#6549C9]">
                          {payment.campaign_title || payment.donation?.campaign?.title || t("supportedCampaign")}
                        </Link>
                      ) : (
                        <span className="font-bold text-slate-900">{payment.campaign_title || payment.donation?.campaign?.title || t("supportedCampaign")}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-bold text-slate-900">{payment.transaction_reference || "—"}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      <span className="flex items-center gap-2"><CreditCard size={15} className="text-slate-400" /> {payment.provider_label || "—"}</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-slate-900">{formatKyat(payment.amount)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                      {payment.completed_at ? paymentTime(payment.completed_at) : payment.status === "pending" && payment.expires_at ? <><span className="block text-[10px] font-bold uppercase text-slate-400">{t("expiresAt")}</span>{paymentTime(payment.expires_at)}</> : "—"}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-5 pr-2 text-right">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${(paymentStatus[payment.status] || [null, "bg-slate-100 text-slate-700"])[1]}`}>
                        {(paymentStatus[payment.status] || [t("paymentRecorded")])[0]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-5 pr-2 text-right">
                      {payment.status === "paid" && payment.donation ? (
                        <button
                          type="button"
                          onClick={() => downloadCertificate(payment)}
                          disabled={certificateBusy === payment.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#D8CCFF] bg-[#F5F2FF] px-3 py-2 text-xs font-bold text-[#6549C9] transition hover:border-[#6F52D9] hover:bg-[#ECE6FF] disabled:cursor-wait disabled:opacity-55"
                        >
                          <Download size={14} />
                          {certificateBusy === payment.id ? t("downloadingCertificate") : t("downloadCertificate")}
                        </button>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="py-10 text-center text-sm text-slate-400">{t("noDonationHistory")}</p>}
        {certificateError && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{certificateError}</p>}
      </div>
    </motion.section>
  );
}

function BrowseCampaigns({ campaigns, loading }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

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
  const pages = Math.max(1, Math.ceil(filteredCampaigns.length / CAMPAIGNS_PER_PAGE));
  const safePage = Math.min(page, pages);
  const visibleCampaigns = filteredCampaigns.slice((safePage - 1) * CAMPAIGNS_PER_PAGE, safePage * CAMPAIGNS_PER_PAGE);

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
        <div className="grid gap-3 text-slate-800 sm:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 focus-within:border-[#7A5BE6]">
            <Search size={18} className="text-slate-400" />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={t("searchCampaignsShort")} className="min-w-0 flex-1 outline-none" />
          </label>
          <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#7A5BE6]">
            <option value="">{t("allCauses")}</option>
            <option value="education">{t("education")}</option>
            <option value="medical">{t("medical")}</option>
            <option value="emergency">{t("emergency")}</option>
            <option value="community">{t("community")}</option>
            <option value="environment">{t("environment")}</option>
            <option value="animals">{t("animals")}</option>
            <option value="other">{t("other")}</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="py-20 text-center text-slate-500">{t("loadingCampaigns")}</p>
        ) : filteredCampaigns.length ? (
          <>
            <CampaignPagination page={safePage} pages={pages} onPageChange={setPage} className="mb-4" />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-20 text-center shadow-[0_12px_30px_rgba(43,37,80,.06)]">
            <h2 className="text-2xl font-bold text-slate-800">{t("noCampaigns")}</h2>
            <p className="mt-2 text-slate-500">{t("tryAnother")}</p>
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
}) {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const submittedCampaign = campaigns.find(
    (campaign) => String(campaign.id) === String(submittedId)
  );
  const pages = Math.max(1, Math.ceil(campaigns.length / CAMPAIGNS_PER_PAGE));
  const safePage = Math.min(page, pages);
  const visibleCampaigns = campaigns.slice((safePage - 1) * CAMPAIGNS_PER_PAGE, safePage * CAMPAIGNS_PER_PAGE);

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {submittedId && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)] md:p-7"
        >
          <button
            type="button"
            onClick={onDismissSubmission}
            aria-label={t("dismissConfirmation")}
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
                {t("requestReceived")}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                {submissionMessage || t("submittedSuccess")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                <strong>{submittedCampaign?.title || campaignTitle || t("yourCampaign")}</strong> {t("pendingReviewMessage")}
              </p>
            </div>
          </div>
        </motion.section>
      )}

      <div className={submittedId ? "mt-6" : ""}>
        {loading ? (
          <p className="py-20 text-center text-slate-500">{t("loadingCampaigns")}</p>
        ) : campaigns.length ? (
          <>
            <CampaignPagination page={safePage} pages={pages} onPageChange={setPage} className="mb-4" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visibleCampaigns.map((campaign) => (
                <div key={campaign.id} className="relative">
                  <CampaignCard campaign={campaign} />

                  {campaign.rejection_reason && (
                    <div className="mt-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
                      <p>
                        <strong>{t("whyRejected")}:</strong> {campaign.rejection_reason}
                      </p>
                      <Link
                        to={`/campaigns/${campaign.id}/edit`}
                        className="mt-2 inline-block rounded-xl bg-[#6F52D9] px-4 py-2 text-xs font-bold text-white"
                      >
                        {t("fixResubmitShort")}
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-20 text-center shadow-[0_12px_30px_rgba(43,37,80,.06)]">
            <h2 className="text-2xl font-bold text-slate-800">
              {t("noSubmittedCampaign")}
            </h2>
            <p className="mt-2 text-slate-500">
              {t("tellStory")}
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}

function ProfilePanel() {
  const { t } = useLanguage();
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
      .catch(() => setMessage(t("profileLoadError")));
  }, [t]);

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const response = await api.patch("/auth/profile/", form);
      setUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
      window.dispatchEvent(new Event("userUpdated"));
      setEditing(false);
      setMessage(t("profileUpdated"));
    } catch {
      setMessage(t("profileUpdateError"));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <p className="py-20 text-center text-slate-500">{message || t("loadingProfile")}</p>;
  const fields = [
    [t("name"), "username", "text", UserRound],
    [t("email"), "email", "email", Mail],
    [t("phone"), "phone_number", "tel", Phone],
    [t("location"), "country", "text", MapPin],
  ];
  const initial = user.username?.trim().charAt(0).toUpperCase() || "G";

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
      <div className="mb-5 flex justify-end">
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6F52D9] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20"
          >
            <Edit3 size={16} /> {t("editDetails")}
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
              <h2 className="text-xl font-extrabold text-slate-800">{t("personalInformation")}</h2>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <ShieldCheck size={15} /> {t("accountVerified")}
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
                  <p className="text-sm font-semibold text-slate-800">{user[name] || t("notProvided")}</p>
                )}
              </div>
            ))}
          </div>
          {editing && (
            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4">
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm font-bold text-slate-500">
                {t("cancel")}
              </button>
              <button onClick={save} disabled={saving} className="rounded-xl bg-[#6F52D9] px-6 py-2 text-sm font-bold text-white shadow-lg shadow-violet-500/20">
                {saving ? t("saving") : t("saveChanges")}
              </button>
            </div>
          )}
        </section>
      </div>
    </motion.section>
  );
}

function UserDashboard() {
  const { language, t, formatNumber, formatDate } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const initialParams = new URLSearchParams(location.search);
  const submittedId = initialParams.get("submitted");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const [owned, setOwned] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [donated, setDonated] = useState([]);
  const [demoPayments, setDemoPayments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(initialParams.get("section") || "overview");
  const [showSubmissionSuccess, setShowSubmissionSuccess] = useState(Boolean(submittedId));

  useEffect(() => {
    const updateSavedData = async () => {
      const items = JSON.parse(localStorage.getItem("saved_campaigns") || "[]");
      setSavedCount(items.length);
      setRecommendationsLoading(true);
      try {
        const savedCampaignIds = Array.isArray(items) ? items.map((item) => item.id).filter(Boolean) : [];
        const { data } = await api.post("/campaigns/recommendations/", {
          saved_campaign_ids: savedCampaignIds,
        });
        setRecommendations(data.results || []);
      } catch {
        setRecommendations([]);
      } finally {
        setRecommendationsLoading(false);
      }
    };
    updateSavedData();
    window.addEventListener("savedCampaignsUpdated", updateSavedData);
    return () => window.removeEventListener("savedCampaignsUpdated", updateSavedData);
  }, []);

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
  
  const campaignStatuses = useMemo(() => ({
    approved: owned.filter((item) => item.status === "approved").length,
    pending: owned.filter((item) => item.status === "pending").length,
    rejected: owned.filter((item) => item.status === "rejected").length,
    completed: owned.filter((item) => item.status === "completed").length,
  }), [owned]);

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

  const pageTitle = {
    overview: `${t("welcomeUser")}, ${firstName}`,
    browse: t("browseCampaigns"),
    "my-campaigns": t("myCampaigns"),
    "saved-campaigns": t("savedCampaigns"),
    history: t("activityHistory"),
    profile: t("profileSettings"),
  }[activeSection];
  
  const pageSubtitle = {
    overview: t("dashboardIntro"),
    browse: t("browseDashboardText"),
    "my-campaigns": t("tellStory"),
    "saved-campaigns": t("savedDescription"),
    history: t("activityHistoryText"),
    profile: t("accountCentre"),
  }[activeSection];

  return (
    <div data-language={language} className="min-h-screen bg-[#F6F6FB] text-slate-900">
      <div className="mx-auto max-w-[1500px] p-4 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        <DashboardSidebar
          onLogout={handleLogout}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          counts={{ myCampaigns: owned.length, savedCampaigns: savedCount, history: donated.length }}
          user={storedUser}
        />

        <main className="min-w-0 py-6 lg:py-4">
          <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="mt-2 text-3xl font-extrabold text-[#7A5BE6] md:text-4xl">{pageTitle}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">{pageSubtitle}</p>
            </div>
            {(activeSection === "overview" || activeSection === "my-campaigns") && (
              <div className="flex flex-wrap gap-2">
                {activeSection === "overview" && (
                  <button type="button" onClick={() => setActiveSection("browse")} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-[#6549C9] shadow-sm">
                    <Compass size={17} /> {t("browse")}
                  </button>
                )}
                <Link to="/campaigns/create" className="inline-flex items-center gap-2 rounded-2xl bg-[#FFD66B] px-4 py-2.5 text-sm font-extrabold text-[#2b1d52] shadow-sm">
                  <Plus size={17} /> {t("requestCampaignShort")}
                </Link>
              </div>
            )}
          </header>
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
            />
          ) : activeSection === "saved-campaigns" ? (
            <SavedCampaignsPanel />
          ) : activeSection === "history" ? (
            <HistoryPanel donations={donated} campaigns={owned} demoPayments={demoPayments} />
          ) : activeSection === "profile" ? (
            <ProfilePanel />
          ) : (
            <>
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { Icon: CircleDollarSign, label: t("raisedByCampaigns"), value: money(metrics.raised), note: t("campaignPerformance"), tone: "bg-violet-100 text-[#6549C9]" },
                  { Icon: Target, label: t("combinedGoals"), value: money(metrics.goal), note: t("overallProgress"), tone: "bg-emerald-100 text-emerald-700" },
                  { Icon: BarChart3, label: t("activeCampaigns"), value: formatNumber(metrics.active), note: t("acceptingSupport"), tone: "bg-amber-100 text-amber-700" },
                  { Icon: Heart, label: t("yourDonations"), value: money(metrics.donatedAmount), note: t("activityHistoryText"), tone: "bg-sky-100 text-sky-700" },
                ].map(({ Icon, label, value, note, tone }, index) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index }}
                  >
                    <DashboardMetricCard icon={Icon} label={label} value={value} note={note} tone={tone} loading={loading} />
                  </motion.div>
                ))}
              </section>

              <RecommendationsPanel
                recommendations={recommendations}
                loading={recommendationsLoading}
                onBrowse={() => setActiveSection("browse")}
              />

              <section className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#6F52D9]">{t("campaignPerformance")}</p>
                      <h2 className="mt-2 text-xl font-extrabold text-slate-900">{t("fundsRaised")}</h2>
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
                      <p className="py-12 text-center text-slate-400">{t("createForCharts")}</p>
                    )}
                  </div>
                </article>
                <article className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-[0_12px_30px_rgba(43,37,80,.06)]">
                  <DonutChart value={metrics.progress} label={t("ofGoal")} />
                  <h2 className="mt-5 text-xl font-extrabold text-slate-900">{t("overallProgress")}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {money(metrics.raised)} {t("raisedAcross")} {formatNumber(owned.length)} {t("campaignWord")}.
                  </p>
                </article>
              </section>

              <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <article className="rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(43,37,80,.06)]">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">{t("recentDonations")}</h2>
                      <p className="mt-1 text-sm text-slate-500">{t("recentDonationsOverview")}</p>
                    </div>
                    <button type="button" onClick={() => setActiveSection("history")} className="text-sm font-bold text-[#6F52D9]">
                      {t("viewHistory")}
                    </button>
                  </div>
                  {donated.length ? (
                    <div className="divide-y divide-slate-100">
                      {donated.slice(0, 3).map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between gap-4 px-6 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-100 text-[#6549C9]"><Heart size={18} /></span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-800">{donation.campaign_title || donation.campaign?.title || t("supportedCampaign")}</p>
                              <p className="mt-1 text-xs text-slate-400">{donation.created_at ? formatDate(donation.created_at) : t("recent")}</p>
                            </div>
                          </div>
                          <p className="shrink-0 text-sm font-extrabold text-[#6549C9]">{money(donation.amount)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="px-6 py-12 text-center text-sm text-slate-400">{t("noDonationHistory")}</p>
                  )}
                </article>

                <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">{t("campaignStatusOverview")}</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{t("campaignStatusOverviewText")}</p>
                    </div>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700"><Megaphone size={20} /></span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      ["approved", campaignStatuses.approved, "bg-emerald-50 text-emerald-700"],
                      ["pendingReview", campaignStatuses.pending, "bg-amber-50 text-amber-700"],
                      ["rejected", campaignStatuses.rejected, "bg-rose-50 text-rose-700"],
                      ["completed", campaignStatuses.completed, "bg-violet-50 text-violet-700"],
                    ].map(([label, value, tone]) => (
                      <div key={label} className={`rounded-2xl p-4 ${tone}`}>
                        <p className="text-2xl font-extrabold">{formatNumber(value)}</p>
                        <p className="mt-1 text-xs font-bold">{t(label)}</p>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setActiveSection("my-campaigns")} className="mt-5 w-full rounded-xl bg-[#F0ECFF] px-4 py-2.5 text-sm font-extrabold text-[#6549C9] hover:bg-[#E5DDFF]">
                    {t("manageCampaigns")}
                  </button>
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