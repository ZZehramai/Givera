import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import api from "../api/axios";
import AppHeader from "../components/AppHeader";
import { mediaUrl } from "../utils/mediaUrl";

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

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    if (!isEditing) return;

    api.get(`/campaigns/${id}/`)
      .then(({ data }) => {
        if (data.status !== "rejected") {
          setError("Only rejected campaigns can be edited and resubmitted from this page.");
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
        setRejectionReason(data.rejection_reason || "Review the campaign details before resubmitting.");
      })
      .catch((requestError) => setError(requestError.response?.data?.detail || "This campaign could not be loaded."))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const update = (event) => {
    if (event.target.name === "cover_image") {
      const file = event.target.files?.[0] || null;
      if (file && file.size > 5 * 1024 * 1024) {
        setError("Cover image must be 5 MB or smaller.");
        event.target.value = "";
        return;
      }
      setForm((current) => ({ ...current, cover_image: file }));
      setImagePreview(file ? URL.createObjectURL(file) : "");
      return;
    }
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
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
      const { data } = isEditing
        ? await api.patch(`/campaigns/${id}/`, payload)
        : await api.post("/campaigns/", payload);
      navigate(`/dashboard?section=my-campaigns&submitted=${data.id}`, {
        state: {
          submissionMessage: isEditing ? "Campaign updated and resubmitted" : "Campaign submitted successfully",
          campaignTitle: data.title,
        },
      });
    } catch (requestError) {
      const data = requestError.response?.data;
      const firstError =
        data && typeof data === "object"
          ? Object.values(data).flat().join(" ")
          : null;
      setError(firstError || "The campaign could not be submitted.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-outline-variant bg-white px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10";

  if (loading) {
    return <div className="min-h-screen bg-surface"><AppHeader /><p className="py-24 text-center text-on-surface-variant">Loading campaign…</p></div>;
  }

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          {isEditing ? "Campaign revision" : "Start making an impact"}
        </p>
        <h1 className="mt-2 text-4xl font-bold text-on-surface">{isEditing ? "Fix and resubmit your campaign" : "Create a campaign"}</h1>
        <p className="mt-3 text-on-surface-variant">
          {isEditing ? "Update the requested details below. Your campaign will return to the admin review queue." : "Your submission will remain private until an administrator approves it."}
        </p>

        {isEditing && rejectionReason && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
            <div className="flex gap-3 bg-rose-50 px-5 py-4 text-rose-800">
              <AlertTriangle className="mt-0.5 shrink-0" size={20} />
              <div><p className="font-extrabold">Why your campaign was rejected</p><p className="mt-1 text-sm leading-6">{rejectionReason}</p></div>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm font-extrabold text-slate-800">Suggested places to review</p>
              <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                {["Title and short summary", "Story and planned use of funds", "Goal, beneficiary, and location", "Deadline and cover image"].map((item) => (
                  <p key={item} className="flex items-center gap-2"><CheckCircle2 size={15} className="shrink-0 text-primary" /> {item}</p>
                ))}
              </div>
            </div>
          </section>
        )}

        <form onSubmit={submit} className="mt-10 space-y-6 rounded-3xl bg-white p-8 shadow-sm">
          {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

          <label className="block">
            <span className="mb-2 block text-sm font-bold">Campaign title</span>
            <input
              required
              maxLength="160"
              name="title"
              value={form.title}
              onChange={update}
              className={inputClass}
              placeholder="Build a community learning center"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">Short summary</span>
            <textarea
              required
              maxLength="280"
              rows="3"
              name="summary"
              value={form.summary}
              onChange={update}
              className={inputClass}
              placeholder="Explain the need and expected impact in two sentences."
            />
            <span className="mt-1 block text-right text-xs text-on-surface-variant">
              {form.summary.length}/280
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">Full story</span>
            <textarea
              required
              rows="8"
              name="story"
              value={form.story}
              onChange={update}
              className={inputClass}
              placeholder="Describe the problem, your plan, and how funds will be used."
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-bold">Category</span>
              <select name="category" value={form.category} onChange={update} className={inputClass}>
                <option value="education">Education</option>
                <option value="medical">Medical</option>
                <option value="emergency">Emergency relief</option>
                <option value="community">Community</option>
                <option value="environment">Environment</option>
                <option value="animals">Animals</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold">Goal amount (Ks)</span>
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
              <span className="mb-2 block text-sm font-bold">Beneficiary</span>
              <input
                required
                name="beneficiary"
                value={form.beneficiary}
                onChange={update}
                className={inputClass}
                placeholder="Who receives the help?"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold">Location</span>
              <input
                required
                name="location"
                value={form.location}
                onChange={update}
                className={inputClass}
                placeholder="Yangon, Myanmar"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-bold">Deadline</span>
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
              <span className="mb-2 block text-sm font-bold">Cover image</span>
              <input
                required={!isEditing}
                accept="image/jpeg,image/png,image/webp"
                type="file"
                name="cover_image"
                onChange={update}
                className="w-full rounded-xl border border-dashed border-outline-variant bg-surface px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:font-bold file:text-white"
              />
              <span className="mt-1 block text-xs text-on-surface-variant">
                JPG, PNG, or WebP · maximum 5 MB
              </span>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Selected campaign cover preview"
                  className="mt-4 h-36 w-full rounded-xl object-cover"
                />
              )}
            </label>
          </div>

          <button
            disabled={saving}
            className="w-full rounded-xl bg-primary px-6 py-4 font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (isEditing ? "Resubmitting…" : "Submitting…") : (isEditing ? "Save changes and resubmit" : "Submit for review")}
          </button>
        </form>
      </main>
    </div>
  );
}
