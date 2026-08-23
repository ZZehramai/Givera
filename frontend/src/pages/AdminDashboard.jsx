import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Archive,
  ArrowUpRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CircleStop,
  ClipboardCheck,
  Download,
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Heart,
  EyeOff,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Megaphone,
  Phone,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserRound,
  UserCog,
  Users,
  X,
} from "lucide-react";

import api from "../api/axios";
import { logout } from "../services/authService";
import LanguageSwitch from "../components/LanguageSwitch";
import { useLanguage } from "../i18n/LanguageContext";
import CreateCampaign from "./CreateCampaign";

const activeLocale = () => localStorage.getItem("givera-language") === "my" ? "my-MM" : "en-US";
const kyat = (value) => `${Number(value || 0).toLocaleString(activeLocale())} ${activeLocale() === "my-MM" ? "ကျပ်" : "Ks"}`;
const dateTime = (value) => (value ? new Date(value).toLocaleString(activeLocale()) : "—");
const campaignTone = {
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  completed: "bg-violet-50 text-violet-700 ring-violet-200",
  unpublished: "bg-orange-50 text-orange-700 ring-orange-200",
  archived: "bg-slate-100 text-slate-600 ring-slate-300",
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
};

function StatusBadge({ status, label }) {
  const { language, t } = useLanguage();
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${campaignTone[status] || campaignTone.draft}`}
    >
      {language === "my" ? t(status) : label || t(status)}
    </span>
  );
}

function Sidebar({ section, onSection, user, onLogout, pending }) {
  const { t } = useLanguage();
  const items = [
    ["overview", t("overview"), LayoutDashboard],
    ["campaigns", t("campaignReview"), Megaphone],
    ["donations", t("transactions"), Heart],
    ["users", t("userManagement"), UserCog],
    ["settings", t("profileSettings"), Settings],
  ];
  return (
    <aside className="flex flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-[0_18px_45px_rgba(41,35,80,.09)] lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:self-start">
      <div className="border-b border-slate-100 px-6 py-6">
        <Link to="/" aria-label={t("goGiveraHome")} className="flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6F52D9]/30">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#6F52D9] text-lg font-black text-white">
            G
          </div>
          <div>
            <p className="text-xl font-extrabold tracking-tight text-[#24184a]">
              Givera
            </p>
            <p className="text-xs font-medium text-slate-400">
              {t("adminWorkspace")}
            </p>
          </div>
        </Link>
        <div className="mt-4"><LanguageSwitch /></div>
      </div>
      <nav className="space-y-1 px-3 py-4">
        {items.map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSection(key)}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${section === key ? "bg-[#F0ECFF] text-[#6549C9]" : "text-slate-600 hover:bg-slate-50 hover:text-[#6549C9]"}`}
          >
            <Icon size={18} />
            <span className="flex-1">{label}</span>
            {key === "campaigns" && pending > 0 && (
              <span
                className={`grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-xs ${section === key ? "bg-[#6F52D9] text-white" : "bg-[#E9E2FF] text-[#6549C9]"}`}
              >
                {pending}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="mt-auto border-t border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#FFD66B] to-[#FFAD66] font-extrabold text-[#24184a]">
            {user?.username?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800">
              {user?.username || t("administrator")}
            </p>
            <p className="text-xs text-slate-400">{t("platformAdmin")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut size={17} /> {t("signOut")}
        </button>
      </div>
    </aside>
  );
}

function MetricCard({ icon: Icon, label, value, note, tone }) {
  return (
    <article className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
      <div className="flex items-start justify-between">
        <span
          className={`grid h-11 w-11 place-items-center rounded-2xl ${tone}`}
        >
          <Icon size={21} />
        </span>
        <ArrowUpRight size={18} className="text-slate-300" />
      </div>
      <p className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-700">{label}</p>
      <p className="mt-1 text-xs text-slate-400">{note}</p>
    </article>
  );
}

function ReviewModal({ campaign, onClose, onReview, onEdit, onManage }) {
  const { t, formatDate, formatKyat } = useLanguage();
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17112e]/55 p-4 backdrop-blur-sm">
      <div className="mx-auto my-8 max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-[#25194B] px-7 py-6 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#D9CBFF]">
              {campaign.status === "pending" ? t("campaignVerification") : t("campaignManagement")}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">{campaign.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-white/10"
          >
            <X size={21} />
          </button>
        </div>
        <div className="grid gap-7 p-7 md:grid-cols-[1.35fr_.65fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {t("campaignStory")}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {campaign.story}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Info label={t("goal")} value={formatKyat(campaign.goal_amount)} />
              <Info label={t("beneficiary")} value={campaign.beneficiary} />
              <Info label={t("location")} value={campaign.location} />
              <Info
                label={t("deadline")}
                value={formatDate(campaign.deadline)}
              />
            </div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {t("organizer")}
            </p>
            <p className="mt-3 font-extrabold text-slate-900">
              {campaign.owner_name}
            </p>
            <p className="mt-1 break-all text-sm text-slate-500">
              {campaign.owner_email}
            </p>
            <div className="mt-5 border-t border-slate-200 pt-4 text-sm">
              <p className="font-bold text-slate-700">
                {campaign.owner_phone_number || t("noPhone")}
              </p>
              <p className="mt-1 text-slate-500">
                {campaign.owner_country || t("noLocation")}
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50/70 px-7 py-5">
          {campaign.status === "pending" ? (
            <>
              <label className="text-sm font-bold text-slate-700">
                {t("rejectionFeedback")}{" "}
                <span className="font-normal text-slate-400">
                  ({t("requiredRejecting")})
                </span>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder={t("feedbackPlaceholder")}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#7A5BE6]"
                />
              </label>
              <div className="mt-4 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  disabled={!reason.trim()}
                  onClick={() => onReview(campaign, "rejected", reason)}
                  className="rounded-xl bg-rose-100 px-4 py-2.5 text-sm font-bold text-rose-700 disabled:opacity-40"
                >
                  {t("requestChanges")}
                </button>
                <button
                  type="button"
                  onClick={() => onReview(campaign, "approved")}
                  className="rounded-xl bg-[#6F52D9] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20"
                >
                  {t("approveCampaign")}
                </button>
              </div>
            </>
          ) : (
            <div>
              <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">
                {t("campaignManagement")}
              </p>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                {["approved", "unpublished"].includes(campaign.status) && (
                  <button type="button" onClick={() => onEdit(campaign)} className="inline-flex items-center gap-2 rounded-xl border border-[#D9D0FA] bg-white px-4 py-2.5 text-sm font-bold text-[#6549C9]">
                    <Pencil size={16} /> {t("editCampaign")}
                  </button>
                )}
                {campaign.status === "approved" && (
                  <button type="button" onClick={() => onManage(campaign, "unpublish")} className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-2.5 text-sm font-bold text-amber-800">
                    <EyeOff size={16} /> {t("unpublish")}
                  </button>
                )}
                {campaign.status === "unpublished" && (
                  <button type="button" onClick={() => onManage(campaign, "republish")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2.5 text-sm font-bold text-emerald-700">
                    <RotateCcw size={16} /> {t("republish")}
                  </button>
                )}
                {["approved", "unpublished"].includes(campaign.status) && (
                  <button type="button" onClick={() => onManage(campaign, "close")} className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">
                    <CircleStop size={16} /> {t("closeCampaign")}
                  </button>
                )}
                {campaign.status !== "archived" && (
                  <button type="button" onClick={() => onManage(campaign, "archive")} className="inline-flex items-center gap-2 rounded-xl bg-rose-100 px-4 py-2.5 text-sm font-bold text-rose-700">
                    <Archive size={16} /> {t("archive")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}

function CreateCampaignModal({ campaignId, onClose, onSaved }) {
  const { t } = useLanguage();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#17102F]/55 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={t("createCampaign")}
        className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[30px] bg-[#F8F7FC] shadow-[0_28px_90px_rgba(20,12,52,.32)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="sticky top-4 z-10 ml-auto mr-4 mt-4 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition hover:text-[#6549C9]"
        >
          <X size={19} />
        </button>
        <div className="-mt-14">
          <CreateCampaign embedded campaignId={campaignId} onSuccess={onSaved} />
        </div>
      </section>
    </div>
  );
}

function Campaigns({ campaigns, page, onPageChange, onReview, onView }) {
  const { t } = useLanguage();
  const pageSize = 10;
  const pages = Math.max(1, Math.ceil(campaigns.length / pageSize));
  const pageCampaigns = campaigns.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(43,37,80,.06)]">
      {/* <div className="flex flex-wrap items-end justify-between gap-3 px-6 py-5">
        <div>
          <h2 className="text-lg font-extrabold">{t("reviewQueue")}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Verify organizers and decide which campaigns can go live.
          </p>
        </div>
        <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-[#6549C9]">
          {campaigns.length} total
        </span>
      </div> */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-y border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-3">{t("campaignWord")}</th>
              <th className="px-6 py-3">{t("organizer")}</th>
              <th className="px-6 py-3">{t("goal")}</th>
              <th className="px-6 py-3">{t("status")}</th>
              <th className="px-6 py-3 text-right">{t("action")}</th>
            </tr>
          </thead>
          <tbody>
            {pageCampaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-6 py-4 text-left">
                  <p className="font-bold text-slate-800">{campaign.title}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {t(campaign.category)} · {campaign.location}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-700">
                    {campaign.owner_name}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {campaign.owner_email}
                  </p>
                </td>
                <td className="px-6 py-4 font-bold text-[#6549C9]">
                  {kyat(campaign.goal_amount)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge
                    status={campaign.status}
                    label={t(campaign.status)}
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onView(campaign)}
                      className="rounded-xl border border-[#FFD66B] bg-[#FFD66B] px-3 py-2 text-xs font-bold text-[#4C3910] shadow-sm transition hover:bg-[#ffd25e]"
                    >
                      {t("viewDetails")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onReview(campaign)}
                      className="rounded-xl bg-[#F0ECFF] px-3 py-2 text-xs font-bold text-[#6549C9] hover:bg-[#E3DBFF]"
                    >
                      {campaign.status === "pending" ? t("review") : t("manage")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPagination
        page={page}
        pages={pages}
        count={campaigns.length}
        hasPrevious={page > 1}
        hasNext={page < pages}
        onPageChange={onPageChange}
      />
    </section>
  );
}

function Transactions({
  donations,
  meta,
  page,
  search,
  onSearch,
  onPageChange,
}) {
  const { t } = useLanguage();
  const pages = Math.max(1, Math.ceil(meta.count / 10));
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(43,37,80,.06)]">
      <div className="flex flex-wrap items-end justify-between gap-4 px-6 py-5">
        {/* <div>
          <h2 className="text-lg font-extrabold">{t("donationTransactions")}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Full payment and donor record for every completed contribution.
          </p>
        </div> */}
        <label className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-400">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={t("searchTransaction")}
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1130px] text-left text-sm">
          <thead className="border-y border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3">{t("donorDetails")}</th>
              <th className="px-5 py-3">{t("campaignWord")}</th>
              <th className="px-5 py-3">{t("amount")}</th>
              <th className="px-5 py-3">{t("method")}</th>
              <th className="px-5 py-3">{t("referenceId")}</th>
              <th className="px-5 py-3">{t("status")}</th>
              <th className="px-5 py-3">{t("dateTime")}</th>
            </tr>
          </thead>
          <tbody>
            {donations.length ? (
              donations.map((donation) => (
                <tr
                  key={donation.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-800">
                      {donation.donor_name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {donation.donor_email}
                    </p>
                    {donation.donor_phone_number && (
                      <p className="mt-1 text-xs text-slate-400">
                        {donation.donor_phone_number}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">
                      {donation.campaign_title}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {t("by")} {donation.campaign_owner_name}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-extrabold text-[#6549C9]">
                    {kyat(donation.amount)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {donation.payment_method}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs font-bold text-slate-600">
                    {donation.payment_reference}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge
                      status={
                        donation.payment_status === "paid" ||
                        donation.payment_status === "recorded"
                          ? "approved"
                          : "pending"
                      }
                      label={t(`payment${donation.payment_status?.charAt(0).toUpperCase()}${donation.payment_status?.slice(1)}`)}
                    />
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                    {dateTime(donation.created_at)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-5 py-14 text-center text-sm text-slate-400"
                >
                  {t("noTransactionsMatch")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        page={page}
        pages={pages}
        count={meta.count}
        hasPrevious={Boolean(meta.previous)}
        hasNext={Boolean(meta.next)}
        onPageChange={onPageChange}
      />
    </section>
  );
}

function AdminPagination({
  page,
  pages,
  count,
  hasPrevious,
  hasNext,
  onPageChange,
}) {
  const { t, formatNumber } = useLanguage();
  const firstPage = Math.max(1, Math.min(page - 2, Math.max(pages - 4, 1)));
  const pageNumbers = Array.from(
    { length: Math.min(5, pages) },
    (_, index) => firstPage + index,
  );
  const firstItem = count ? (page - 1) * 10 + 1 : 0;
  const lastItem = Math.min(page * 10, count);

  return (
    <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        {t("showing")}{" "}
        <strong className="text-slate-700">
          {formatNumber(firstItem)}–{formatNumber(lastItem)}
        </strong>{" "}
        {t("of")} <strong className="text-slate-700">{formatNumber(count)}</strong>
      </p>
      <nav className="flex items-center gap-1.5" aria-label={t("pagination")}>
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
          aria-label={t("previousPage")}
          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#B7A6F2] hover:text-[#6549C9] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft size={17} />
        </button>
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            aria-current={pageNumber === page ? "page" : undefined}
            className={`grid h-9 min-w-9 place-items-center rounded-xl px-2 text-sm font-extrabold transition ${pageNumber === page ? "bg-[#6F52D9] text-white shadow-md shadow-violet-200" : "border border-transparent bg-white text-slate-600 hover:border-[#CFC3F7] hover:text-[#6549C9]"}`}
          >
            {formatNumber(pageNumber)}
          </button>
        ))}
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          aria-label={t("nextPage")}
          className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#B7A6F2] hover:text-[#6549C9] disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronRight size={17} />
        </button>
      </nav>
    </div>
  );
}

function UserDetailModal({ user, currentUser, onClose, onChange }) {
  const { t, formatDate, formatKyat, formatNumber } = useLanguage();
  if (!user) return null;
  const isSelf = user.id === currentUser?.id;
  const name =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.username;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17112e]/55 p-4 backdrop-blur-sm">
      <div className="mx-auto my-8 max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-[#25194B] px-7 py-6 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#D9CBFF]">
              {t("userManagement")}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold">{name}</h2>
            <p className="mt-1 text-sm text-indigo-200">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 hover:bg-white/10"
          >
            <X size={21} />
          </button>
        </div>
        <div className="p-7">
          <div className="grid gap-3 sm:grid-cols-3">
            <Info
              label={t("role")}
              value={user.role === "admin" ? t("administrator") : t("donor")}
            />
            <Info
              label={t("status")}
              value={user.is_active ? t("active") : t("suspended")}
            />
            <Info
              label={t("joined")}
              value={formatDate(user.created_at)}
            />
            <Info label={t("campaigns")} value={formatNumber(user.campaign_count)} />
            <Info label={t("donations")} value={formatNumber(user.donation_count)} />
            <Info label={t("totalDonated")} value={formatKyat(user.total_donated)} />
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {t("contactAccount")}
            </p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <p>
                <span className="text-slate-400">{t("phone")}:</span>{" "}
                <strong>{user.phone_number || t("notProvided")}</strong>
              </p>
              <p>
                <span className="text-slate-400">{t("country")}:</span>{" "}
                <strong>{user.country || t("notProvided")}</strong>
              </p>
              <p>
                <span className="text-slate-400">{t("signInMethod")}:</span>{" "}
                <strong className="capitalize">{user.auth_provider}</strong>
              </p>
              <p>
                <span className="text-slate-400">{t("email")}:</span>{" "}
                <strong>
                  {user.is_email_verified ? t("verified") : t("notVerified")}
                </strong>
              </p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {t("recentAdminChanges")}
            </p>
            <div className="mt-3 divide-y divide-slate-100 rounded-2xl border border-slate-100">
              {user.recent_admin_actions?.length ? (
                user.recent_admin_actions.map((action) => (
                  <div
                    key={action.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                  >
                    <div>
                      <p className="font-bold text-slate-700">
                        {t(action.action)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {t("by")} {action.actor_name} · {dateTime(action.created_at)}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-[#6549C9]">
                      {action.previous_value} → {action.new_value}
                    </p>
                  </div>
                ))
              ) : (
                <p className="px-4 py-6 text-center text-sm text-slate-400">
                  {t("noAdminChanges")}
                </p>
              )}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={isSelf || user.is_staff}
              onClick={() =>
                onChange(user, {
                  role: user.role === "admin" ? "donor" : "admin",
                })
              }
              className="rounded-xl bg-[#F0ECFF] px-4 py-2.5 text-sm font-bold text-[#6549C9] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {user.role === "admin" ? t("changeDonor") : t("promoteAdmin")}
            </button>
            <button
              type="button"
              disabled={isSelf}
              onClick={() => onChange(user, { is_active: !user.is_active })}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 ${user.is_active ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}
            >
              {user.is_active ? t("suspendAccount") : t("activateAccount")}
            </button>
          </div>
          {isSelf && (
            <p className="mt-3 text-right text-xs text-slate-400">
              {t("selfAccessWarning")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function UserManagement({
  users,
  meta,
  page,
  search,
  role,
  accountStatus,
  currentUser,
  onSearch,
  onRole,
  onStatus,
  onPageChange,
  onView,
  onChange,
}) {
  const { t, formatDate, formatNumber } = useLanguage();
  const pages = Math.max(1, Math.ceil(meta.count / 10));
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(43,37,80,.06)]">
      <div className="px-6 py-5">
        {/* <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold">{t("registeredUsers")}</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review account activity and control platform access.
            </p>
          </div>
          <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-[#6549C9]">
            {meta.count} users
          </span>
        </div> */}
        <div className="mt-5 grid gap-3 md:grid-cols-[minmax(240px,1fr)_180px_180px]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-400 focus-within:border-[#7A5BE6] focus-within:bg-white">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder={t("searchNameEmail")}
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none"
            />
          </label>
          <select
            value={role}
            onChange={(event) => onRole(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 outline-none focus:border-[#7A5BE6]"
          >
            <option value="">{t("allRoles")}</option>
            <option value="donor">{t("donors")}</option>
            <option value="admin">{t("administrators")}</option>
          </select>
          <select
            value={accountStatus}
            onChange={(event) => onStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-600 outline-none focus:border-[#7A5BE6]"
          >
            <option value="">{t("allStatuses")}</option>
            <option value="active">{t("active")}</option>
            <option value="suspended">{t("suspended")}</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-y border-slate-100 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-5 py-3">{t("user")}</th>
              <th className="px-5 py-3">{t("role")}</th>
              <th className="px-5 py-3">{t("activity")}</th>
              <th className="px-5 py-3">{t("totalDonated")}</th>
              <th className="px-5 py-3">{t("status")}</th>
              <th className="px-5 py-3">{t("joined")}</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.length ? (
              users.map((item) => {
                const isSelf = item.id === currentUser?.id;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#EEE9FF] font-extrabold text-[#6549C9]">
                          {item.username?.[0]?.toUpperCase()}
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">
                            {[item.first_name, item.last_name]
                              .filter(Boolean)
                              .join(" ") || item.username}
                            {isSelf && (
                              <span className="ml-2 text-xs text-slate-400">
                                {t("you")}
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.role === "admin" ? "bg-violet-50 text-[#6549C9]" : "bg-sky-50 text-sky-700"}`}
                      >
                        {item.role === "admin" ? t("administrator") : t("donor")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      <p>
                        <strong className="text-slate-700">
                          {formatNumber(item.campaign_count)}
                        </strong>{" "}
                        {t("campaigns")}
                      </p>
                      <p className="mt-1">
                        <strong className="text-slate-700">
                          {formatNumber(item.donation_count)}
                        </strong>{" "}
                        {t("donations")}
                      </p>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-[#6549C9]">
                      {kyat(item.total_donated)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${item.is_active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${item.is_active ? "bg-emerald-500" : "bg-rose-500"}`}
                        />
                        {item.is_active ? t("active") : t("suspended")}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-500">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onView(item)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:text-[#6549C9]"
                        >
                          {t("view")}
                        </button>
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() =>
                            onChange(item, { is_active: !item.is_active })
                          }
                          className={`rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-40 ${item.is_active ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}
                        >
                          {item.is_active ? t("suspend") : t("activate")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="7"
                  className="px-5 py-16 text-center text-sm text-slate-400"
                >
                  {t("noUsersMatch")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AdminPagination
        page={page}
        pages={pages}
        count={meta.count}
        hasPrevious={Boolean(meta.previous)}
        hasNext={Boolean(meta.next)}
        onPageChange={onPageChange}
      />
    </section>
  );
}

function Overview({ report, campaigns, onReview, onSection }) {
  const { t, formatDate, formatKyat, formatNumber } = useLanguage();
  const monthData = report?.donations_by_month || [];
  const peak = Math.max(...monthData.map((item) => Number(item.total)), 1);
  const pending = campaigns.filter((campaign) => campaign.status === "pending");
  return (
    <div className="space-y-6">
      {/* <section className="overflow-hidden rounded-3xl bg-[#25194B] p-7 text-white shadow-xl shadow-violet-950/15 md:p-9">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#D7C8FF]">
              Givera operations
            </p>
            <h2 className="mt-3 max-w-xl text-3xl font-extrabold tracking-tight md:text-4xl">
              A clear view of community impact.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100">
              Track the money, verify campaigns, and keep donor trust at the
              centre of every decision.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSection("campaigns")}
            className="rounded-2xl bg-[#FFD66B] px-5 py-3 text-sm font-extrabold text-[#2b1d52] shadow-lg shadow-black/10"
          >
            Review {pending.length} pending requests
          </button>
        </div>
      </section> */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CircleDollarSign}
          label={t("totalRaised")}
          value={formatKyat(report?.total_raised)}
          note={t("allDonationsNote")}
          tone="bg-violet-100 text-[#6549C9]"
        />
        <MetricCard
          icon={Megaphone}
          label={t("activeCampaigns")}
          value={report ? formatNumber(report.active_campaigns) : "—"}
          note={t("acceptingSupport")}
          tone="bg-emerald-100 text-emerald-700"
        />
        <MetricCard
          icon={ClipboardCheck}
          label={t("pendingReview")}
          value={report ? formatNumber(report.pending_requests) : "—"}
          note={t("awaitingDecision")}
          tone="bg-amber-100 text-amber-700"
        />
        <MetricCard
          icon={Users}
          label={t("uniqueDonors")}
          value={report ? formatNumber(report.total_donors) : "—"}
          note={t("contributorsNote")}
          tone="bg-sky-100 text-sky-700"
        />
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.45fr_.8fr]">
        <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
          <div className="flex items-start justify-between">
            <div>
              {/* <p className="text-xs font-bold uppercase tracking-[.16em] text-[#6F52D9]">
                Fundraising momentum
              </p> */}
              <h3 className="mt-2 text-2xl font-extrabold text-slate-900">
                {t("monthlyVolume")}
              </h3>
            </div>
            <span className="rounded-xl bg-violet-50 p-2.5 text-[#6F52D9]">
              <TrendingUp size={20} />
            </span>
          </div>
          <div className="mt-8 flex h-56 items-stretch gap-3 border-b border-slate-100 pb-2">
            {monthData.length ? (
              monthData.map((item) => {
                const percentage = Math.max(
                  (Number(item.total) / peak) * 100,
                  8,
                );
                return (
                  <div
                    key={item.month}
                    className="flex h-full min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <span className="whitespace-nowrap text-[11px] font-extrabold text-[#6549C9]">
                      {formatKyat(item.total)}
                    </span>
                    <div className="flex min-h-0 w-full flex-1 items-end justify-center">
                      <div
                        className="w-full max-w-14 rounded-t-xl bg-gradient-to-t from-[#6F52D9] to-[#B59CFF] shadow-sm shadow-violet-300/40"
                        style={{ height: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {formatDate(item.month, { month: "short" })}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="m-auto text-sm text-slate-400">
                {t("trendsEmpty")}
              </p>
            )}
          </div>
        </article>
        <article className="rounded-3xl bg-[#FFFAE9] p-6">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FFD66B] text-[#4C3910]">
            <ShieldCheck size={21} />
          </span>
          <p className="mt-6 text-4xl font-extrabold text-[#33260C]">
            {formatNumber(pending.length)}
          </p>
          <h3 className="mt-2 text-lg font-extrabold text-[#33260C]">
            {t("campaignsNeedReview")}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#746037]">
            {t("reviewBeforePublish")}
          </p>
          <button
            type="button"
            onClick={() => onSection("campaigns")}
            className="mt-6 text-sm font-extrabold text-[#4C3910] bg-[#ffd25e] rounded-xl px-4 py-2.5 hover:transition hover:bg-[#ffd25e]"
          >
            {t("openReviewQueue")}
          </button>
        </article>
      </section>
      <section className="rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(43,37,80,.06)]">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h3 className="text-2xl font-extrabold">
              {t("priorityReviews")}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {t("latestRequests")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSection("campaigns")}
            className="text-sm font-bold text-[#6F52D9]"
          >
            {t("seeAll")}
          </button>
        </div>
        {pending.slice(0, 4).length ? (
          pending.slice(0, 4).map((campaign) => (
            <div
              key={campaign.id}
              className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-4"
            >
              <div>
                <p className="font-bold text-slate-800">{campaign.title}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {campaign.owner_name} · {t("goal")} {formatKyat(campaign.goal_amount)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onReview(campaign)}
                className="rounded-xl bg-[#F0ECFF] px-3.5 py-2 text-xs font-bold text-[#6549C9]"
              >
                {t("reviewRequest")}
              </button>
            </div>
          ))
        ) : (
          <p className="border-t border-slate-100 px-6 py-10 text-center text-sm text-slate-400">
            {t("reviewClear")}
          </p>
        )}
      </section>
      <section className="pt-3">
        {/* <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-[#6F52D9]">
            Analytics and reporting
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            Platform insights
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Review fundraising performance, donor behaviour, campaign health,
            and downloadable records without leaving Overview.
          </p>
        </div> */}
        <Insights report={report} />
      </section>
    </div>
  );
}

const exportDatasets = [
  [
    "transactions",
    "transactions",
    Heart,
    "bg-rose-50 text-rose-600",
  ],
  [
    "campaigns",
    "campaigns",
    Megaphone,
    "bg-violet-100 text-[#6549C9]",
  ],
  [
    "users",
    "users",
    Users,
    "bg-sky-100 text-sky-700",
  ],
  [
    "utilization",
    "utilizationReports",
    FileBarChart,
    "bg-amber-100 text-amber-700",
  ],
];

function ExportCenter() {
  const { t } = useLanguage();
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");

  const download = async (resource, fileFormat) => {
    const key = `${resource}-${fileFormat}`;
    setDownloading(key);
    setError("");
    try {
      const response = await api.get(`/reports/export/${resource}/`, {
        params: { file_format: fileFormat },
        responseType: "blob",
      });
      const disposition = response.headers["content-disposition"] || "";
      const filename =
        disposition.match(/filename="?([^";]+)"?/)?.[1] ||
        `givera-${resource}.${fileFormat}`;
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError(t("exportError"));
    } finally {
      setDownloading("");
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(43,37,80,.06)]">
      <div className="flex flex-wrap items-start justify-between gap-4 px-6 py-6 md:px-7">
        <div>
          <h3 className="mt-2 text-2xl font-extrabold">
            {t("downloadExports")}
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {t("downloadExportsText")}
          </p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FFF4C7] text-[#7A5B00]">
          <Download size={21} />
        </span>
      </div>
      <div className="grid border-t border-slate-100 sm:grid-cols-2 xl:grid-cols-4">
        {exportDatasets.map(
          ([resource, labelKey, Icon, tone], index) => (
            <article
              key={resource}
              className={`p-5 ${index ? "border-t border-slate-100 sm:border-l sm:border-t-0" : ""} ${index === 2 ? "sm:border-l-0 xl:border-l" : ""} ${index > 1 ? "sm:border-t xl:border-t-0" : ""}`}
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}
              >
                <Icon size={19} />
              </span>
              <h3 className="mt-4 font-extrabold text-slate-800">{t(labelKey)}</h3>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={Boolean(downloading)}
                  onClick={() => download(resource, "csv")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-extrabold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-45"
                >
                  <FileSpreadsheet size={15} />{" "}
                  {downloading === `${resource}-csv` ? t("preparing") : "CSV"}
                </button>
                <button
                  type="button"
                  disabled={Boolean(downloading)}
                  onClick={() => download(resource, "pdf")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#6F52D9] px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#6044C7] disabled:opacity-45"
                >
                  <FileText size={15} />{" "}
                  {downloading === `${resource}-pdf` ? t("preparing") : "PDF"}
                </button>
              </div>
            </article>
          ),
        )}
      </div>
      {error && (
        <p className="border-t border-rose-100 bg-rose-50 px-6 py-3 text-sm font-bold text-rose-700">
          {error}
        </p>
      )}
    </section>
  );
}

function Insights({ report }) {
  const { t, formatKyat, formatNumber } = useLanguage();
  const statuses = report?.campaigns_by_status || [];
  const categories = report?.donations_by_category || [];
  const paymentMethods = report?.payment_methods || [];
  const topCampaigns = report?.top_campaigns || [];
  const statusTotal = Math.max(
    statuses.reduce((sum, item) => sum + item.count, 0),
    1,
  );
  const categoryTotal = Math.max(
    categories.reduce((sum, item) => sum + Number(item.total), 0),
    1,
  );
  const methodTotal = Math.max(
    paymentMethods.reduce((sum, item) => sum + item.donations, 0),
    1,
  );
  const anonymousRate = report?.total_donations
    ? Math.round((report.anonymous_donations / report.total_donations) * 100)
    : 0;
  const palette = [
    "bg-[#6F52D9]",
    "bg-[#FFD66B]",
    "bg-emerald-500",
    "bg-sky-500",
    "bg-rose-400",
    "bg-orange-400",
  ];

  return (
    <div className="space-y-6">
      <ExportCenter />
      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* <p className="text-xs font-bold uppercase tracking-[.16em] text-[#6F52D9]">
                Campaign health
              </p> */}
              <h3 className="text-2xl font-extrabold">
                {t("campaignStatusMix")}
              </h3>
            </div>
            <BarChart3 size={21} className="text-[#6F52D9]" />
          </div>
          <div className="mt-8 space-y-5">
            {statuses.length ? (
              statuses.map((item, index) => (
                <div key={item.status}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-bold capitalize text-slate-700">
                      {t(item.status)}
                    </span>
                    <span className="font-bold text-slate-400">
                      {formatNumber(item.count)} ·{" "}
                      {Math.round((item.count / statusTotal) * 100)}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${palette[index % palette.length]}`}
                      style={{ width: `${(item.count / statusTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-slate-400">
                {t("noCampaignStatusData")}
              </p>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              {/* <p className="text-xs font-bold uppercase tracking-[.16em] text-[#6F52D9]">
                Cause distribution
              </p> */}
              <h3 className="text-2xl font-extrabold">
                {t("donationsCategory")}
              </h3>
            </div>
            <Heart size={21} className="text-[#6F52D9]" />
          </div>
          <div className="mt-8 space-y-5">
            {categories.length ? (
              categories.map((item, index) => (
                <div key={item.category}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${palette[index % palette.length]}`}
                      />
                      <span className="font-bold text-slate-700">
                        {t(item.category)}
                      </span>
                    </div>
                    <span className="font-bold text-slate-500">
                      {formatKyat(item.total)}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${palette[index % palette.length]}`}
                      style={{
                        width: `${(Number(item.total) / categoryTotal) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-right text-[11px] font-bold text-slate-400">
                    {formatNumber(item.donations)} {t("donations")}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-slate-400">
                {t("categoryInsightsEmpty")}
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <article className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(43,37,80,.06)]">
          <div className="px-7 py-6">
            {/* <p className="text-xs font-bold uppercase tracking-[.16em] text-[#6F52D9]">
              Fundraising leaders
            </p> */}
            <h3 className="text-2xl font-extrabold">
              {t("topCampaigns")}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {t("rankedDonations")}
            </p>
          </div>
          <div className="border-t border-slate-100">
            {topCampaigns.length ? (
              topCampaigns.map((campaign, index) => {
                const progress = Math.min(
                  Math.round(
                    (Number(campaign.donated_total) /
                      Number(campaign.goal_amount || 1)) *
                      100,
                  ),
                  100,
                );
                return (
                  <div
                    key={campaign.id}
                    className="grid gap-3 border-b border-slate-100 px-7 py-4 last:border-0 sm:grid-cols-[32px_minmax(0,1fr)_auto] sm:items-center"
                  >
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-extrabold ${index === 0 ? "bg-[#FFD66B] text-[#493600]" : "bg-violet-50 text-[#6549C9]"}`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-extrabold text-slate-800">
                          {campaign.title}
                        </p>
                        <span className="text-xs font-bold text-[#6549C9]">
                          {progress}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#7A5BE6]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-xs text-slate-400">
                        {formatNumber(campaign.donation_count)} {t("donations")} · {formatNumber(campaign.donor_count)} {t("donors")}
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-extrabold text-slate-700">
                      {formatKyat(campaign.donated_total)}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="px-7 py-12 text-center text-sm text-slate-400">
                {t("campaignRankingsEmpty")}
              </p>
            )}
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-3xl bg-[#25194B] p-7 text-white shadow-xl shadow-violet-950/15">
            <ShieldCheck size={25} className="text-[#FFD66B]" />
            <p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-indigo-200">
              {t("donorPrivacy")}
            </p>
            <p className="mt-2 text-4xl font-extrabold">{anonymousRate}%</p>
            <p className="mt-2 text-sm leading-6 text-indigo-100">
              {formatNumber(report?.anonymous_donations || 0)} {t("of")} {formatNumber(report?.total_donations || 0)} {t("anonymousDonationsText")}
            </p>
          </article>
          <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
            {/* <p className="text-xs font-bold uppercase tracking-[.16em] text-[#6F52D9]">
              Demo checkout
            </p> */}
            <h3 className="text-2xl font-extrabold">
              {t("paymentUsage")}
            </h3>
            <div className="mt-5 space-y-3">
              {paymentMethods.length ? (
                paymentMethods.map((method, index) => (
                  <div key={method.provider}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-700">
                        {method.label}
                      </span>
                      <span className="font-extrabold text-[#6549C9]">
                        {formatNumber(method.donations)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${palette[index % palette.length]}`}
                        style={{
                          width: `${(method.donations / methodTotal) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-5 text-center text-sm text-slate-400">
                  {t("noPaymentData")}
                </p>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

const profileFields = [
  ["firstName", "first_name", "text", UserRound, "firstName"],
  ["lastName", "last_name", "text", UserRound, "lastName"],
  ["username", "username", "text", UserRound, "username"],
  ["emailAddress", "email", "email", Mail, "emailAddress"],
  ["phone", "phone_number", "tel", Phone, "phone"],
  ["location", "country", "text", MapPin, "location"],
];

const apiError = (error, fallback) => {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data.detail === "string") return data.detail;
  const first = Object.values(data).flat()[0];
  return typeof first === "string" ? first : fallback;
};

function AdminSettings({ user: sessionUser, onUserChange }) {
  const { language, t, formatDate } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    country: "",
    bio: "",
  });
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const fillProfile = (data) => {
    setProfile(data);
    setForm({
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      username: data.username || "",
      email: data.email || "",
      phone_number: data.phone_number || "",
      country: data.country || "",
      bio: data.bio || "",
    });
  };

  useEffect(() => {
    api
      .get("/auth/profile/")
      .then(({ data }) => fillProfile(data))
      .catch(() =>
        setProfileMessage(t("adminProfileLoadError")),
      );
  }, [t]);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setProfileMessage("");
    try {
      const { data } = await api.patch("/auth/profile/", form);
      fillProfile(data);
      localStorage.setItem("user", JSON.stringify(data));
      window.dispatchEvent(new Event("userUpdated"));
      onUserChange(data);
      setEditing(false);
      setProfileMessage(t("profileSaved"));
    } catch (error) {
      setProfileMessage(language === "my" ? t("profileSaveError") : apiError(error, t("profileSaveError")));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage("");
    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordMessage(t("passwordMismatch"));
      return;
    }
    setChangingPassword(true);
    try {
      const { data } = await api.post("/auth/change-password/", {
        old_password: passwords.old_password,
        new_password: passwords.new_password,
      });
      setPasswords({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      setPasswordMessage((language === "en" && data.detail) || t("passwordUpdated"));
    } catch (error) {
      setPasswordMessage(
        language === "my" ? t("passwordUpdateError") : apiError(error, t("passwordUpdateError")),
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (!profile)
    return (
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center text-sm text-slate-400">
        {profileMessage || t("loadingAdminProfile")}
      </div>
    );
  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    profile.username;
  const initial =
    displayName?.[0]?.toUpperCase() ||
    sessionUser?.username?.[0]?.toUpperCase() ||
    "A";
  const effectiveRole = profile.is_staff ? "admin" : profile.role;
  const profileMessageSuccess = profileMessage === t("profileSaved");
  const passwordMessageSuccess = passwordMessage === t("passwordUpdated");

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="space-y-6 xl:sticky xl:top-4">
        <section className="overflow-hidden rounded-3xl bg-[#25194B] text-white shadow-xl shadow-violet-950/15">
          <div className="h-20 bg-gradient-to-r from-[#6F52D9] to-[#9C7CF1]" />
          <div className="px-6 pb-7">
            <div className="-mt-10 grid h-20 w-20 place-items-center overflow-hidden rounded-3xl border-4 border-[#25194B] bg-[#FFD66B] text-3xl font-extrabold text-[#302250]">
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
            <h2 className="mt-4 text-xl font-extrabold">{displayName}</h2>
            <p className="mt-1 break-all text-sm text-indigo-200">
              {profile.email}
            </p>
            <span className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#FFD66B]">
              {t("platformAdministrator")}
            </span>
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)]">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#6F52D9]">
            {t("accountDetails")}
          </p>
          <div className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">{t("accessLevel")}</span>
              <span className="font-bold capitalize text-slate-700">
                {effectiveRole === "admin" ? t("administrator") : t("donor")}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">{t("signInMethod")}</span>
              <span className="font-bold capitalize text-slate-700">
                {profile.auth_provider}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">{t("emailStatus")}</span>
              <span
                className={`font-bold ${profile.is_email_verified ? "text-emerald-600" : "text-amber-600"}`}
              >
                {profile.is_email_verified ? t("verified") : t("notVerified")}
              </span>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <p className="text-slate-400">{t("adminSince")}</p>
              <p className="mt-1 font-bold text-slate-700">
                {formatDate(profile.created_at, { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        </section>
      </aside>

      <div className="space-y-6">
        {!editing ? (
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)] md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.1em] text-[#6F52D9]">
                  {t("personalInformation")}
                </p>
                <h3 className="mt-2 text-2xl font-extrabold">{t("adminDetails")}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {t("adminContactInfo")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileMessage("");
                  setEditing(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#F0ECFF] px-4 py-2.5 text-sm font-bold text-[#6549C9] hover:bg-[#E5DDFF]"
              >
                <UserRound size={17} /> {t("editProfile")}
              </button>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {profileFields.map(([label, name, , Icon]) => (
                <div
                  key={name}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#6F52D9] shadow-sm">
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      {t(label)}
                    </p>
                    <p className="mt-1 break-words text-sm font-bold text-slate-700">
                      {profile[name] || t("notProvided")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                {t("aboutYou")}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {profile.bio || t("noAdminBio")}
              </p>
            </div>
            {profileMessage && (
              <p
                className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${profileMessageSuccess ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
              >
                {profileMessage}
              </p>
            )}
          </section>
        ) : (
          <form
            onSubmit={saveProfile}
            className="rounded-3xl border border-[#D8CCFF] bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)] md:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#6F52D9]">
                  {t("editingProfile")}
                </p>
                <h2 className="mt-2 text-xl font-extrabold">
                  {t("updateAdminDetails")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("adminEditHint")}
                </p>
              </div>
              <span className="rounded-xl bg-violet-50 p-2.5 text-[#6F52D9]">
                <UserRound size={20} />
              </span>
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {profileFields.map(([label, name, type, Icon, placeholder]) => (
                <label key={name} className="text-sm font-bold text-slate-700">
                  {t(label)}
                  <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 focus-within:border-[#7A5BE6] focus-within:ring-2 focus-within:ring-violet-100">
                    <Icon size={17} className="shrink-0 text-slate-400" />
                    <input
                      required={["username", "email"].includes(name)}
                      type={type}
                      value={form[name]}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [name]: event.target.value,
                        }))
                      }
                      placeholder={t(placeholder)}
                      className="min-w-0 flex-1 bg-transparent py-3 text-sm font-normal text-slate-800 outline-none"
                    />
                  </div>
                </label>
              ))}
            </div>
            <label className="mt-5 block text-sm font-bold text-slate-700">
              {t("aboutYou")}
              <textarea
                value={form.bio}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    bio: event.target.value,
                  }))
                }
                rows={4}
                maxLength={1000}
                placeholder={t("shortAdminBio")}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-800 outline-none focus:border-[#7A5BE6] focus:ring-2 focus:ring-violet-100"
              />
            </label>
            {profileMessage && (
              <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                {profileMessage}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  fillProfile(profile);
                  setProfileMessage("");
                  setEditing(false);
                }}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#6F52D9] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-300/30 disabled:opacity-50"
              >
                <Save size={17} /> {saving ? t("saving") : t("saveChanges")}
              </button>
            </div>
          </form>
        )}

        <form
          onSubmit={changePassword}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_12px_30px_rgba(43,37,80,.06)] md:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.1em] text-[#6F52D9]">
                {t("security")}
              </p>
              <h3 className="mt-2 text-2xl font-extrabold">{t("changePassword")}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {t("strongPassword")}
              </p>
            </div>
            <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
              <LockKeyhole size={20} />
            </span>
          </div>
          {profile.auth_provider === "google" && (
            <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
              {t("googlePasswordInfo")}
            </p>
          )}
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {[
              [t("currentPassword"), "old_password"],
              [t("newPassword"), "new_password"],
              [t("confirmNewPassword"), "confirm_password"],
            ].map(([label, name]) => (
              <label key={name} className="text-sm font-bold text-slate-700">
                {label}
                <input
                  required
                  type="password"
                  minLength={8}
                  autoComplete={
                    name === "old_password"
                      ? "current-password"
                      : "new-password"
                  }
                  value={passwords[name]}
                  onChange={(event) =>
                    setPasswords((current) => ({
                      ...current,
                      [name]: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal outline-none focus:border-[#7A5BE6] focus:ring-2 focus:ring-violet-100"
                />
              </label>
            ))}
          </div>
          {passwordMessage && (
            <p
              className={`mt-4 rounded-xl px-4 py-3 text-sm font-bold ${passwordMessageSuccess ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
            >
              {passwordMessage}
            </p>
          )}
          <div className="mt-6 flex justify-end">
            <button
              disabled={changingPassword}
              className="inline-flex items-center gap-2 rounded-xl border border-[#6F52D9] px-5 py-3 text-sm font-bold text-[#6549C9] disabled:opacity-50"
            >
              <LockKeyhole size={17} />{" "}
              {changingPassword ? t("updating") : t("updatePassword")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null"),
  );
  const [section, setSection] = useState(() => {
    const requestedSection = new URLSearchParams(window.location.search).get("section");
    return ["overview", "campaigns", "donations", "users", "settings"].includes(requestedSection)
      ? requestedSection
      : "overview";
  });
  const [report, setReport] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignPage, setCampaignPage] = useState(1);
  const [donations, setDonations] = useState([]);
  const [donationPage, setDonationPage] = useState(1);
  const [donationSearch, setDonationSearch] = useState("");
  const [donationMeta, setDonationMeta] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState("");
  const [userStatus, setUserStatus] = useState("");
  const [userMeta, setUserMeta] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [notice, setNotice] = useState(() =>
    location.state?.adminCampaignCreated
      ? `${t("campaignPublished")}: “${location.state.adminCampaignCreated}”`
      : "",
  );
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/reports/dashboard/"),
      api.get("/campaigns/admin/all/"),
    ])
      .then(([reportResponse, campaignResponse]) => {
        setReport(reportResponse.data);
        setCampaigns(campaignResponse.data);
      })
      .catch(() => setNotice(t("dashboardLoadError")));
  }, [t]);
  useEffect(() => {
    const params = new URLSearchParams({
      page: String(donationPage),
      page_size: "10",
    });
    if (donationSearch.trim()) params.set("q", donationSearch.trim());
    api
      .get(`/donations/admin/all/?${params}`)
      .then(({ data }) => {
        setDonations(data.results || []);
        setDonationMeta({
          count: data.count || 0,
          next: data.next,
          previous: data.previous,
        });
      })
      .catch(() => setNotice(t("transactionsLoadError")));
  }, [donationPage, donationSearch, t]);
  useEffect(() => {
    const params = new URLSearchParams({
      page: String(userPage),
      page_size: "10",
    });
    if (userSearch.trim()) params.set("q", userSearch.trim());
    if (userRole) params.set("role", userRole);
    if (userStatus) params.set("status", userStatus);
    api
      .get(`/auth/admin/users/?${params}`)
      .then(({ data }) => {
        setUsers(data.results || []);
        setUserMeta({
          count: data.count || 0,
          next: data.next,
          previous: data.previous,
        });
      })
      .catch(() => setNotice(t("usersLoadError")));
  }, [userPage, userSearch, userRole, userStatus, t]);
  const pending = campaigns.filter((campaign) => campaign.status === "pending");
  const title = {
    overview: t("goodMorning"),
    campaigns: t("campaignReview"),
    donations: t("transactions"),
    users: t("userManagement"),
    settings: t("profileSettings"),
  }[section];
  const subtitle = {
    overview: t("latestActivity"),
    campaigns: t("reviewSubtitle"),
    donations: t("transactionSubtitle"),
    users: t("usersSubtitle"),
    settings: t("settingsSubtitle"),
  }[section];
  const review = async (campaign, status, rejection_reason = "") => {
    try {
      await api.patch(`/campaigns/${campaign.id}/review/`, {
        status,
        rejection_reason,
      });
      setCampaigns((items) =>
        items.map((item) =>
          item.id === campaign.id
            ? {
                ...item,
                status,
                status_label: t(status),
              }
            : item,
        ),
      );
      setReport(
        (current) =>
          current && {
            ...current,
            pending_requests: Math.max(current.pending_requests - 1, 0),
            active_campaigns:
              status === "approved"
                ? current.active_campaigns + 1
                : current.active_campaigns,
          },
      );
      setSelectedCampaign(null);
      setNotice(`“${campaign.title}” was ${status}.`);
    } catch {
      setNotice(t("reviewSaveError"));
    }
  };
  const campaignSaved = async (campaign) => {
    const wasEditing = Boolean(editingCampaign);
    setCreatingCampaign(false);
    setEditingCampaign(null);
    setNotice(`${t(wasEditing ? "campaignUpdated" : "campaignPublished")}: “${campaign.title}”`);
    try {
      const [reportResponse, campaignResponse] = await Promise.all([
        api.get("/reports/dashboard/"),
        api.get("/campaigns/admin/all/"),
      ]);
      setReport(reportResponse.data);
      setCampaigns(campaignResponse.data);
      setCampaignPage(1);
    } catch {
      setNotice(t("dashboardLoadError"));
    }
  };
  const manageCampaign = async (campaign, action) => {
    if (!window.confirm(`${t("confirmCampaignAction")} “${campaign.title}”?`)) return;
    try {
      const { data } = await api.patch(`/campaigns/${campaign.id}/manage/`, { action });
      setCampaigns((items) => items.map((item) => item.id === data.id ? data : item));
      setSelectedCampaign(null);
      setNotice(`${t("campaignActionSaved")}: “${campaign.title}”`);
      const { data: refreshedReport } = await api.get("/reports/dashboard/");
      setReport(refreshedReport);
    } catch (requestError) {
      setNotice((language === "en" && requestError.response?.data?.action?.[0]) || t("campaignActionError"));
    }
  };
  const editCampaign = (campaign) => {
    setSelectedCampaign(null);
    setEditingCampaign(campaign);
  };
  const viewUser = useCallback(async (item) => {
    try {
      const { data } = await api.get(`/auth/admin/users/${item.id}/`);
      setSelectedUser(data);
    } catch {
      setNotice(t("userDetailsLoadError"));
    }
  }, [t]);
  const changeUser = useCallback(async (item, changes) => {
    const actionKey =
      "role" in changes
        ? changes.role === "admin"
          ? "promoteAdmin"
          : "changeDonor"
        : changes.is_active
          ? "activateAccount"
          : "suspendAccount";
    if (!window.confirm(`${t("confirmUserAction")} ${t(actionKey)}?`)) return;
    try {
      const { data } = await api.patch(
        `/auth/admin/users/${item.id}/`,
        changes,
      );
      setUsers((items) =>
        items.map((entry) =>
          entry.id === data.id ? { ...entry, ...data } : entry,
        ),
      );
      if (selectedUser?.id === data.id) setSelectedUser(data);
      setNotice(t("userAccountUpdated"));
    } catch (error) {
      setNotice(
        (language === "en" && error.response?.data?.detail) || t("userUpdateError"),
      );
    }
  }, [language, selectedUser, t]);
  const content = useMemo(
    () => ({
      overview: (
        <Overview
          report={report}
          campaigns={campaigns}
          onReview={setSelectedCampaign}
          onSection={setSection}
        />
      ),
      campaigns: (
        <Campaigns
          campaigns={campaigns}
          page={campaignPage}
          onPageChange={setCampaignPage}
          onReview={setSelectedCampaign}
          onView={(campaign) => navigate(`/campaigns/${campaign.id}`)}
        />
      ),
      donations: (
        <Transactions
          donations={donations}
          meta={donationMeta}
          page={donationPage}
          search={donationSearch}
          onSearch={(value) => {
            setDonationSearch(value);
            setDonationPage(1);
          }}
          onPageChange={setDonationPage}
        />
      ),
      users: (
        <UserManagement
          users={users}
          meta={userMeta}
          page={userPage}
          search={userSearch}
          role={userRole}
          accountStatus={userStatus}
          currentUser={user}
          onSearch={(value) => {
            setUserSearch(value);
            setUserPage(1);
          }}
          onRole={(value) => {
            setUserRole(value);
            setUserPage(1);
          }}
          onStatus={(value) => {
            setUserStatus(value);
            setUserPage(1);
          }}
          onPageChange={setUserPage}
          onView={viewUser}
          onChange={changeUser}
        />
      ),
      settings: <AdminSettings user={user} onUserChange={setUser} />,
    }),
    [
      report,
      campaigns,
      campaignPage,
      donations,
      donationMeta,
      donationPage,
      donationSearch,
      users,
      userMeta,
      userPage,
      userSearch,
      userRole,
      userStatus,
      navigate,
      user,
      viewUser,
      changeUser,
    ],
  );
  return (
    <div data-language={language} className="min-h-screen bg-[#F6F6FB] text-slate-900">
      <div className="mx-auto max-w-[1500px] p-4 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        <Sidebar
          section={section}
          onSection={setSection}
          user={user}
          pending={pending.length}
          onLogout={() => {
            logout();
            navigate("/login");
          }}
        />
        <main className="min-w-0 py-6 lg:py-4">
          <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="mt-2 text-3xl font-extrabold text-[#7A5BE6] md:text-4xl">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
            </div>
            {section === "campaigns" && (
              <button
                type="button"
                onClick={() => setCreatingCampaign(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#6F52D9] px-5 py-3 text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(111,82,217,.22)] transition hover:bg-[#6045C4]"
              >
                <Plus size={18} /> {t("createCampaign")}
              </button>
            )}
            {/* <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold text-slate-600">
                System operational
              </span> 
            </div> */}
          </header>
          {notice && (
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-[#EEE9FF] px-4 py-3 text-sm font-bold text-[#563DAF]">
              <span>{notice}</span>
              <button type="button" onClick={() => setNotice("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {content[section]}
        </main>
      </div>
      {selectedCampaign && (
        <ReviewModal
          campaign={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
          onReview={review}
          onEdit={editCampaign}
          onManage={manageCampaign}
        />
      )}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          currentUser={user}
          onClose={() => setSelectedUser(null)}
          onChange={changeUser}
        />
      )}
      {(creatingCampaign || editingCampaign) && (
        <CreateCampaignModal
          campaignId={editingCampaign?.id}
          onClose={() => {
            setCreatingCampaign(false);
            setEditingCampaign(null);
          }}
          onSaved={campaignSaved}
        />
      )}
    </div>
  );
}
