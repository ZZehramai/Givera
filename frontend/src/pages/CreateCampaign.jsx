import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlignLeft, AlertTriangle, ArrowLeft, BookOpenText, Check, CheckCircle2, Sparkles, Trash2, Type, WalletCards, X } from "lucide-react";

import api from "../api/axios";
import { mediaUrl } from "../utils/mediaUrl";
import { useLanguage } from "../i18n/LanguageContext";

const initialForm = {
  title: "",
  summary: "",
  story: "",
  category: "community",
  beneficiary: "",
  location: "",
  goal_amount: "",
  cover_image: null,
  deadline: "",
};

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const minimumDeadline = tomorrow.toISOString().split("T")[0];

export default function CreateCampaign({ embedded = false, onSuccess, campaignId = null }) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const id = campaignId || routeId;
  const isEditing = Boolean(id);
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = currentUser?.role === "admin" || currentUser?.is_staff;
  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState("");
  const [supportingMedia, setSupportingMedia] = useState([]);
  const [supportingPreviews, setSupportingPreviews] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [assistantField, setAssistantField] = useState("");
  const [assistantSuggestion, setAssistantSuggestion] = useState("");
  const [assistantProvider, setAssistantProvider] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState("");

  useEffect(() => {
    if (!isEditing) return;

    api.get(`/campaigns/${id}/`)
      .then(({ data }) => {
        if (data.status !== "rejected" && !isAdmin) {
          setError(t("rejectedEditOnly"));
          return;
        }
        setForm({
          title: data.title || "",
          summary: data.summary || "",
          story: data.story || "",
          category: data.category || "community",
          beneficiary: data.beneficiary || "",
          location: data.location || "",
          goal_amount: data.goal_amount || "",
          cover_image: null,
          deadline: data.deadline || "",
        });
        setImagePreview(mediaUrl(data.cover_image, ""));
        setExistingMedia(data.cover_media || []);
        setRejectionReason(data.rejection_reason || t("reviewBeforeResubmit"));
      })
      .catch((requestError) => setError((language === "en" && requestError.response?.data?.detail) || t("campaignLoadError")))
      .finally(() => setLoading(false));
  }, [id, isAdmin, isEditing, language, t]);

  const update = (event) => {
    if (event.target.name === "cover_image") {
      const files = Array.from(event.target.files || []);
      if (files.length > 6) {
        setError(t("maxCoverImages"));
        event.target.value = "";
        return;
      }
      const invalidFile = files.find((file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024);
      if (invalidFile) {
        setError(`${invalidFile.name} ${t("invalidCoverImage")}`);
        event.target.value = "";
        return;
      }
      supportingPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
      const [primaryCover = null, ...additionalCovers] = files;
      setForm((current) => ({ ...current, cover_image: primaryCover }));
      setImagePreview(primaryCover ? URL.createObjectURL(primaryCover) : "");
      setSupportingMedia(additionalCovers);
      setSupportingPreviews(additionalCovers.map((file) => ({ file, url: URL.createObjectURL(file) })));
      setError("");
      return;
    }
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const removeSelectedMedia = (index) => {
    URL.revokeObjectURL(supportingPreviews[index].url);
    setSupportingMedia((files) => files.filter((_, itemIndex) => itemIndex !== index));
    setSupportingPreviews((previews) => previews.filter((_, itemIndex) => itemIndex !== index));
  };

  const removeExistingMedia = async (mediaId) => {
    try {
      await api.delete(`/campaigns/${id}/media/${mediaId}/`);
      setExistingMedia((items) => items.filter((item) => item.id !== mediaId));
    } catch (requestError) {
      setError((language === "en" && requestError.response?.data?.detail) || t("removeMediaError"));
    }
  };

  const requestWritingSuggestion = async (field) => {
    setAssistantField(field);
    setAssistantSuggestion("");
    setAssistantProvider("");
    setAssistantError("");
    setAssistantLoading(true);
    try {
      const { data } = await api.post("/ai/campaign-writing/", {
        field,
        content: field === "fund_usage" ? form.story : form[field],
        title: form.title,
        summary: form.summary,
        beneficiary: form.beneficiary,
        location: form.location,
        goal_amount: form.goal_amount || null,
        language,
      });
      setAssistantSuggestion(data.suggestion);
      setAssistantProvider(data.provider);
    } catch (requestError) {
      const responseData = requestError.response?.data;
      const validationMessage = responseData && typeof responseData === "object"
        ? Object.values(responseData).flat().join(" ")
        : "";
      setAssistantError((language === "en" && validationMessage) || t("writingAssistantError"));
    } finally {
      setAssistantLoading(false);
    }
  };

  const applyWritingSuggestion = () => {
    if (!assistantSuggestion) return;
    if (assistantField === "fund_usage") {
      setForm((current) => ({
        ...current,
        story: `${current.story.trim()}\n\n${t("fundUsageHeading")}\n${assistantSuggestion}`.trim(),
      }));
    } else {
      setForm((current) => ({ ...current, [assistantField]: assistantSuggestion }));
    }
    setAssistantSuggestion("");
    setAssistantProvider("");
    setAssistantField("");
  };

  const discardWritingSuggestion = () => {
    setAssistantSuggestion("");
    setAssistantProvider("");
    setAssistantField("");
    setAssistantError("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          payload.append(key, value);
        }
      });
      supportingMedia.forEach((file) => payload.append("cover_images", file));
      const { data } = isEditing
        ? await api.patch(`/campaigns/${id}/`, payload)
        : await api.post("/campaigns/", payload);
      if (isAdmin && onSuccess) {
        onSuccess(data);
        return;
      }
      if (!isEditing && isAdmin) {
        navigate(`/dashboard?section=campaigns&created=${data.id}`, {
          state: { adminCampaignCreated: data.title },
        });
        return;
      }
      navigate(`/dashboard?section=my-campaigns&submitted=${data.id}`, {
        state: {
          submissionMessage: isEditing ? t("campaignResubmitted") : t("submittedSuccess"),
          campaignTitle: data.title,
        },
      });
    } catch (requestError) {
      const data = requestError.response?.data;
      const firstError =
        data && typeof data === "object"
          ? Object.values(data).flat().join(" ")
          : null;
      setError((language === "en" && firstError) || t("campaignSubmitError"));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-outline-variant bg-white px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";

  const backLink = !embedded && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft size={17} /> {t("back")}
        </button>
  );

  if (loading) {
    if (embedded) {
      return <p className="py-24 text-center text-on-surface-variant">{t("loadingCampaign")}</p>;
    }
    return <div className="min-h-screen bg-surface"><p className="py-24 text-center text-on-surface-variant">{t("loadingCampaign")}</p></div>;
  }

  const content = (
      <main className={`mx-auto max-w-3xl px-6 ${embedded ? "pb-8 pt-7" : "py-12"}`}>
        {backLink}
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          {isEditing ? t("campaignRevision") : t("startImpact")}
        </p>
        <h1 className="mt-2 text-4xl font-bold text-on-surface">
          {isEditing ? (isAdmin ? t("editCampaign") : t("fixResubmit")) : t("createCampaign")}
        </h1>
        <p className="mt-3 text-on-surface-variant">
          {isEditing
            ? isAdmin
              ? t("adminEditHelp")
              : t("revisionHelp")
            : isAdmin
              ? t("adminPublishHelp")
              : t("submitPrivate")}
        </p>

        {isEditing && rejectionReason && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
            <div className="flex gap-3 bg-rose-50 px-5 py-4 text-rose-800">
              <AlertTriangle className="mt-0.5 shrink-0" size={20} />
              <div><p className="font-extrabold">{t("whyRejected")}</p><p className="mt-1 text-sm leading-6">{rejectionReason}</p></div>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm font-extrabold text-slate-800">{t("suggestedReviewPlaces")}</p>
              <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                {["reviewTitleSummary", "reviewStoryFunds", "reviewGoalBeneficiary", "reviewDeadlineCover"].map((item) => (
                  <p key={item} className="flex items-center gap-2"><CheckCircle2 size={15} className="shrink-0 text-primary" /> {t(item)}</p>
                ))}
              </div>
            </div>
          </section>
        )}

        <form onSubmit={submit} className="mt-10 space-y-6 rounded-3xl bg-white p-8 shadow-sm">
          {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          <section className="overflow-hidden rounded-[24px] border border-[#E4DDF8] bg-white shadow-[0_12px_30px_rgba(58,42,112,.08)]">
            <div className="flex flex-col gap-4 bg-[#271B4D] px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#FFD66B] text-[#271B4D]">
                  <Sparkles size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-extrabold">{t("writingAssistant")}</h2>
                  <p className="mt-0.5 text-xs leading-5 text-[#DCD4F7]">{t("writingAssistantHelp")}</p>
                </div>
              </div>
              <span className="w-fit rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[.14em] text-[#FFD66B]">
                Groq AI
              </span>
            </div>
            <div className="p-5">
              <p className="text-xs font-extrabold uppercase tracking-[.14em] text-slate-400">{t("chooseField")}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                ["title", "improveTitle", Type],
                ["summary", "improveSummary", AlignLeft],
                ["story", "improveStory", BookOpenText],
                ["fund_usage", "draftFundUsage", WalletCards],
              ].map(([field, label, Icon]) => (
                <button
                  key={field}
                  type="button"
                  disabled={assistantLoading}
                  onClick={() => requestWritingSuggestion(field)}
                  className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left text-sm font-bold transition disabled:opacity-50 ${assistantField === field ? "border-[#6F52D9] bg-[#F0EBFF] text-[#5B3FC0] ring-2 ring-[#DED4FF]" : "border-slate-200 bg-[#FBFAFE] text-slate-700 hover:border-[#CFC2F8] hover:bg-[#F7F4FF]"}`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${assistantField === field ? "bg-[#6F52D9] text-white" : "bg-white text-[#6F52D9] shadow-sm"}`}>
                    <Icon size={17} />
                  </span>
                  {assistantLoading && assistantField === field ? t("generatingSuggestion") : t(label)}
                </button>
              ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">{t("aiDataNotice")}</p>
            {assistantError && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{assistantError}</p>}
            {assistantSuggestion && (
              <div className="mt-5 rounded-2xl border border-[#F1D780] bg-[#FFF9E8] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.12em] text-[#5B3FC0]"><Sparkles size={14} /> {t("suggestedVersion")}</p>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500 shadow-sm">
                    {assistantProvider === "groq" ? t("aiGenerated") : t("demoSuggestion")}
                  </span>
                </div>
                <textarea
                  value={assistantSuggestion}
                  onChange={(event) => setAssistantSuggestion(event.target.value)}
                  rows={assistantField === "title" ? 2 : assistantField === "summary" ? 4 : 8}
                  className="mt-3 w-full rounded-xl border border-[#E8D794] bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-[#6F52D9]"
                />
                <p className="mt-2 text-xs text-slate-400">{t("reviewBeforeApply")}</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" onClick={discardWritingSuggestion} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50">
                    <X size={15} /> {t("discard")}
                  </button>
                  <button type="button" onClick={applyWritingSuggestion} className="inline-flex items-center gap-2 rounded-xl bg-[#6F52D9] px-4 py-2 text-sm font-bold text-white">
                    <Check size={15} /> {t("applySuggestion")}
                  </button>
                </div>
              </div>
            )}
            </div>
          </section>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">{t("campaignTitle")}</span>
            <input
              required
              maxLength="160"
              name="title"
              value={form.title}
              onChange={update}
              className={inputClass}
              placeholder={t("campaignTitlePlaceholder")}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">{t("shortSummary")}</span>
            <textarea
              required
              maxLength="280"
              rows="3"
              name="summary"
              value={form.summary}
              onChange={update}
              className={inputClass}
              placeholder={t("summaryPlaceholder")}
            />
            <span className="mt-1 block text-right text-xs text-on-surface-variant">
              {form.summary.length}/280
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">{t("fullStory")}</span>
            <textarea
              required
              rows="8"
              name="story"
              value={form.story}
              onChange={update}
              className={inputClass}
              placeholder={t("storyPlaceholder")}
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-bold">{t("category")}</span>
              <select name="category" value={form.category} onChange={update} className={inputClass}>
                <option value="education">{t("education")}</option>
                <option value="medical">{t("medical")}</option>
                <option value="emergency">{t("emergency")}</option>
                <option value="community">{t("community")}</option>
                <option value="environment">{t("environment")}</option>
                <option value="animals">{t("animals")}</option>
                <option value="other">{t("other")}</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold">{t("goalAmount")}</span>
              <input
                required
                min="1"
                step="0.01"
                type="number"
                name="goal_amount"
                value={form.goal_amount}
                onChange={update}
                className={inputClass}
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-bold">{t("beneficiary")}</span>
              <input
                required
                name="beneficiary"
                value={form.beneficiary}
                onChange={update}
                className={inputClass}
                placeholder={t("beneficiaryPlaceholder")}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold">{t("location")}</span>
              <input
                required
                name="location"
                value={form.location}
                onChange={update}
                className={inputClass}
                placeholder={t("locationPlaceholder")}
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-bold">{t("deadline")}</span>
              <input
                required
                type="date"
                name="deadline"
                value={form.deadline}
                onChange={update}
                min={minimumDeadline}
                className={inputClass}
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold">{t("coverImages")}</span>
              <input
                required={!isEditing}
                accept="image/jpeg,image/png,image/webp"
                type="file"
                multiple
                name="cover_image"
                onChange={update}
                className="w-full rounded-xl border border-dashed border-outline-variant bg-surface px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:font-bold file:text-white"
              />
              <span className="mt-1 block text-xs text-on-surface-variant">
                {t("coverImageHelp")}
              </span>
              {(imagePreview || existingMedia.length > 0 || supportingPreviews.length > 0) && <div className="mt-4 grid grid-cols-2 gap-2">
                {imagePreview && <MediaPreview type="image" src={imagePreview} label={t("primaryCover")} />}
                {existingMedia.map((item) => <MediaPreview key={item.id} type="image" src={mediaUrl(item.file)} label={t("existingCover")} onRemove={() => removeExistingMedia(item.id)} />)}
                {supportingPreviews.map((preview, index) => <MediaPreview key={`${preview.file.name}-${preview.file.lastModified}`} type="image" src={preview.url} label={preview.file.name} onRemove={() => removeSelectedMedia(index)} />)}
              </div>}
              <span className="mt-2 block text-xs font-semibold text-primary">{(imagePreview ? 1 : 0) + existingMedia.length + supportingMedia.length} {t("coverReady")}</span>
            </label>
          </div>

          <button
            disabled={saving}
            className="w-full rounded-xl bg-primary px-6 py-4 font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving
              ? isEditing
                ? isAdmin
                  ? t("saving")
                  : t("resubmitting")
                : isAdmin
                  ? t("publishingCampaign")
                  : t("submitting")
              : isEditing
                ? isAdmin
                  ? t("saveCampaign")
                  : t("saveResubmit")
                : isAdmin
                  ? t("publishCampaign")
                  : t("submitReview")}
          </button>
        </form>
      </main>
  );

  if (embedded) return content;

  return (
    <div className="min-h-screen bg-surface">
      {content}
    </div>
  );
}

function MediaPreview({ type, src, label, onRemove }) {
  const { t } = useLanguage();
  return (
    <article className="group relative overflow-hidden rounded-xl bg-slate-900">
      {type === "video" ? (
        <video src={src} muted preload="metadata" className="aspect-video w-full object-cover" />
      ) : (
        <img src={src} alt={label} className="aspect-video w-full object-cover" />
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-slate-950/90 to-transparent px-3 pb-2 pt-8 text-white">
        <p className="min-w-0 truncate text-[11px] font-bold">{label}</p>
        {onRemove && <button type="button" onClick={onRemove} aria-label={`${t("removeSelected")}: ${label}`} className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/20 hover:bg-rose-500">
          <Trash2 size={13} />
        </button>}
      </div>
    </article>
  );
}
