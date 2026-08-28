import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft, CalendarDays, CheckCircle2, Copy, FileImage, Heart, MapPin,
  MessageCircleHeart, QrCode, ReceiptText, Send, ShieldCheck, Sparkles,
  Upload, UsersRound, X,
} from "lucide-react";

import api from "../api/axios";
import { mediaUrl } from "../utils/mediaUrl";
import CommentsSection from '../components/CommentsSection';
import { useLanguage } from "../i18n/LanguageContext";

const fallbackImage = "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80";
const kyat = (value) => `${Number(value || 0).toLocaleString()} MMK`;

function SectionTitle({ eyebrow, title, description, icon: Icon }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#7451E8]">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {Icon && (
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F1EDFF] text-[#7451E8]">
          <Icon size={21} />
        </span>
      )}
    </div>
  );
}

export default function CampaignDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { t } = useLanguage();
  const [campaign, setCampaign] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [donors, setDonors] = useState([]);
  const [utilizations, setUtilizations] = useState([]);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [provider, setProvider] = useState("kbzpay");
  const [checkout, setCheckout] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [donating, setDonating] = useState(false);
  const [donationMessage, setDonationMessage] = useState("");
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateBody, setUpdateBody] = useState("");
  const [publishingUpdate, setPublishingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [utilizationForm, setUtilizationForm] = useState({ title: "", description: "", amount_spent: "", spent_on: "", evidence: null });
  const [utilizationError, setUtilizationError] = useState("");
  const [submittingUtilization, setSubmittingUtilization] = useState(false);
  const [loadedAt] = useState(() => Date.now());
  
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = Boolean(localStorage.getItem("access"));

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get(`/campaigns/${id}/`),
      api.get(`/campaigns/${id}/updates/`),
      api.get(`/campaigns/${id}/donors/`),
      api.get(`/campaigns/${id}/fund-utilization/`),
    ]).then(([campaignResponse, updatesResponse, donorsResponse, utilizationResponse]) => {
      if (!active) return;
      setCampaign(campaignResponse.data);
      setUpdates(updatesResponse.data);
      setDonors(donorsResponse.data);
      setUtilizations(utilizationResponse.data);
    }).catch(() => {
      if (active) setError("This campaign could not be found.");
    });
    return () => { active = false; };
  }, [id]);

  const publishUpdate = async (event) => { 
    event.preventDefault(); 
    setUpdateError(""); 
    if (!updateTitle.trim() || !updateBody.trim()) return setUpdateError("Add a title and message before publishing."); 
    setPublishingUpdate(true); 
    try { 
      const { data } = await api.post(`/campaigns/${id}/updates/`, { title: updateTitle.trim(), body: updateBody.trim() }); 
      setUpdates((items) => [data, ...items]); 
      setUpdateTitle(""); 
      setUpdateBody(""); 
    } catch (requestError) { 
      setUpdateError(requestError.response?.data?.detail || "Could not publish this update."); 
    } finally { 
      setPublishingUpdate(false); 
    } 
  };

  const startDonation = async (event) => { 
    event.preventDefault(); 
    setDonationMessage(""); 
    const numeric = Number(amount); 
    if (!numeric || numeric < 1000) return setDonationMessage("Enter at least 1,000 MMK."); 
    setDonating(true); 
    try { 
      const { data } = await api.post("/donations/demo-checkout/", { campaign_id: id, provider, amount: numeric, message, is_anonymous: anonymous }); 
      setCheckout(data); 
    } catch (requestError) { 
      setDonationMessage(requestError.response?.data?.detail || "Could not start the demo payment."); 
    } finally { 
      setDonating(false); 
    } 
  };

  const submitPaymentProof = async ({ walletTransactionId, receiptFile }) => {
    if (!checkout) return;
    setDonating(true);
    const proof = new FormData();
    if (walletTransactionId.trim()) proof.append("wallet_transaction_id", walletTransactionId.trim());
    if (receiptFile) proof.append("receipt", receiptFile);
    try {
      const { data } = await api.post(`/donations/demo-checkout/${checkout.id}/proof/`, proof);
      setReceipt(data);
      setCheckout(null);
      setAmount("");
      setMessage("");
      setAnonymous(false);
    } catch (requestError) {
      throw new Error(requestError.response?.data?.detail || "Payment proof could not be submitted.", { cause: requestError });
    } finally {
      setDonating(false);
    }
  };

  const submitUtilization = async (event) => { 
    event.preventDefault(); 
    setUtilizationError(""); 
    if (!utilizationForm.title || !utilizationForm.description || !utilizationForm.amount_spent || !utilizationForm.spent_on) return setUtilizationError("Complete the title, explanation, amount, and date."); 
    const form = new FormData(); 
    Object.entries(utilizationForm).forEach(([key, value]) => { if (value) form.append(key, value); }); 
    setSubmittingUtilization(true); 
    try { 
      const { data } = await api.post(`/campaigns/${id}/fund-utilization/`, form); 
      setUtilizations((items) => [data, ...items]); 
      setUtilizationForm({ title: "", description: "", amount_spent: "", spent_on: "", evidence: null }); 
    } catch (requestError) { 
      setUtilizationError(requestError.response?.data?.detail || "Could not publish this report."); 
    } finally { 
      setSubmittingUtilization(false); 
    } 
  };

  if (error) return <div className="grid min-h-screen place-items-center bg-[#F8F7FC] p-6 text-center"><div><h1 className="text-3xl font-extrabold text-slate-900">{error}</h1><Link to="/campaigns" className="mt-5 inline-block font-bold text-[#7451E8]">Browse all campaigns</Link></div></div>;
  if (!campaign) return <div className="grid min-h-screen place-items-center bg-[#F8F7FC]"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E6DEFF] border-t-[#7451E8]" /></div>;

  const progress = Math.min(Number(campaign.progress_percentage || 0), 100);
  const isOrganizer = user?.id === campaign.owner;
  const isAdmin = user?.role === "admin" || user?.is_staff;
  const days = Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - loadedAt) / 86400000));
  const returnTo = location.state?.campaignReturnTo || "/campaigns";
  const returnLabelKey = location.state?.campaignReturnLabelKey || "backToCampaigns";

  return (
    <div className="min-h-screen bg-[#F8F7FC] text-slate-900">
      <main className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 lg:py-10">
        <Link to={returnTo} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#7451E8]">
          <ArrowLeft size={17} /> {t(returnLabelKey)}
        </Link>
        
        {/* Banner Section */}
        <section className="mt-6 overflow-hidden rounded-[32px] bg-[#211842] text-white shadow-2xl shadow-indigo-950/20">
          <div className="grid lg:grid-cols-[1.12fr_.88fr]">
            <div className="relative min-h-[400px]">
              <img src={mediaUrl(campaign.cover_image, fallbackImage)} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18102F]/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-9">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">{campaign.category_label}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur"><MapPin size={12} /> {campaign.location}</span>
                </div>
                <h1 className="mt-4 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">{campaign.title}</h1>
              </div>
            </div>
            <div className="flex flex-col p-7 sm:p-9">
              <p className="text-sm leading-7 text-indigo-100">{campaign.summary}</p>
              <div className="mt-8">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-extrabold text-[#FFD66B]">{kyat(campaign.amount_raised)}</p>
                    <p className="mt-1 text-sm text-indigo-200">of {kyat(campaign.goal_amount)} goal</p>
                  </div>
                  <p className="text-sm font-bold">{progress}%</p>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#FFD66B] to-[#FFAC6A]" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-3 border-t border-white/10 pt-6">
                <div className="rounded-2xl bg-white/8 p-3">
                  <UsersRound size={17} className="text-[#FFD66B]" />
                  <p className="mt-3 text-lg font-extrabold">{donors.length}</p>
                  <p className="text-xs text-indigo-200">Supporters</p>
                </div>
                <div className="rounded-2xl bg-white/8 p-3">
                  <CalendarDays size={17} className="text-[#FFD66B]" />
                  <p className="mt-3 text-lg font-extrabold">{days}</p>
                  <p className="text-xs text-indigo-200">Days remaining</p>
                </div>
              </div>
              <p className="mt-auto pt-6 text-sm text-indigo-100">
                Organized by <strong className="text-white">{campaign.owner_name}</strong> for <strong className="text-white">{campaign.beneficiary}</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Content Layout */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-10">
            {/* Story */}
            <section className="rounded-3xl bg-white p-7 shadow-[0_12px_32px_rgba(41,35,74,.06)]">
              <SectionTitle eyebrow="The mission" title="Why this campaign matters" />
              <p className="mt-6 whitespace-pre-wrap text-[15px] leading-8 text-slate-600">{campaign.story}</p>
            </section>

            {/* Updates */}
            <section className="rounded-3xl bg-white p-7 shadow-[0_12px_32px_rgba(41,35,74,.06)]">
              <SectionTitle eyebrow="Progress updates" title="From the organizer" description="Follow the work being done and the difference your support makes." icon={MessageCircleHeart} />
              {isOrganizer && (
                <form onSubmit={publishUpdate} className="mt-7 rounded-2xl bg-[#F6F3FF] p-5">
                  <p className="flex items-center gap-2 text-sm font-extrabold text-[#6549C9]"><Sparkles size={17} /> Publish an update</p>
                  <input value={updateTitle} onChange={(event) => setUpdateTitle(event.target.value)} maxLength={160} placeholder="A short headline" className="mt-4 w-full rounded-xl border border-[#DED4FF] bg-white px-4 py-3 text-sm outline-none focus:border-[#7451E8]" />
                  <textarea value={updateBody} onChange={(event) => setUpdateBody(event.target.value)} maxLength={2000} rows={3} placeholder="Tell supporters what has happened." className="mt-3 w-full rounded-xl border border-[#DED4FF] bg-white px-4 py-3 text-sm outline-none focus:border-[#7451E8]" />
                  {updateError && <p className="mt-3 text-sm font-medium text-rose-600">{updateError}</p>}
                  <button disabled={publishingUpdate} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#7451E8] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                    <Send size={16} /> {publishingUpdate ? "Publishing…" : "Publish update"}
                  </button>
                </form>
              )}
              <div className="mt-7 space-y-6">
                {updates.length ? updates.map((item) => (
                  <article key={item.id} className="relative border-l-2 border-[#D9CEFF] pl-6">
                    <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-[#7451E8] ring-4 ring-[#F6F3FF]" />
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{new Date(item.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
                    <h3 className="mt-2 text-lg font-extrabold">{item.title}</h3>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{item.body}</p>
                    <p className="mt-2 text-xs font-bold text-slate-400">Posted by {item.author_name}</p>
                  </article>
                )) : <Empty label="The organizer has not posted an update yet." />}
              </div>
            </section>

            {/* Fund Utilization */}
            <section className="rounded-3xl bg-white p-7 shadow-[0_12px_32px_rgba(41,35,74,.06)]">
              <SectionTitle eyebrow="Transparent fundraising" title="How the funds are used" description="Givera administrators publish spending reports and supporting evidence." icon={ReceiptText} />
              {isAdmin && (
                <form onSubmit={submitUtilization} className="mt-7 rounded-2xl border border-[#DDD3FF] bg-[#F6F3FF] p-5">
                  <p className="text-sm font-extrabold text-[#6549C9]">Publish a spending report</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input value={utilizationForm.title} onChange={(event) => setUtilizationForm((form) => ({ ...form, title: event.target.value }))} placeholder="Purchase or expense" className="rounded-xl border border-[#DED4FF] bg-white px-3 py-3 text-sm outline-none" />
                    <input type="number" min="1" value={utilizationForm.amount_spent} onChange={(event) => setUtilizationForm((form) => ({ ...form, amount_spent: event.target.value }))} placeholder="Amount (MMK)" className="rounded-xl border border-[#DED4FF] bg-white px-3 py-3 text-sm outline-none" />
                    <input type="date" value={utilizationForm.spent_on} onChange={(event) => setUtilizationForm((form) => ({ ...form, spent_on: event.target.value }))} className="rounded-xl border border-[#DED4FF] bg-white px-3 py-3 text-sm outline-none" />
                    <input type="file" accept="image/*" onChange={(event) => setUtilizationForm((form) => ({ ...form, evidence: event.target.files?.[0] || null }))} className="rounded-xl border border-[#DED4FF] bg-white px-2 py-2 text-xs" />
                  </div>
                  <textarea value={utilizationForm.description} onChange={(event) => setUtilizationForm((form) => ({ ...form, description: event.target.value }))} rows={3} placeholder="Explain this expense and its impact." className="mt-3 w-full rounded-xl border border-[#DED4FF] bg-white px-3 py-3 text-sm outline-none" />
                  {utilizationError && <p className="mt-3 text-sm font-medium text-rose-600">{utilizationError}</p>}
                  <button disabled={submittingUtilization} className="mt-3 rounded-xl bg-[#7451E8] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">
                    {submittingUtilization ? "Publishing…" : "Publish report"}
                  </button>
                </form>
              )}
              <div className="mt-7 grid gap-4">
                {utilizations.length ? utilizations.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-100 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-extrabold">{item.title}</h3>
                        <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#7451E8]">{kyat(item.amount_spent)} · {new Date(item.spent_on).toLocaleDateString()}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Published</span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                    {item.evidence && (
                      <a href={mediaUrl(item.evidence)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#7451E8]">
                        <FileImage size={16} /> View receipt / evidence
                      </a>
                    )}
                  </article>
                )) : <Empty label="No spending reports have been published yet." />}
              </div>
            </section>

            {/* Embedded Comments Section */}
            <CommentsSection campaignId={id} isLoggedIn={isLoggedIn} />
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_15px_35px_rgba(41,35,74,.08)]">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#7451E8]">Support this cause</p>
              <h2 className="mt-2 text-2xl font-extrabold">Make an impact today</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Choose an amount, transfer with your Myanmar wallet, and submit proof for verification.</p>
              {isLoggedIn ? (
                <form onSubmit={startDonation} className="mt-6">
                  <label className="text-sm font-bold">Donation amount</label>
                  <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-200 focus-within:border-[#7451E8]">
                    <span className="grid w-14 place-items-center border-r border-slate-200 bg-slate-50 text-xs font-extrabold text-[#7451E8]">MMK</span>
                    <input type="number" min="1000" step="1000" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="10000" className="min-w-0 flex-1 px-4 py-3 font-bold outline-none" />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[5000, 10000, 20000, 50000].map((preset) => (
                      <button key={preset} type="button" onClick={() => setAmount(String(preset))} className="rounded-xl bg-slate-50 px-2 py-2.5 text-xs font-bold text-[#6549C9] hover:bg-[#F1EDFF]">{kyat(preset)}</button>
                    ))}
                  </div>
                  <label className="mt-5 block text-sm font-bold">A message <span className="font-normal text-slate-400">(optional)</span>
                    <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} maxLength={280} placeholder="Share a few words of support" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-normal outline-none focus:border-[#7451E8]" />
                  </label>
                  <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} className="accent-[#7451E8]" /> Donate anonymously
                  </label>
                  <fieldset className="mt-5">
                    <legend className="text-sm font-bold">Pay with</legend>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {[["kbzpay", "KBZPay"], ["wave", "WavePay"]].map(([value, label]) => (
                        <label key={value} className={`cursor-pointer rounded-xl border px-2 py-2.5 text-center text-xs font-extrabold ${provider === value ? "border-[#7451E8] bg-[#F1EDFF] text-[#6549C9]" : "border-slate-200 text-slate-500"}`}>
                          <input type="radio" value={value} checked={provider === value} onChange={(event) => setProvider(event.target.value)} className="sr-only" />{label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {donationMessage && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">{donationMessage}</p>}
                  <button disabled={donating} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7451E8] px-4 py-4 font-bold text-white shadow-lg shadow-violet-300/40 disabled:opacity-60">
                    <Heart size={18} /> {donating ? "Preparing transfer…" : "Show payment QR"}
                  </button>
                  <p className="mt-3 text-center text-xs leading-5 text-slate-400">Your donation is counted only after an administrator verifies the transfer.</p>
                </form>
              ) : (
                <div className="mt-6">
                  <Link to="/login" className="flex items-center justify-center gap-2 rounded-xl bg-[#7451E8] px-4 py-4 font-bold text-white">
                    <Heart size={18} /> Log in to donate
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-5 rounded-3xl bg-[#211842] p-6 text-white">
              <ShieldCheck className="text-[#FFD66B]" size={24} />
              <h3 className="mt-4 font-extrabold">Built for trust</h3>
              <p className="mt-2 text-sm leading-6 text-indigo-100">See the supporters and every administrator-published fund utilization report below.</p>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
              <SectionTitle eyebrow="Supporters" title="Campaign donors" icon={UsersRound} />
              <div className="mt-4 max-h-80 divide-y divide-slate-100 overflow-y-auto">
                {donors.length ? donors.map((donor) => (
                  <div key={donor.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">{donor.donor_name}</p>
                      <p className="mt-1 text-xs text-slate-400">{new Date(donor.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm font-extrabold text-[#6549C9]">{kyat(donor.amount)}</p>
                  </div>
                )) : <p className="py-5 text-center text-sm text-slate-400">Be the first supporter.</p>}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Modals */}
      {checkout && <Checkout checkout={checkout} campaign={campaign} busy={donating} onClose={() => setCheckout(null)} onSubmit={submitPaymentProof} />}
      {receipt && <Receipt receipt={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function Empty({ label }) { return <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-8 text-center text-sm text-slate-400">{label}</div>; }

function Checkout({ checkout, campaign, busy, onClose, onSubmit }) {
  const [walletTransactionId, setWalletTransactionId] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [proofError, setProofError] = useState("");
  const [qrUnavailable, setQrUnavailable] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setProofError("");
    if (!walletTransactionId.trim() && !receiptFile) {
      setProofError("Enter the wallet transaction number or upload a receipt screenshot.");
      return;
    }
    try {
      await onSubmit({ walletTransactionId, receiptFile });
    } catch (error) {
      setProofError(error.message);
    }
  };

  const copyReference = () => navigator.clipboard?.writeText(checkout.transaction_reference);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17112E]/60 p-4 backdrop-blur-sm">
      <div className="mx-auto my-6 w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-[#25194B] px-6 py-5 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#FFD66B]">Wallet transfer</p>
            <h2 className="mt-1 text-xl font-extrabold">{checkout.provider_label}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={busy} className="rounded-xl p-2 hover:bg-white/10"><X size={20} /></button>
        </div>
        <form onSubmit={submit} className="p-6">
          <div className="text-center">
            {qrUnavailable ? (
              <div className="mx-auto grid h-52 w-52 place-items-center rounded-3xl border-2 border-dashed border-[#D8CFFA] bg-[#F8F6FF] text-[#6F52D9]">
                <div><QrCode className="mx-auto" size={54} /><p className="mt-3 text-xs font-bold">QR image needs to be configured</p></div>
              </div>
            ) : (
              <img src={mediaUrl(checkout.qr_code_url)} onError={() => setQrUnavailable(true)} alt={`${checkout.provider_label} payment QR`} className="mx-auto h-52 w-52 rounded-3xl border border-slate-200 bg-white object-contain p-2 shadow-sm" />
            )}
          </div>
          <p className="mt-5 text-center text-3xl font-extrabold">{kyat(checkout.amount)}</p>
          <p className="mt-1 text-center text-sm text-slate-500">for {campaign.title}</p>
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-left text-xs">
            <div><p className="text-slate-400">Givera reference</p><p className="mt-1 font-mono font-extrabold text-slate-700">{checkout.transaction_reference}</p></div>
            <button type="button" onClick={copyReference} className="rounded-lg bg-white p-2 text-[#6549C9] shadow-sm" aria-label="Copy reference"><Copy size={16} /></button>
          </div>
          <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-left text-sm text-amber-900">
            <p className="flex items-center gap-2 font-extrabold"><ShieldCheck size={18} /> Before you submit</p>
            <p className="mt-1 leading-5">Transfer the exact amount shown above. Your donation remains pending until Givera confirms that the money arrived.</p>
          </div>
          <label className="mt-5 block text-sm font-bold text-slate-700">Wallet transaction number <span className="font-normal text-slate-400">(receipt may be used instead)</span>
            <input value={walletTransactionId} onChange={(event) => setWalletTransactionId(event.target.value)} maxLength={100} placeholder="Enter KBZPay or WavePay transaction number" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm outline-none focus:border-[#7451E8]" />
          </label>
          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[#CFC3F7] bg-[#FAF8FF] p-4 text-sm text-slate-600">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EEE9FF] text-[#6549C9]"><Upload size={18} /></span>
            <span className="min-w-0"><strong className="block text-slate-800">Upload receipt screenshot</strong><span className="block truncate text-xs text-slate-400">{receiptFile?.name || "JPG, PNG or WebP · maximum 5 MB"}</span></span>
            <input type="file" accept="image/*" onChange={(event) => setReceiptFile(event.target.files?.[0] || null)} className="sr-only" />
          </label>
          {proofError && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{proofError}</p>}
          <button disabled={busy} className="mt-5 w-full rounded-xl bg-[#7451E8] px-4 py-3.5 font-bold text-white disabled:opacity-50">
            <CheckCircle2 className="mr-2 inline" size={18} /> {busy ? "Submitting…" : "Done — submit for verification"}
          </button>
        </form>
      </div>
    </div>
  ); 
}

function Receipt({ receipt, onClose }) { 
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#17112E]/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[28px] bg-white p-7 text-center shadow-2xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={34} /></div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-[#7451E8]">Proof received</p>
        <h2 className="mt-2 text-2xl font-extrabold">Pending verification</h2>
        <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5 text-left text-sm">
          <Line label="Amount" value={kyat(receipt.amount)} />
          <Line label="Method" value={receipt.provider_label} />
          <Line label="Reference" value={receipt.transaction_reference} />
          <Line label="Status" value="Pending verification" />
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-500">Givera will check the receiving wallet. The campaign total and your certificate will unlock only after approval.</p>
        <button type="button" onClick={onClose} className="mt-5 w-full rounded-xl bg-[#7451E8] px-4 py-3 font-bold text-white">Done</button>
      </div>
    </div>
  ); 
}

function Line({ label, value }) { 
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <strong className="text-right text-slate-800">{value}</strong>
    </div>
  ); 
}
