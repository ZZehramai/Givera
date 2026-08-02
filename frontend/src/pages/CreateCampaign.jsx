import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";
import AppHeader from "../components/AppHeader";

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
  const [form, setForm] = useState(initialForm);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      await api.post("/campaigns/", payload);
      navigate("/my-campaigns", {
        state: { message: "Campaign submitted for admin review." },
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

  return (
    <div className="min-h-screen bg-surface">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">
          Start making an impact
        </p>
        <h1 className="mt-2 text-4xl font-bold text-on-surface">Create a campaign</h1>
        <p className="mt-3 text-on-surface-variant">
          Your submission will remain private until an administrator approves it.
        </p>

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
              <span className="mb-2 block text-sm font-bold">Goal amount (USD)</span>
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
                required
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
            {saving ? "Submitting…" : "Submit for review"}
          </button>
        </form>
      </main>
    </div>
  );
}
