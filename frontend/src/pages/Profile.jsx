import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronRight, CircleUserRound, Edit3, LogOut, Mail, MapPin, Phone, ShieldCheck, UserRound, X } from "lucide-react";

import api from "../api/axios";
import AppHeader from "../components/AppHeader";

const emptyProfile = { username: "", email: "", phone_number: "", country: "" };

const profileFields = [
  { label: "Name", name: "username", type: "text", icon: UserRound, placeholder: "Your full name" },
  { label: "Email", name: "email", type: "email", icon: Mail, placeholder: "you@example.com" },
  { label: "Phone", name: "phone_number", type: "tel", icon: Phone, placeholder: "+95 9 000 000 000" },
  { label: "Location", name: "country", type: "text", icon: MapPin, placeholder: "City, country" },
];

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.get("/auth/profile/")
      .then(({ data }) => {
        setUser(data);
        setFormData({ username: data.username || "", email: data.email || "", phone_number: data.phone_number || "", country: data.country || "" });
      })
      .catch(() => setNotice("We couldn't load your profile. Please try again shortly."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = ({ target }) => setFormData((current) => ({ ...current, [target.name]: target.value }));

  const beginEditing = () => {
    setNotice("");
    setFormData({ username: user.username || "", email: user.email || "", phone_number: user.phone_number || "", country: user.country || "" });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNotice("");
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setNotice("");
    try {
      const { data } = await api.patch("/auth/profile/", formData);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      window.dispatchEvent(new Event("userUpdated"));
      setIsEditing(false);
      setNotice("Your profile has been updated.");
    } catch {
      setNotice("We couldn't save those changes. Please check your details and try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) return <div className="min-h-screen bg-surface"><AppHeader /><p className="py-32 text-center font-semibold text-on-surface-variant">Loading your profile…</p></div>;
  if (!user) return <div className="min-h-screen bg-surface"><AppHeader /><main className="mx-auto max-w-xl px-6 py-24 text-center"><h1 className="text-2xl font-extrabold">Profile unavailable</h1><p className="mt-3 text-on-surface-variant">{notice || "Please refresh and try again."}</p></main></div>;

  const initial = user.username?.trim().charAt(0).toUpperCase() || "G";
  const noticeIsSuccess = notice === "Your profile has been updated.";

  return (
    <div className="min-h-screen bg-[#fbfaff] text-on-surface">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-5 py-9 sm:px-6 md:py-14">
        <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Account centre</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] md:text-4xl">Your profile</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-on-surface-variant md:text-base">Manage the details Givera uses to personalize your account.</p>
          </div>
          {!isEditing && <button type="button" onClick={beginEditing} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_10px_22px_rgba(118,87,217,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(118,87,217,0.32)]"><Edit3 size={16} aria-hidden="true" />Edit details</button>}
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-[1.75rem] bg-on-surface text-white shadow-[0_18px_42px_rgba(41,35,62,0.15)] lg:sticky lg:top-24">
            <div className="relative overflow-hidden bg-primary px-7 pb-8 pt-7">
              <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full border-[18px] border-white/15" />
              <div className="relative grid h-20 w-20 place-items-center rounded-[1.35rem] bg-white text-3xl font-extrabold text-primary shadow-lg shadow-black/15">{initial}</div>
              <h2 className="relative mt-5 truncate text-xl font-extrabold">{user.username}</h2>
              <p className="relative mt-1 truncate text-sm text-white/70">{user.email}</p>
            </div>
            <div className="p-4">
              <p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Settings</p>
              <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-3 text-sm font-bold"><CircleUserRound size={18} className="text-secondary-fixed" aria-hidden="true" />Profile details<ChevronRight size={16} className="ml-auto text-white/50" aria-hidden="true" /></div>
              <div className="mt-5 border-t border-white/10 pt-4">
                <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"><LogOut size={18} aria-hidden="true" />Log out</button>
              </div>
            </div>
          </aside>

          <section className="overflow-hidden rounded-[1.75rem] border border-outline-variant/50 bg-white shadow-[0_12px_34px_rgba(41,35,62,0.06)]">
            <div className="flex flex-col gap-4 border-b border-outline-variant/60 px-6 py-6 sm:flex-row sm:items-center sm:justify-between md:px-9 md:py-7">
              <div><h2 className="text-xl font-extrabold tracking-tight">Personal information</h2><p className="mt-1 text-sm text-on-surface-variant">{isEditing ? "Make your changes below, then save when you’re ready." : "Your basic contact and location details."}</p></div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-tertiary-container px-3 py-1.5 text-xs font-bold text-[#176b5b]"><ShieldCheck size={15} aria-hidden="true" />Account verified</div>
            </div>

            <div className="px-6 py-3 md:px-9 md:py-5">
              {profileFields.map(({ label, name, type, icon: Icon, placeholder }) => (
                <div key={name} className="grid gap-2 border-b border-outline-variant/45 py-5 last:border-none md:grid-cols-[180px_minmax(0,1fr)] md:items-center md:gap-8">
                  <div className="flex items-center gap-3 text-sm font-bold text-on-surface-variant"><span className="grid h-9 w-9 place-items-center rounded-lg bg-surface-container-low text-primary"><Icon size={17} aria-hidden="true" /></span>{label}</div>
                  {isEditing ? (
                    <input type={type} name={name} value={formData[name]} onChange={handleChange} placeholder={placeholder} className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-on-surface-variant/65 focus:border-primary focus:ring-4 focus:ring-primary/10" />
                  ) : <p className="pl-12 text-sm font-semibold md:pl-0">{user[name] || <span className="font-medium text-on-surface-variant">Not provided</span>}</p>}
                </div>
              ))}
            </div>

            {notice && <p role="status" className={`mx-6 mb-2 rounded-xl px-4 py-3 text-sm font-semibold md:mx-9 ${noticeIsSuccess ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{notice}</p>}

            {isEditing && <div className="flex flex-col-reverse gap-3 border-t border-outline-variant/60 bg-surface-container-low px-6 py-5 sm:flex-row sm:justify-end md:px-9"><button type="button" onClick={cancelEditing} disabled={saveLoading} className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-on-surface-variant transition hover:bg-white disabled:opacity-50"><X size={17} aria-hidden="true" />Discard changes</button><button type="button" onClick={handleSave} disabled={saveLoading} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_8px_20px_rgba(118,87,217,0.22)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"><Check size={17} aria-hidden="true" />{saveLoading ? "Saving…" : "Save changes"}</button></div>}
          </section>
        </div>
      </main>
    </div>
  );
}
