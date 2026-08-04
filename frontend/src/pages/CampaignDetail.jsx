import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Heart, MessageCircleHeart, Send, Sparkles } from "lucide-react";

import api from "../api/axios";
// import AppHeader from "../components/AppHeader";
import { mediaUrl } from "../utils/mediaUrl";

const fallbackImage =
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80";

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [donating, setDonating] = useState(false);
  const [donationError, setDonationError] = useState("");
  const [donationSuccess, setDonationSuccess] = useState("");
  const [updates, setUpdates] = useState([]);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateBody, setUpdateBody] = useState("");
  const [publishingUpdate, setPublishingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const isLoggedIn = Boolean(localStorage.getItem("access"));
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    Promise.all([api.get(`/campaigns/${id}/`), api.get(`/campaigns/${id}/updates/`)])
      .then(([campaignResponse, updatesResponse]) => {
        setCampaign(campaignResponse.data);
        setUpdates(updatesResponse.data);
      })
      .catch(() => setError("This campaign could not be found."));
  }, [id]);

  const publishUpdate = async (event) => {
    event.preventDefault();
    setUpdateError("");
    if (!updateTitle.trim() || !updateBody.trim()) {
      setUpdateError("Add both a title and an update before publishing.");
      return;
    }
    setPublishingUpdate(true);
    try {
      const { data } = await api.post(`/campaigns/${id}/updates/`, { title: updateTitle.trim(), body: updateBody.trim() });
      setUpdates((current) => [data, ...current]);
      setUpdateTitle("");
      setUpdateBody("");
    } catch (requestError) {
      setUpdateError(requestError.response?.data?.detail || "We couldn’t publish that update. Please try again.");
    } finally {
      setPublishingUpdate(false);
    }
  };

  const donate = async (event) => {
    event.preventDefault();
    setDonationError("");
    setDonationSuccess("");
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 1) {
      setDonationError("Enter a donation of at least $1.");
      return;
    }
    setDonating(true);
    try {
      await api.post("/donations/", {
        campaign_id: id,
        amount: numericAmount,
        message,
        is_anonymous: anonymous,
      });
      const refreshed = await api.get(`/campaigns/${id}/`);
      setCampaign(refreshed.data);
      setDonationSuccess(`Thank you! Your ${numericAmount.toLocaleString("en-US", { style: "currency", currency: "USD" })} donation was recorded.`);
      setAmount("");
      setMessage("");
      setAnonymous(false);
    } catch (requestError) {
      const data = requestError.response?.data;
      setDonationError(
        data?.amount?.[0] ||
        data?.campaign_id?.[0] ||
        data?.detail ||
        "Your donation could not be recorded. Please try again.",
      );
    } finally {
      setDonating(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-surface">
  
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-bold">{error}</h1>
          <Link to="/campaigns" className="mt-6 inline-block text-primary underline">
            Return to campaigns
          </Link>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return <p className="p-20 text-center">Loading campaign…</p>;
  }

  const progress = Math.min(Number(campaign.progress_percentage || 0), 100);
  const isOrganizer = currentUser?.id === campaign.owner;

  return (
    <div className="min-h-screen bg-surface">

      <main className="mx-auto max-w-container-max px-6 py-10">
        <Link to="/campaigns" className="text-sm font-semibold text-primary">
          ← All campaigns
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.5fr_0.8fr]">
          <article>
            <img
              src={mediaUrl(campaign.cover_image, fallbackImage)}
              alt=""
              className="aspect-[16/9] w-full rounded-3xl object-cover"
            />
            <div className="py-8">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-secondary-container px-3 py-1 text-xs font-bold">
                  {campaign.category_label}
                </span>
                <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-bold">
                  {campaign.location}
                </span>
              </div>
              <h1 className="text-4xl font-bold leading-tight text-on-surface">
                {campaign.title}
              </h1>
              <p className="mt-4 text-lg leading-8 text-on-surface-variant">
                {campaign.summary}
              </p>

              <div className="my-8 border-y border-outline-variant/40 py-5 text-sm text-on-surface-variant">
                Organized by <strong>{campaign.owner_name}</strong> for{" "}
                <strong>{campaign.beneficiary}</strong>
              </div>

              <h2 className="text-2xl font-bold">The story</h2>
              <div className="mt-4 whitespace-pre-wrap text-base leading-8 text-on-surface-variant">
                {campaign.story}
              </div>

              <section className="mt-12 border-t border-outline-variant/50 pt-9">
                <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">From the organizer</p><h2 className="mt-2 text-2xl font-extrabold">Campaign updates</h2><p className="mt-2 text-sm text-on-surface-variant">Follow the progress and impact of this campaign.</p></div><MessageCircleHeart className="text-primary" size={28} aria-hidden="true" /></div>

                {isOrganizer && <form onSubmit={publishUpdate} className="mt-7 rounded-2xl border border-primary/20 bg-primary-fixed/35 p-5"><div className="flex items-center gap-2 text-sm font-extrabold text-primary"><Sparkles size={17} />Share an update with your supporters</div><label className="sr-only" htmlFor="update-title">Update title</label><input id="update-title" value={updateTitle} onChange={(event) => setUpdateTitle(event.target.value)} maxLength={160} placeholder="What’s new?" className="mt-4 w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /><label className="sr-only" htmlFor="update-body">Update details</label><textarea id="update-body" value={updateBody} onChange={(event) => setUpdateBody(event.target.value)} maxLength={2000} rows={4} placeholder="Tell supporters what has happened and what comes next." className="mt-3 w-full resize-y rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />{updateError && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{updateError}</p>}<button type="submit" disabled={publishingUpdate} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"><Send size={16} />{publishingUpdate ? "Publishing…" : "Publish update"}</button></form>}

                <div className="mt-7 space-y-5">{updates.length ? updates.map((update) => <article key={update.id} className="relative border-l-2 border-primary-fixed pl-6"><span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-white" /><p className="text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">{new Date(update.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p><h3 className="mt-1 text-lg font-extrabold">{update.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-on-surface-variant">{update.body}</p><p className="mt-2 text-xs font-semibold text-on-surface-variant">Posted by {update.author_name}</p></article>) : <div className="rounded-2xl bg-surface-container-low px-5 py-7 text-center text-sm text-on-surface-variant">The organizer has not posted an update yet. Check back soon.</div>}</div>
              </section>
            </div>
          </article>

          <aside>
            <div className="sticky top-24 rounded-3xl border border-outline-variant/30 bg-white p-7 shadow-lg">
              <p className="text-3xl font-bold text-primary">
                ${Number(campaign.amount_raised).toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                raised of ${Number(campaign.goal_amount).toLocaleString()} goal
              </p>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-surface-container-high">
                <div
                  className="h-full progress-gradient"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <strong>{progress}% funded</strong>
                <span>Ends {new Date(campaign.deadline).toLocaleDateString()}</span>
              </div>
              {donationSuccess && (
                <div className="mt-6 flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
                  <CheckCircle2 className="mt-0.5 shrink-0" size={19} />
                  <span>{donationSuccess}</span>
                </div>
              )}
              {isLoggedIn ? (
                <form onSubmit={donate} className="mt-7">
                  <label className="text-sm font-bold" htmlFor="donation-amount">Donation amount</label>
                  <div className="mt-2 flex rounded-xl border border-outline-variant bg-surface focus-within:border-primary">
                    <span className="grid w-12 place-items-center border-r border-outline-variant font-bold text-primary">$</span>
                    <input
                      id="donation-amount"
                      type="number"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="25"
                      className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {[10, 25, 50, 100].map((preset) => (
                      <button key={preset} type="button" onClick={() => setAmount(String(preset))} className="rounded-lg bg-surface-container px-2 py-2 text-sm font-bold text-primary hover:bg-primary-fixed">${preset}</button>
                    ))}
                  </div>
                  <label className="mt-4 block text-sm font-bold" htmlFor="donation-message">Message <span className="font-normal text-on-surface-variant">(optional)</span></label>
                  <textarea id="donation-message" maxLength={280} rows={3} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share a few words of support" className="mt-2 w-full resize-none rounded-xl border border-outline-variant bg-surface px-4 py-3 outline-none focus:border-primary" />
                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant">
                    <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} className="h-4 w-4 accent-primary" />
                    Show my donation as anonymous
                  </label>
                  {donationError && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{donationError}</p>}
                  <button type="submit" disabled={donating} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
                    <Heart size={19} />
                    {donating ? "Recording donation…" : "Donate now"}
                  </button>
                  <p className="mt-3 text-center text-xs leading-5 text-on-surface-variant">Demo donations are recorded immediately. No real payment is processed.</p>
                </form>
              ) : (
                <div className="mt-7">
                  <Link to="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-bold text-white"><Heart size={19} /> Log in to donate</Link>
                  <p className="mt-3 text-center text-xs text-on-surface-variant">Create an account or log in to support this campaign.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
