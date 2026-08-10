import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Heart, MessageCircleHeart, Send, ShieldCheck, Smartphone, Sparkles, X } from "lucide-react";

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
  const [provider, setProvider] = useState("kbzpay");
  const [checkout, setCheckout] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
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

  useEffect(() => {
    if (!checkout?.expires_at) return undefined;
    const updateCountdown = () => setSecondsRemaining(Math.max(0, Math.ceil((new Date(checkout.expires_at).getTime() - Date.now()) / 1000)));
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [checkout]);

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
    if (!numericAmount || numericAmount < 1000) {
      setDonationError("Enter a donation of at least 1,000 Ks.");
      return;
    }
    setDonating(true);
    try {
      const { data } = await api.post("/donations/demo-checkout/", {
        campaign_id: id,
        provider,
        amount: numericAmount,
        message,
        is_anonymous: anonymous,
      });
      setCheckout(data);
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

  const simulateDemoPayment = async (outcome) => {
    if (!checkout) return;
    setDonating(true);
    setDonationError("");
    try {
      const { data } = await api.post(`/donations/demo-checkout/${checkout.id}/simulate/`, { outcome });
      if (outcome !== "success") {
        setCheckout(null);
        setDonationError(data.failure_reason || `Demo payment ${data.status}. You can try again whenever you’re ready.`);
        return;
      }
      const refreshed = await api.get(`/campaigns/${id}/`);
      setCampaign(refreshed.data);
      setDonationSuccess(`Demo complete — your ${Number(checkout.amount).toLocaleString()} Ks donation was recorded. No money was transferred.`);
      setReceipt(data);
      setAmount("");
      setMessage("");
      setAnonymous(false);
      setCheckout(null);
    } catch (requestError) {
      setDonationError(requestError.response?.data?.detail || "The demo payment could not be completed. Please try again.");
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
                    <span className="grid w-12 place-items-center border-r border-outline-variant text-xs font-bold text-primary">Ks</span>
                    <input
                      id="donation-amount"
                      type="number"
                      min="1000"
                      step="1000"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="10000"
                      className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {[5000, 10000, 20000, 50000].map((preset) => (
                      <button key={preset} type="button" onClick={() => setAmount(String(preset))} className="rounded-lg bg-surface-container px-2 py-2 text-xs font-bold text-primary hover:bg-primary-fixed">{preset.toLocaleString()} Ks</button>
                    ))}
                  </div>
                  <label className="mt-4 block text-sm font-bold" htmlFor="donation-message">Message <span className="font-normal text-on-surface-variant">(optional)</span></label>
                  <textarea id="donation-message" maxLength={280} rows={3} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share a few words of support" className="mt-2 w-full resize-none rounded-xl border border-outline-variant bg-surface px-4 py-3 outline-none focus:border-primary" />
                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-on-surface-variant">
                    <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} className="h-4 w-4 accent-primary" />
                    Show my donation as anonymous
                  </label>
                  <fieldset className="mt-5">
                    <legend className="text-sm font-bold">Demo payment method</legend>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {[['kbzpay', 'KBZPay'], ['wave', 'Wave'], ['mmqr', 'MMQR']].map(([value, label]) => (
                        <label key={value} className={`cursor-pointer rounded-xl border px-2 py-2.5 text-center text-xs font-extrabold transition ${provider === value ? "border-primary bg-primary-fixed text-primary" : "border-outline-variant text-on-surface-variant"}`}>
                          <input type="radio" name="demo-provider" value={value} checked={provider === value} onChange={(event) => setProvider(event.target.value)} className="sr-only" />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {donationError && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{donationError}</p>}
                  <button type="submit" disabled={donating} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-bold text-white shadow-lg shadow-primary/20 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60">
                    <Heart size={19} />
                    {donating ? "Opening demo checkout…" : "Continue to demo payment"}
                  </button>
                  <p className="mt-3 text-center text-xs leading-5 text-on-surface-variant">Demo only — no wallet is opened and no real payment is processed.</p>
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
      {checkout && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-on-surface/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="demo-checkout-title">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between bg-primary px-6 py-5 text-white">
              <div><p className="text-xs font-bold uppercase tracking-widest text-primary-fixed">Safe demonstration</p><h2 id="demo-checkout-title" className="mt-1 text-xl font-extrabold">{checkout.provider_label} checkout</h2></div>
              <button type="button" onClick={() => setCheckout(null)} disabled={donating} aria-label="Close demo checkout" className="rounded-lg p-1 hover:bg-white/10 disabled:opacity-50"><X /></button>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto grid h-24 w-24 grid-cols-3 gap-1 rounded-2xl bg-surface-container-low p-3 text-primary" aria-label="Non-scannable demo QR visual">{Array.from({ length: 9 }, (_, index) => <span key={index} className={`rounded-sm ${[0, 1, 3, 4, 8].includes(index) ? "bg-primary" : "bg-primary/20"}`} />)}</div>
              <p className="mt-5 text-2xl font-extrabold text-on-surface">{Number(checkout.amount).toLocaleString()} Ks</p>
              <p className="mt-1 text-sm text-on-surface-variant">to {campaign.title}</p>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-container-low px-4 py-3 text-left text-xs"><span className="font-bold text-on-surface-variant">Reference</span><span className="font-extrabold text-on-surface">{checkout.transaction_reference}</span></div>
              <p className={`mt-3 text-xs font-bold ${secondsRemaining ? "text-on-surface-variant" : "text-rose-600"}`}>{secondsRemaining ? `Demo session expires in ${String(Math.floor(secondsRemaining / 60)).padStart(2, "0")}:${String(secondsRemaining % 60).padStart(2, "0")}` : "Demo session expired — start again."}</p>
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900"><div className="flex gap-2 font-bold"><ShieldCheck className="shrink-0" size={18} />No real payment</div><p className="mt-1 leading-5">This visual cannot be scanned. It demonstrates the provider return and callback states without a wallet, account, or bank connection.</p></div>
              <button type="button" onClick={() => simulateDemoPayment("success")} disabled={donating || !secondsRemaining} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-bold text-white disabled:opacity-60"><CheckCircle2 size={19} />{donating ? "Completing demo…" : "Simulate successful payment"}</button>
              <div className="mt-3 grid grid-cols-2 gap-3"><button type="button" onClick={() => simulateDemoPayment("failed")} disabled={donating || !secondsRemaining} className="rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-700 disabled:opacity-50">Simulate failed payment</button><button type="button" onClick={() => simulateDemoPayment("cancelled")} disabled={donating} className="rounded-xl bg-surface-container px-3 py-2.5 text-xs font-bold text-on-surface-variant disabled:opacity-50">Cancel demo payment</button></div>
            </div>
          </div>
        </div>
      )}
      {receipt && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-on-surface/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="demo-receipt-title"><div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={30} /></div><p className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-primary">Demo receipt</p><h2 id="demo-receipt-title" className="mt-1 text-center text-2xl font-extrabold">Donation completed</h2><div className="mt-6 space-y-3 rounded-2xl bg-surface-container-low p-5 text-sm"><div className="flex justify-between gap-4"><span>Amount</span><strong>{Number(receipt.amount).toLocaleString()} Ks</strong></div><div className="flex justify-between gap-4"><span>Method</span><strong>{receipt.provider_label}</strong></div><div className="flex justify-between gap-4"><span>Reference</span><strong className="text-right">{receipt.transaction_reference}</strong></div><div className="flex justify-between gap-4"><span>Status</span><strong className="text-emerald-700">Completed</strong></div></div><p className="mt-5 text-center text-xs leading-5 text-on-surface-variant">DEMO PAYMENT — no funds were transferred.</p><button type="button" onClick={() => setReceipt(null)} className="mt-5 w-full rounded-xl bg-primary px-5 py-3 font-bold text-white">Done</button></div></div>
      )}
    </div>
  );
}
