import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileImage,
  Heart,
  LockKeyhole,
  Paperclip,
  QrCode,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import api from "../api/axios";
import { mediaUrl } from "../utils/mediaUrl";
import { useLanguage } from "../i18n/LanguageContext";
import  CommentsSection from "../components/CommentsSection.jsx";

const fallbackImage =
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80";

export default function CampaignDetailReference() {
  const { language, t, formatKyat, formatDate } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loadedAt] = useState(() => Date.now());
  const [campaign, setCampaign] = useState(null);
  const [donors, setDonors] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [reports, setReports] = useState([]);
  const [reportIndex, setReportIndex] = useState(0);
  const [activeCover, setActiveCover] = useState("");
  const [amount, setAmount] = useState("");
  const [provider, setProvider] = useState("kbzpay");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [checkout, setCheckout] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateBody, setUpdateBody] = useState("");
  const [updateMedia, setUpdateMedia] = useState([]);
  const [updateError, setUpdateError] = useState("");
  const [updateBusy, setUpdateBusy] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    amount_spent: "",
    spent_on: "",
    evidence: null,
  });
  const [reportError, setReportError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin" || user?.is_staff;
  const isOrganizer = user?.id === campaign?.owner;
  const loggedIn = Boolean(localStorage.getItem("access"));
  const load = async () => {
    const [a, b, c, d] = await Promise.all([
      api.get(`/campaigns/${id}/`),
      api.get(`/campaigns/${id}/donors/`),
      api.get(`/campaigns/${id}/updates/`),
      api.get(`/campaigns/${id}/fund-utilization/`),
    ]);
    setCampaign(a.data);
    setActiveCover(a.data.cover_image || a.data.cover_media?.[0]?.file || "");
    setDonors(b.data);
    setUpdates(c.data);
    setReports(d.data);
    setReportIndex(0);
    setReportForm((current) => ({
      ...current,
      amount_spent:
        current.amount_spent ||
        (Number(a.data.amount_raised) > 0 ? String(a.data.amount_raised) : ""),
    }));
  };
  // This request intentionally refreshes whenever the route campaign id changes.
  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    load().catch(() => setError(t("campaignNotFound")));
  }, [id, t]);
  useEffect(() => {
    if (!campaign || !window.location.hash) return;
    const sectionId = window.location.hash.slice(1);
    window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [campaign, updates.length, reports.length]);
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  const startPayment = async (event) => {
    event.preventDefault();
    setError("");
    if (Number(amount) < 1000) return setError(t("minimumAmount"));
    setBusy(true);
    try {
      const { data } = await api.post("/donations/demo-checkout/", {
        campaign_id: id,
        provider,
        amount: Number(amount),
        message,
        is_anonymous: anonymous,
      });
      setCheckout(data);
    } catch {
      setError(t("checkoutError"));
    } finally {
      setBusy(false);
    }
  };
  const submitPaymentProof = async ({ walletTransactionId, receiptFile }) => {
    setBusy(true);
    const form = new FormData();
    if (walletTransactionId.trim()) form.append("wallet_transaction_id", walletTransactionId.trim());
    if (receiptFile) form.append("receipt", receiptFile);
    try {
      const { data } = await api.post(
        `/donations/demo-checkout/${checkout.id}/proof/`,
        form,
      );
      setCheckout(null);
      setReceipt(data);
      setAmount("");
      setMessage("");
      setAnonymous(false);
    } catch (requestError) {
      throw new Error(
        (language === "en" && requestError.response?.data?.detail) || t("paymentProofError"),
        { cause: requestError },
      );
    } finally {
      setBusy(false);
    }
  };
  const publishUpdate = async (event) => {
    event.preventDefault();
    if (!updateTitle.trim() || !updateBody.trim())
      return setUpdateError(t("updateRequired"));
    setUpdateBusy(true);
    setUpdateError("");
    const form = new FormData();
    form.append("title", updateTitle.trim());
    form.append("body", updateBody.trim());
    updateMedia.forEach((file) => form.append("media", file));
    try {
      const { data } = await api.post(`/campaigns/${id}/updates/`, form);
      setUpdates((items) => [data, ...items]);
      setUpdateTitle("");
      setUpdateBody("");
      setUpdateMedia([]);
    } catch (requestError) {
      setUpdateError(
        (language === "en" && (requestError.response?.data?.media?.[0] ||
          requestError.response?.data?.detail)) ||
          t("updatePublishError"),
      );
    } finally {
      setUpdateBusy(false);
    }
  };
  const publishReport = async (event) => {
    event.preventDefault();
    setReportError("");
    if (
      !reportForm.title ||
      !reportForm.description ||
      !reportForm.amount_spent ||
      !reportForm.spent_on
    )
      return setReportError(t("reportRequired"));
    const form = new FormData();
    Object.entries(reportForm).forEach(([key, value]) => {
      if (value) form.append(key, value);
    });
    try {
      const { data } = await api.post(
        `/campaigns/${id}/fund-utilization/`,
        form,
      );
      setReports((items) => [data, ...items]);
      setReportIndex(0);
      setReportForm({
        title: "",
        description: "",
        amount_spent:
          Number(campaign.amount_raised) > 0
            ? String(campaign.amount_raised)
            : "",
        spent_on: "",
        evidence: null,
      });
    } catch {
      setReportError(t("reportPublishError"));
    }
  };
  if (error && !campaign)
    return (
      <div className="grid min-h-screen place-items-center bg-[#F7F5FC]">
        <p className="font-bold text-slate-700">{error}</p>
      </div>
    );
  if (!campaign)
    return (
      <div className="grid min-h-screen place-items-center bg-[#F7F5FC]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#DDD3FF] border-t-[#6F52D9]" />
      </div>
    );
  const progress = Math.min(Number(campaign.progress_percentage || 0), 100);
  const days = Math.max(
    0,
    Math.ceil((new Date(campaign.deadline) - loadedAt) / 86400000),
  );
  return (
    <div className="min-h-screen bg-white pb-16 text-[#201A36]">
      <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
        <button
          type="button"
          onClick={() => navigate(location.state?.campaignReturnTo || "/campaigns")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#6F52D9]"
        >
          ← {t("back")}
        </button>

        <div className="grid gap-x-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
          <section className="min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFD66B] px-3 py-1 text-[11px] font-extrabold text-[#4C3910]">
              <Sparkles size={13} />{" "}
              {campaign.status === "completed"
                ? t("completedCampaign")
                : t("featuredCampaign")}
            </span>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              {campaign.title}
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-6 text-slate-600">
              {campaign.summary}
            </p>
            <img
              src={mediaUrl(activeCover, fallbackImage)}
              alt=""
              className="mt-5 aspect-[16/9] w-full rounded-xl object-cover shadow-lg shadow-slate-300/40"
            />
            <CoverChoices
              campaign={campaign}
              activeCover={activeCover}
              setActiveCover={setActiveCover}
            />

            <section className="mt-12">
              <h3 className="text-3xl font-extrabold">{t("mission")}</h3>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {campaign.story}
              </p>
              {/* <div className="mt-6">
                <Impact
                  icon={<CheckCircle2 size={23} />}
                  title={t("verifiedCampaign")}
                  body={`${t("beneficiary")}: ${campaign.beneficiary} · ${t("location")}: ${campaign.location}`}
                />
              </div> */}
            </section>

            <CampaignUpdates
              updates={updates}
            />

            <section id="fund-utilization" className="mt-10 scroll-mt-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="text-3xl font-extrabold">{t("fundsUsed")}</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {t("reportsTransparency")}
                  </p>
                </div>
                {reports.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="mr-1 text-xs font-bold text-slate-500">
                      {reportIndex + 1} / {reports.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setReportIndex((index) => Math.max(0, index - 1))}
                      disabled={reportIndex === 0}
                      aria-label={t("previousReport")}
                      className="grid h-10 w-10 place-items-center rounded-full border border-[#D9CEFF] bg-white text-[#6549C9] shadow-sm transition hover:bg-[#F1EDFF] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronLeft size={19} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportIndex((index) => Math.min(reports.length - 1, index + 1))}
                      disabled={reportIndex === reports.length - 1}
                      aria-label={t("nextReport")}
                      className="grid h-10 w-10 place-items-center rounded-full border border-[#D9CEFF] bg-white text-[#6549C9] shadow-sm transition hover:bg-[#F1EDFF] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ChevronRight size={19} />
                    </button>
                  </div>
                )}
              </div>
              {isAdmin && (
                <AdminReportForm
                  form={reportForm}
                  setForm={setReportForm}
                  onSubmit={publishReport}
                  error={reportError}
                />
              )}
              {reports.length ? (
                <SpendingReportCard
                  report={reports[reportIndex]}
                  formatKyat={formatKyat}
                  formatDate={formatDate}
                />
              ) : (
                <p className="mt-5 rounded-xl bg-[#F1EDFF] p-5 text-sm text-slate-600">
                  {t("noReports")}
                </p>
              )}
            </section>

            {/* ADD COMMENTS SECTION HERE */}
            <section className="mt-10">
              <CommentsSection campaignId={id} />
            </section>
          </section>

          <aside className="mt-7 space-y-5 lg:mt-20">
            <DonationCard
              campaign={campaign}
              progress={progress}
              days={days}
              donors={donors}
              loggedIn={loggedIn}
              amount={amount}
              setAmount={setAmount}
              provider={provider}
              setProvider={setProvider}
              message={message}
              setMessage={setMessage}
              anonymous={anonymous}
              setAnonymous={setAnonymous}
              error={error}
              busy={busy}
              onSubmit={startPayment}
            />
            <DonorCard donors={donors} />
            <section className="rounded-xl bg-white p-5 shadow-sm">
              <h3 className="text-xl font-extrabold">{t("milestones")}</h3>
              <div className="mt-5 border-l-2 border-dashed border-[#D9CEFF] pl-5">
                <Milestone
                  state="completed"
                  title={t("campaignApproved")}
                  body={t("campaignApprovedText")}
                />
                <Milestone
                  state="activePhase"
                  title={t("fundraisingSupport")}
                  body={t("fundraisingSupportText")}
                />
                <Milestone
                  state="upcoming"
                  title={t("utilizationMilestone")}
                  body={t("utilizationMilestoneText")}
                />
              </div>
            </section>
            <div className="rounded-xl bg-[#EEE9FF] p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {t("organizer")}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#6F52D9] font-extrabold text-white">
                  {campaign.owner_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-extrabold">
                    {campaign.owner_name}
                  </p>
                  <p className="text-xs text-slate-600">
                    {t("campaignOrganizer")}
                  </p>
                </div>
              </div>
            </div>
            {isOrganizer && (
              <UpdateForm
                title={updateTitle}
                setTitle={setUpdateTitle}
                body={updateBody}
                setBody={setUpdateBody}
                media={updateMedia}
                setMedia={setUpdateMedia}
                busy={updateBusy}
                error={updateError}
                onSubmit={publishUpdate}
              />
            )}
          </aside>
        </div>
      </main>
      {checkout && (
        <Checkout
          checkout={checkout}
          busy={busy}
          onClose={() => setCheckout(null)}
          onSubmit={submitPaymentProof}
        />
      )}
      {receipt && (
        <Receipt receipt={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  );
}

function CoverChoices({ campaign, activeCover, setActiveCover }) {
  const { t, formatNumber } = useLanguage();
  const covers = [
    campaign.cover_image,
    ...(campaign.cover_media || []).map((item) => item.file),
  ].filter(Boolean);
  if (covers.length < 2) return null;
  return (
    <div
      className="mt-3 flex gap-2 overflow-x-auto pb-1"
      aria-label={t("campaignCoverImagesLabel")}
    >
      {covers.map((cover, index) => (
        <button
          key={cover}
          type="button"
          onClick={() => setActiveCover(cover)}
          className={`shrink-0 overflow-hidden rounded-lg border-2 ${activeCover === cover ? "border-[#6F52D9]" : "border-transparent opacity-70 hover:opacity-100"}`}
          aria-label={`${t("showCoverImage")} ${formatNumber(index + 1)}`}
        >
          <img
            src={mediaUrl(cover)}
            alt=""
            className="h-16 w-24 object-cover"
          />
        </button>
      ))}
    </div>
  );
}

function MediaTile({ item }) {
  const { t } = useLanguage();
  return (
    <article className="group relative overflow-hidden rounded-xl bg-slate-900 shadow-sm">
      {item.media_type === "video" ? (
        <video
          controls
          preload="metadata"
          src={mediaUrl(item.file)}
          className="aspect-video w-full object-cover"
        />
      ) : (
        <a href={mediaUrl(item.file)} target="_blank" rel="noreferrer">
          <img
            src={mediaUrl(item.file)}
            alt={item.caption || t("campaignPhoto")}
            className="aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        </a>
      )}
      {item.caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent px-4 pb-3 pt-10 text-white">
          <p className="line-clamp-2 text-xs font-semibold">{item.caption}</p>
        </div>
      )}
    </article>
  );
}

function SpendingReportCard({ report, formatKyat, formatDate }) {
  const { t } = useLanguage();
  const evidenceUrl = report.evidence ? mediaUrl(report.evidence) : "";
  const cleanUrl = evidenceUrl.split("?")[0].toLowerCase();
  const isImage = /\.(jpe?g|png|gif|webp)$/.test(cleanUrl);
  const isVideo = /\.(mp4|webm|mov|m4v)$/.test(cleanUrl);

  return (
    <article className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_12px_28px_rgba(75,54,140,.1)]">
      <div className="relative overflow-hidden bg-[#EEE9FF]">
        {isImage ? (
          <a href={evidenceUrl} target="_blank" rel="noreferrer">
            <img
              src={evidenceUrl}
              alt={`${report.title} ${t("evidence")}`}
              className="aspect-video w-full object-cover transition duration-300 hover:scale-[1.015]"
            />
          </a>
        ) : isVideo ? (
          <video
            controls
            preload="metadata"
            src={evidenceUrl}
            className="aspect-video w-full bg-slate-900 object-cover"
          />
        ) : (
          <a
            href={evidenceUrl || undefined}
            target={evidenceUrl ? "_blank" : undefined}
            rel={evidenceUrl ? "noreferrer" : undefined}
            className={`grid aspect-[16/7] place-items-center bg-[#F1EDFF] text-[#6F52D9] ${evidenceUrl ? "hover:bg-[#E8E1FF]" : "pointer-events-none"}`}
          >
            <div className="text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm">
                <FileImage size={27} />
              </span>
              <p className="mt-3 text-xs font-extrabold">
                {evidenceUrl ? t("viewEvidence") : t("noEvidenceAttached")}
              </p>
            </div>
          </a>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-[#FFD66B] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#4C3910] shadow-sm">
          {t("verifiedEvidence")}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-extrabold text-[#201A36]">{report.title}</h3>
            <p className="mt-1 text-xs font-bold text-[#6F52D9]">
              {formatKyat(report.amount_spent)} · {formatDate(report.spent_on)}
            </p>
          </div>
          {evidenceUrl && (
            <a
              href={evidenceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#D9CEFF] px-4 py-2 text-xs font-extrabold text-[#6549C9] transition hover:bg-[#F1EDFF]"
            >
              <FileImage size={15} /> {t("viewEvidence")}
            </a>
          )}
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{report.description}</p>
      </div>
    </article>
  );
}

function CampaignUpdates({ updates }) {
  const { t, formatDate, formatNumber } = useLanguage();
  return (
    <section id="latest-updates" className="mt-10 scroll-mt-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          {/* <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#6F52D9]">
            {t("fromOrganizer")}
          </p> */}
          <h3 className="mt-1 text-3xl font-extrabold">{t("latestUpdates")}</h3>
        </div>
        {updates.length > 0 && (
          <span className="text-xs font-bold text-slate-400">
            {formatNumber(updates.length)} {t("published")}
          </span>
        )}
      </div>
      {updates.length ? (
        <div className="mt-5 space-y-4">
          {updates.map((update) => (
            <article
              key={update.id}
              className="rounded-xl bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold text-[#6F52D9]">
                  {formatDate(update.created_at)}
                </p>
                <p className="text-[11px] font-bold text-slate-400">
                  {update.author_name}
                </p>
              </div>
              <h3 className="mt-1 font-extrabold">{update.title}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {update.body}
              </p>
              {update.media?.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {update.media.map((item) => (
                    <MediaTile key={item.id} item={item} canRemove={false} />
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-[#F1EDFF] p-5 text-sm text-slate-600">
          {t("noUpdates")}
        </p>
      )}
    </section>
  );
}

function UpdateForm({
  title,
  setTitle,
  body,
  setBody,
  media,
  setMedia,
  busy,
  error,
  onSubmit,
}) {
  const { t, formatNumber } = useLanguage();
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-white bg-white p-5 shadow-md"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-[#6F52D9]">
        {t("fromOrganizer")}
      </p>
      <h3 className="mt-1 text-xl font-extrabold">{t("shareProgress")}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{t("progressHelp")}</p>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={160}
        placeholder={t("updateTitle")}
        className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#6F52D9]"
      />
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={2000}
        rows={4}
        placeholder={t("progressPlaceholder")}
        className="mt-3 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#6F52D9]"
      />
      <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#CFC4F7] bg-[#F8F6FF] px-3 py-3 text-xs font-bold text-[#6549C9]">
        <Paperclip size={16} className="shrink-0" /> {t("addMedia")}
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
          onChange={(event) =>
            setMedia(Array.from(event.target.files || []).slice(0, 6))
          }
          className="sr-only"
        />
      </label>
      {media.length > 0 && (
        <p className="mt-2 text-[11px] font-bold text-[#6549C9]">
          {formatNumber(media.length)} {t("filesSelected")}
        </p>
      )}
      {error && <p className="mt-2 text-xs font-bold text-rose-600">{error}</p>}
      <button
        disabled={busy}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#6F52D9] px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
      >
        <Send size={15} /> {busy ? t("publishing") : t("publishUpdate")}
      </button>
    </form>
  );
}

function DonationCard({
  campaign,
  progress,
  days,
  donors,
  loggedIn,
  amount,
  setAmount,
  provider,
  setProvider,
  anonymous,
  setAnonymous,
  error,
  busy,
  onSubmit,
}) {
  const { t, formatKyat, formatNumber, language } = useLanguage();
  return (
    <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_14px_34px_rgba(32,33,68,.09)]">
      <p className="text-xl font-extrabold text-slate-900">
        {t("supportCampaign")}
      </p>
      <p className="mt-1 text-sm leading-5 text-slate-500">
        {t("contributionGoalText")}
      </p>
      <div className="mt-5 border-y border-slate-100 py-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-extrabold tracking-tight text-[#6549C9]">
              {formatKyat(campaign.amount_raised)}
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-400">
              {t("raisedOf")} {formatKyat(campaign.goal_amount)}
            </p>
          </div>
          <p className="text-lg font-extrabold text-slate-700">
            {formatNumber(progress)}%
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#6F52D9]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between text-xs font-bold text-slate-500">
          <span>
            {formatNumber(donors.length)} {t("supporters")}
          </span>
          <span>
            {formatNumber(days)} {t("daysRemaining")}
          </span>
        </div>
      </div>
      {campaign.status === "completed" ? (
        <div className="mt-5 rounded-xl bg-[#FFFAE9] p-5 text-center">
          <CheckCircle2 size={28} className="mx-auto text-[#7A5B00]" />
          <p className="mt-3 font-extrabold text-slate-800">
            {t("campaignCompleted")}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {t("campaignCompletedText")}
          </p>
        </div>
      ) : loggedIn ? (
        <form onSubmit={onSubmit} className="mt-5">
          <label className="text-sm font-extrabold text-slate-800">
            {t("chooseAmount")}
          </label>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[5000, 10000, 20000, 50000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className={`rounded-lg px-1 py-2 text-xs font-extrabold ${Number(amount) === preset ? "bg-[#EAE6FF] text-[#6549C9]" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {formatKyat(preset)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex rounded-xl border border-slate-200 focus-within:border-[#6F52D9]">
            <span className="grid w-12 place-items-center border-r border-slate-200 bg-slate-50 text-xs font-extrabold text-[#6549C9]">
              {language === "my" ? "ကျပ်" : "MMK"}
            </span>
            <input
              type="number"
              min="1000"
              step="1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t("enterAnotherAmount")}
              className="min-w-0 flex-1 rounded-r-xl px-3 py-3 text-sm font-bold outline-none"
            />
          </div>
          <div className="mt-4">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
              {t("payWith")}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {[
                ["kbzpay", "KBZPay"],
                ["wave", "WavePay"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setProvider(key)}
                  className={`rounded-lg border py-2 text-xs font-extrabold ${provider === key ? "border-[#6F52D9] bg-white text-[#6549C9] shadow-sm" : "border-slate-100 bg-slate-50 text-slate-500"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <label className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="accent-[#6F52D9]"
            />{" "}
            {t("donateAnonymous")}
          </label>
          {error && (
            <p className="mt-2 text-xs font-bold text-rose-600">{error}</p>
          )}
          <button
            disabled={busy}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6F52D9] py-3.5 font-extrabold text-white shadow-lg shadow-violet-200"
          >
            <Heart size={17} /> {busy ? t("openingCheckout") : t("donateNow")}
          </button>
        </form>
      ) : (
        <Link
          to="/login"
          className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#6F52D9] py-3.5 font-extrabold text-white"
        >
          <Heart size={17} /> {t("donateNow")}
        </Link>
      )}
      {/* <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#6549C9]"
        >
          <Share2 size={15} /> {t("shareCampaign")}
        </button>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
          <LockKeyhole size={12} /> {t("manualVerification")}
        </span>
      </div> */}
    </div>
  );
}

function Milestone({ state, title, body }) {
  const { t } = useLanguage();
  return (
    <div className="relative pb-8 pl-4 last:pb-0">
      <span
        className={`absolute -left-[27px] top-0 h-3 w-3 rounded-full ring-4 ${state === "upcoming" ? "bg-slate-300 ring-slate-100" : state === "completed" ? "bg-[#6F52D9] ring-[#EEE9FF]" : "bg-[#9B86E8] ring-[#EEE9FF]"}`}
      />
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#6F52D9]">
        {t(state)}
      </p>
      <p className="mt-1 text-sm font-extrabold">{title}</p>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </div>
  );
}
function DonorCard({ donors }) {
  const { t, formatDate, formatKyat, formatNumber } = useLanguage();
  return (
    <div className="rounded-xl bg-[#F3F0FF] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold">{t("recentDonors")}</h3>
        {/* <span className="text-xs font-bold text-[#6F52D9]">{t("seeAll")}</span> */}
      </div>
      <div className="mt-4 space-y-4">
        {donors.slice(0, 4).map((donor) => (
          <div
            key={donor.id}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#FFD66B] text-xs font-extrabold text-[#5A460B]">
                {donor.donor_name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-extrabold">{donor.donor_name}</p>
                <p className="text-[11px] text-slate-500">
                  {formatDate(donor.created_at)}
                </p>
              </div>
            </div>
            <p className="text-xs font-extrabold text-[#6F52D9]">
              {formatKyat(donor.amount)}
            </p>
          </div>
        ))}
        {!donors.length && (
          <p className="py-3 text-center text-sm text-slate-500">
            {t("beFirstSupporter")}
          </p>
        )}
      </div>
      <div className="mt-5 rounded-lg bg-[#FFFAE9] px-4 py-4 text-center">
        <Heart size={20} className="mx-auto text-[#7A5B00]" />
        <p className="mt-2 text-xs font-extrabold">{t("joinMovement")}</p>
        <p className="text-[11px] text-slate-600">
          {formatNumber(donors.length)} {t("contributed")}
        </p>
      </div>
    </div>
  );
}
function AdminReportForm({ form, setForm, onSubmit, error }) {
  const { t } = useLanguage();
  return (
    <form
      onSubmit={onSubmit}
      className="mt-5 rounded-xl border border-[#DDD3FF] bg-[#F4F1FF] p-5"
    >
      <p className="text-sm font-extrabold text-[#6549C9]">
        {t("adminPublishReport")}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder={t("expenseTitle")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <input
          value={form.amount_spent}
          onChange={(e) => setForm({ ...form, amount_spent: e.target.value })}
          type="number"
          placeholder={t("amountKyat")}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <input
          value={form.spent_on}
          onChange={(e) => setForm({ ...form, spent_on: e.target.value })}
          type="date"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        />
        <label className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-500">
          {t("supportingAttachment")}
          <input
            onChange={(e) =>
              setForm({ ...form, evidence: e.target.files?.[0] || null })
            }
            type="file"
            className="mt-1 block w-full text-xs"
          />
        </label>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">{t("fileHelp")}</p>
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={3}
        placeholder={t("explainFunds")}
        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
      />
      {error && <p className="mt-2 text-xs font-bold text-rose-600">{error}</p>}
      <button className="mt-3 rounded-lg bg-[#6F52D9] px-4 py-2 text-sm font-bold text-white">
        {t("publishReport")}
      </button>
    </form>
  );
}
function Checkout({ checkout, busy, onClose, onSubmit }) {
  const { t, formatKyat } = useLanguage();
  const [walletTransactionId, setWalletTransactionId] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [proofError, setProofError] = useState("");
  const [qrUnavailable, setQrUnavailable] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setProofError("");
    if (!walletTransactionId.trim() && !receiptFile) {
      setProofError(t("proofRequired"));
      return;
    }
    try {
      await onSubmit({ walletTransactionId, receiptFile });
    } catch (error) {
      setProofError(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="mx-auto my-6 w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#6F52D9]">{t("walletTransfer")}</p><p className="mt-1 text-xl font-extrabold text-slate-900">{checkout.provider_label}</p></div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-5 text-center">
          {qrUnavailable ? (
            <div className="mx-auto grid h-52 w-52 place-items-center rounded-3xl border-2 border-dashed border-[#D8CFFA] bg-[#F8F6FF] text-[#6F52D9]"><div><QrCode className="mx-auto" size={52} /><p className="mt-2 text-xs font-bold">{t("qrUnavailable")}</p></div></div>
          ) : (
            <img src={mediaUrl(checkout.qr_code_url)} onError={() => setQrUnavailable(true)} alt={`${checkout.provider_label} QR`} className="mx-auto h-52 w-52 rounded-3xl border border-slate-200 object-contain p-2 shadow-sm" />
          )}
          <p className="mt-4 text-3xl font-extrabold text-slate-900">
            {formatKyat(checkout.amount)}
          </p>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-[#F5F2FF] px-4 py-3">
          <div><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{t("paymentReference")}</p><p className="mt-1 font-mono text-xs font-extrabold text-slate-700">{checkout.transaction_reference}</p></div>
          <button type="button" onClick={() => navigator.clipboard?.writeText(checkout.transaction_reference)} className="rounded-lg bg-white p-2 text-[#6549C9] shadow-sm" aria-label={t("copyReference")}><Copy size={16} /></button>
        </div>
        <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          <p className="flex items-center gap-2 font-extrabold"><ShieldCheck size={17} /> {t("beforeSubmit")}</p>
          <p className="mt-1 leading-6">{t("transferInstructions")}</p>
        </div>
        <label className="mt-5 block text-sm font-extrabold text-slate-800">{t("walletTransactionNumber")}
          <input value={walletTransactionId} onChange={(event) => setWalletTransactionId(event.target.value)} maxLength={100} placeholder={t("transactionPlaceholder")} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-[#6F52D9]" />
        </label>
        <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#CFC3F7] bg-[#FAF8FF] p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EEE9FF] text-[#6549C9]"><Upload size={18} /></span>
          <span className="min-w-0"><strong className="block text-sm text-slate-800">{t("uploadReceipt")}</strong><span className="block truncate text-xs text-slate-400">{receiptFile?.name || t("receiptFileHelp")}</span></span>
          <input type="file" accept="image/*" onChange={(event) => setReceiptFile(event.target.files?.[0] || null)} className="sr-only" />
        </label>
        {proofError && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{proofError}</p>}
        <button
          disabled={busy}
          className="mt-5 w-full rounded-xl bg-[#6F52D9] py-3.5 font-bold text-white disabled:opacity-60"
        >
          <CheckCircle2 className="mr-2 inline" size={18} />{" "}
          {busy ? t("submittingProof") : t("submitVerification")}
        </button>
      </form>
    </div>
  );
}
function Receipt({ receipt, onClose }) {
  const { t, formatKyat } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-2xl">
        <CheckCircle2 className="mx-auto text-emerald-600" size={42} />
        <h3 className="mt-4 text-2xl font-extrabold">
          {t("proofReceived")}
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          {formatKyat(receipt.amount)} {t("via")} {receipt.provider_label}
        </p>
        <p className="mt-3 font-mono text-xs font-bold text-slate-600">
          {receipt.transaction_reference}
        </p>
        <p className="mt-4 text-sm leading-6 text-slate-500">{t("pendingVerificationText")}</p>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-[#6F52D9] py-3 font-bold text-white"
        >
          {t("done")}
        </button>
      </div>
    </div>
  );
}
