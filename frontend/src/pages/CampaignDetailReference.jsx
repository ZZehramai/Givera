import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  FileImage,
  Heart,
  ImagePlus,
  LockKeyhole,
  Paperclip,
  Send,
  Share2,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import api from "../api/axios";
import { mediaUrl } from "../utils/mediaUrl";
import LanguageSwitch from "../components/LanguageSwitch";
import { useLanguage } from "../i18n/LanguageContext";

const fallbackImage =
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80";

export default function CampaignDetailReference() {
  const { t, formatKyat, formatDate } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loadedAt] = useState(() => Date.now());
  const [campaign, setCampaign] = useState(null);
  const [donors, setDonors] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [reports, setReports] = useState([]);
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
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryCaption, setGalleryCaption] = useState("");
  const [galleryError, setGalleryError] = useState("");
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [galleryInputKey, setGalleryInputKey] = useState(0);
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
  const completePayment = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(
        `/donations/demo-checkout/${checkout.id}/simulate/`,
        { outcome: "success" },
      );
      setCheckout(null);
      setReceipt(data);
      setAmount("");
      setMessage("");
      setAnonymous(false);
      await load();
    } catch {
      setError(t("paymentCompleteError"));
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
        requestError.response?.data?.media?.[0] ||
          requestError.response?.data?.detail ||
          t("updatePublishError"),
      );
    } finally {
      setUpdateBusy(false);
    }
  };
  const uploadGalleryMedia = async (event) => {
    event.preventDefault();
    if (!galleryFiles.length) return setGalleryError(t("chooseMedia"));
    setGalleryBusy(true);
    setGalleryError("");
    const form = new FormData();
    galleryFiles.forEach((file) => form.append("files", file));
    if (galleryCaption.trim()) form.append("caption", galleryCaption.trim());
    try {
      const { data } = await api.post(`/campaigns/${id}/media/`, form);
      setCampaign((current) => ({
        ...current,
        gallery_media: [...data, ...(current.gallery_media || [])],
      }));
      setGalleryFiles([]);
      setGalleryCaption("");
      setGalleryInputKey((value) => value + 1);
    } catch (requestError) {
      setGalleryError(
        requestError.response?.data?.files?.[0] ||
          requestError.response?.data?.detail ||
          t("mediaUploadError"),
      );
    } finally {
      setGalleryBusy(false);
    }
  };
  const removeGalleryMedia = async (mediaId) => {
    if (!window.confirm(t("removeMediaConfirm"))) return;
    try {
      await api.delete(`/campaigns/${id}/media/${mediaId}/`);
      setCampaign((current) => ({
        ...current,
        gallery_media: (current.gallery_media || []).filter(
          (item) => item.id !== mediaId,
        ),
      }));
    } catch {
      setGalleryError(t("removeMediaError"));
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
      <div className="mx-auto flex max-w-[1280px] justify-end px-5 pt-5 sm:px-8">
        <LanguageSwitch />
      </div>
      <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
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

            <CampaignGallery
              items={campaign.gallery_media || []}
              reports={reports}
              isOrganizer={isOrganizer}
              files={galleryFiles}
              setFiles={setGalleryFiles}
              caption={galleryCaption}
              setCaption={setGalleryCaption}
              inputKey={galleryInputKey}
              busy={galleryBusy}
              error={galleryError}
              onUpload={uploadGalleryMedia}
              onRemove={removeGalleryMedia}
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
              isOrganizer={isOrganizer}
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

            <section className="mt-10">
              <h3 className="text-3xl font-extrabold">{t("fundsUsed")}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {t("reportsTransparency")}
              </p>
              {isAdmin && (
                <AdminReportForm
                  form={reportForm}
                  setForm={setReportForm}
                  onSubmit={publishReport}
                  error={reportError}
                />
              )}
              {reports.length ? (
                <div className="mt-5 space-y-3">
                  {reports.map((report) => (
                    <article
                      key={report.id}
                      className="rounded-xl bg-white p-5 shadow-sm"
                    >
                      <h3 className="font-extrabold">{report.title}</h3>
                      <p className="mt-1 text-xs font-bold text-[#6F52D9]">
                        {formatKyat(report.amount_spent)} ·{" "}
                        {formatDate(report.spent_on)}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {report.description}
                      </p>
                      {report.evidence && (
                        <a
                          href={mediaUrl(report.evidence)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#6F52D9]"
                        >
                          <FileImage size={16} /> {t("viewEvidence")}
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-5 rounded-xl bg-[#F1EDFF] p-5 text-sm text-slate-600">
                  {t("noReports")}
                </p>
              )}
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
          </aside>
        </div>
      </main>
      {checkout && (
        <Checkout
          checkout={checkout}
          busy={busy}
          onClose={() => setCheckout(null)}
          onComplete={completePayment}
        />
      )}
      {receipt && (
        <Receipt receipt={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  );
}

function CoverChoices({ campaign, activeCover, setActiveCover }) {
  const covers = [
    campaign.cover_image,
    ...(campaign.cover_media || []).map((item) => item.file),
  ].filter(Boolean);
  if (covers.length < 2) return null;
  return (
    <div
      className="mt-3 flex gap-2 overflow-x-auto pb-1"
      aria-label="Campaign cover images"
    >
      {covers.map((cover, index) => (
        <button
          key={cover}
          type="button"
          onClick={() => setActiveCover(cover)}
          className={`shrink-0 overflow-hidden rounded-lg border-2 ${activeCover === cover ? "border-[#6F52D9]" : "border-transparent opacity-70 hover:opacity-100"}`}
          aria-label={`Show cover image ${index + 1}`}
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

function CampaignGallery({
  items,
  reports,
  isOrganizer,
  files,
  setFiles,
  caption,
  setCaption,
  inputKey,
  busy,
  error,
  onUpload,
  onRemove,
}) {
  const { t, formatNumber } = useLanguage();
  const evidence = reports.filter((report) => report.evidence);
  const hasContent = items.length > 0 || evidence.length > 0;

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#6F52D9]">
            {t("photosEvidence")}
          </p>
          <h3 className="mt-1 text-3xl font-extrabold">
            {t("campaignGallery")}
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            {t("galleryDescription")}
          </p>
        </div>
        {hasContent && (
          <span className="rounded-full bg-[#EEE9FF] px-3 py-1 text-xs font-extrabold text-[#6549C9]">
            {formatNumber(items.length + evidence.length)} {t("galleryItems")}
          </span>
        )}
      </div>
      {hasContent ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <MediaTile
              key={item.id}
              item={item}
              canRemove={isOrganizer}
              onRemove={onRemove}
            />
          ))}
          {evidence.map((report) => (
            <EvidenceTile key={`evidence-${report.id}`} report={report} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-[#CFC4F7] bg-white/60 px-5 py-8 text-center">
          <ImagePlus className="mx-auto text-[#8066DE]" size={28} />
          <p className="mt-3 text-sm font-extrabold">{t("noGallery")}</p>
          <p className="mt-1 text-xs text-slate-500">{t("noGalleryText")}</p>
        </div>
      )}
      {isOrganizer && (
        <form
          onSubmit={onUpload}
          className="mt-4 rounded-xl border border-[#DDD3FF] bg-[#F1EDFF] p-5"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-[#6F52D9]">
              <Upload size={19} />
            </span>
            <div>
              <p className="text-sm font-extrabold">{t("addGallery")}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {t("galleryUploadHelp")}
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <input
                key={inputKey}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={(event) =>
                  setFiles(Array.from(event.target.files || []).slice(0, 6))
                }
                className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-[#E9E3FF] file:px-3 file:py-1.5 file:font-bold file:text-[#6549C9]"
              />
              {files.length > 0 && (
                <p className="mt-1 text-[11px] font-bold text-[#6549C9]">
                  {formatNumber(files.length)} {t("filesSelected")}
                </p>
              )}
            </div>
            <button
              disabled={busy}
              className="rounded-lg bg-[#6F52D9] px-5 py-2 text-sm font-extrabold text-white disabled:opacity-60"
            >
              {busy ? t("uploading") : t("uploadMedia")}
            </button>
          </div>
          <input
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={200}
            placeholder={t("optionalCaption")}
            className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#6F52D9]"
          />
          {error && (
            <p className="mt-2 text-xs font-bold text-rose-600">{error}</p>
          )}
        </form>
      )}
    </section>
  );
}

function MediaTile({ item, canRemove, onRemove }) {
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
            alt={item.caption || t("campaignGallery")}
            className="aspect-video w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        </a>
      )}
      {(item.caption || canRemove) && (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-slate-950/90 to-transparent px-4 pb-3 pt-10 text-white">
          <p className="line-clamp-2 text-xs font-semibold">
            {item.caption ||
              (item.media_type === "video"
                ? t("campaignVideo")
                : t("campaignPhoto"))}
          </p>
          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label="Remove media"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 hover:bg-rose-500"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function EvidenceTile({ report }) {
  const { t } = useLanguage();
  const url = mediaUrl(report.evidence);
  const cleanUrl = url.split("?")[0].toLowerCase();
  const isImage = /\.(jpe?g|png|gif|webp)$/.test(cleanUrl);
  const isVideo = /\.(mp4|webm|mov|m4v)$/.test(cleanUrl);
  return (
    <article className="overflow-hidden rounded-xl border border-[#F1D780] bg-[#FFFAE9]">
      {isImage ? (
        <a href={url} target="_blank" rel="noreferrer">
          <img
            src={url}
            alt={`${report.title} evidence`}
            className="aspect-video w-full object-cover"
          />
        </a>
      ) : isVideo ? (
        <video
          controls
          preload="metadata"
          src={url}
          className="aspect-video w-full bg-slate-900 object-cover"
        />
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="grid aspect-video place-items-center bg-[#FFF4C7] text-[#755A08]"
        >
          <FileImage size={34} />
          <span className="sr-only">Open evidence</span>
        </a>
      )}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A6A08]">
            {t("verifiedEvidence")}
          </p>
          <p className="mt-1 text-sm font-extrabold">{report.title}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-xs font-extrabold text-[#6549C9]"
        >
          {t("open")}
        </a>
      </div>
    </article>
  );
}

function CampaignUpdates({
  updates,
  isOrganizer,
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
  const { t, formatDate, formatNumber } = useLanguage();
  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#6F52D9]">
            {t("fromOrganizer")}
          </p>
          <h3 className="mt-1 text-3xl font-extrabold">{t("latestUpdates")}</h3>
        </div>
        {updates.length > 0 && (
          <span className="text-xs font-bold text-slate-400">
            {formatNumber(updates.length)} {t("published")}
          </span>
        )}
      </div>
      {isOrganizer && (
        <form
          onSubmit={onSubmit}
          className="mt-5 rounded-xl border border-[#DDD3FF] bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-extrabold">{t("shareProgress")}</p>
          <p className="mt-1 text-xs text-slate-500">{t("progressHelp")}</p>
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
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#6F52D9]"
          />
          <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#CFC4F7] bg-[#F8F6FF] px-3 py-3 text-xs font-bold text-[#6549C9]">
            <Paperclip size={16} /> {t("addMedia")}
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
            <div className="mt-2 flex flex-wrap gap-2">
              {media.map((file) => (
                <span
                  key={`${file.name}-${file.size}`}
                  className="rounded-full bg-[#EEE9FF] px-3 py-1 text-[11px] font-bold text-[#6549C9]"
                >
                  {file.name}
                </span>
              ))}
            </div>
          )}
          {error && (
            <p className="mt-2 text-xs font-bold text-rose-600">{error}</p>
          )}
          <button
            disabled={busy}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#6F52D9] px-4 py-2.5 text-sm font-extrabold text-white disabled:opacity-60"
          >
            <Send size={15} /> {busy ? t("publishing") : t("publishUpdate")}
          </button>
        </form>
      )}
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
        !isOrganizer && (
          <p className="mt-5 rounded-xl bg-[#F1EDFF] p-5 text-sm text-slate-600">
            {t("noUpdates")}
          </p>
        )
      )}
    </section>
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
              {language === "my" ? "ကျပ်" : "Ks"}
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
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                ["kbzpay", "KBZPay"],
                ["wave", "Wave"],
                ["mmqr", "MMQR"],
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
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#6549C9]"
        >
          <Share2 size={15} /> {t("shareCampaign")}
        </button>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400">
          <LockKeyhole size={12} /> {t("demoOnly")}
        </span>
      </div>
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
function Checkout({ checkout, busy, onClose, onComplete }) {
  const { t, formatKyat } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-extrabold text-slate-900">
            {t("demoPayment")}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-5 rounded-xl bg-[#F0ECFF] p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#6F52D9]">
            {checkout.provider_label}
          </p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {formatKyat(checkout.amount)}
          </p>
          <p className="mt-2 font-mono text-xs font-bold text-slate-500">
            {checkout.transaction_reference}
          </p>
        </div>
        <button
          disabled={busy}
          onClick={onComplete}
          className="mt-5 w-full rounded-lg bg-[#6F52D9] py-3 font-bold text-white"
        >
          <CheckCircle2 className="mr-2 inline" size={18} />{" "}
          {busy ? t("completing") : t("confirmDemo")}
        </button>
        <p className="mt-3 text-center text-xs text-slate-400">
          {t("noRealFunds")}
        </p>
      </div>
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
          {t("donationCompleted")}
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          {formatKyat(receipt.amount)} {t("via")} {receipt.provider_label}
        </p>
        <p className="mt-3 font-mono text-xs font-bold text-slate-600">
          {receipt.transaction_reference}
        </p>
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
