import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Check, 
  Camera,
  Edit3, 
  LogOut, 
  Mail, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  UserRound, 
  X,
  Quote,
  Trash2
} from "lucide-react";

import api from "../api/axios";
import AppHeader from "../components/AppHeader";

const emptyProfile = { username: "", email: "", phone_number: "", country: "", avatar: "" };

const profileFields = [
  { label: "Full Name", name: "username", type: "text", icon: UserRound, placeholder: "Your full name" },
  { label: "Email Address", name: "email", type: "email", icon: Mail, placeholder: "you@example.com" },
  { label: "Phone Number", name: "phone_number", type: "tel", icon: Phone, placeholder: "+95 9 000 000 000" },
  { label: "Location", name: "country", type: "text", icon: MapPin, placeholder: "City, Country" },
];

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(emptyProfile);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.get("/auth/profile/")
      .then(({ data }) => {
        setUser(data);
        setFormData({ 
          username: data.username || "", 
          email: data.email || "", 
          phone_number: data.phone_number || "", 
          country: data.country || "",
          avatar: data.avatar || "" 
        });
        if (data.avatar) setPreviewImage(data.avatar);
      })
      .catch(() => setNotice("We couldn't load your profile. Please try again shortly."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = ({ target }) => setFormData((current) => ({ ...current, [target.name]: target.value }));

  // Handle local image file upload from user's device
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData((current) => ({ ...current, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData((current) => ({ ...current, avatar: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const beginEditing = () => {
    setNotice("");
    setFormData({ 
      username: user.username || "", 
      email: user.email || "", 
      phone_number: user.phone_number || "", 
      country: user.country || "",
      avatar: user.avatar || ""
    });
    setPreviewImage(user.avatar || null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setPreviewImage(user?.avatar || null);
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
      setNotice("We couldn't save those changes. Please check your details.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFE]">
        <AppHeader />
        <div className="flex h-[70vh] items-center justify-center">
          <p className="text-sm font-semibold tracking-wide text-slate-400 animate-pulse">
            Loading your profile…
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFCFE]">
        <AppHeader />
        <main className="mx-auto max-w-xl px-6 py-24 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900">Profile unavailable</h1>
          <p className="mt-3 text-slate-500">{notice || "Please refresh and try again."}</p>
        </main>
      </div>
    );
  }

  const noticeIsSuccess = notice === "Your profile has been updated.";

  return (
    <div className="min-h-screen bg-[#FAF8FC] text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-6 py-10 lg:py-16">

        {/* SECTION HEADER WITH EDIT BUTTON */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Welcome {user.username}
          </h1>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                type="button"
                onClick={beginEditing}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-200"
              >
                <Edit3 size={16} /> Edit profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={saveLoading}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
                >
                  <Check size={16} /> {saveLoading ? "Saving…" : "Save changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid gap-12 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-16">
          
          {/* LEFT: PHOTO & PERSONA CARD */}
          <div className="relative">
            {/* BACKGROUND STACKED CARD EFFECT */}
            <div className="absolute -top-3 left-3 right-3 h-full rounded-[2.5rem] bg-gradient-to-br from-lime-200 via-purple-100 to-purple-200 opacity-60 blur-xs" />
            <div className="absolute -top-1.5 left-1.5 right-1.5 h-full rounded-[2.5rem] bg-white opacity-80" />

            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-gradient-to-b from-purple-100/50 via-purple-50/30 to-white p-6 shadow-xl shadow-purple-900/5 backdrop-blur-xl">
              
              {/* TOP FLOATING PILL BADGES */}
              <div className="mb-8 flex items-center justify-between gap-2">
                <span className="rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-xs backdrop-blur-md">
                  {user.country || "Global Member"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
                  <ShieldCheck size={14} /> Verified
                </span>
              </div>

              {/* IMAGE DISPLAY & UPLOAD AREA */}
              <div className="relative my-4 flex flex-col items-center justify-center">
                <div className="group relative h-52 w-52 overflow-hidden rounded-[2rem] border-2 border-white bg-slate-100 shadow-2xl shadow-purple-900/10">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Profile Avatar" 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-purple-50 text-purple-300">
                      <UserRound size={64} />
                      <span className="mt-2 text-xs font-medium text-slate-400">No Photo Selected</span>
                    </div>
                  )}

                  {/* EDIT MODE PHOTO OVERLAY TRIGGER */}
                  {isEditing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/60 opacity-0 backdrop-blur-xs transition group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 hover:bg-purple-50"
                      >
                        <Camera size={14} /> Upload Image
                      </button>
                      {previewImage && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="inline-flex items-center gap-1 rounded-full bg-rose-500/80 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* HIDDEN FILE INPUT */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                {isEditing && (
                  <p className="mt-3 text-center text-xs font-medium text-slate-500">
                    Hover over image to change or remove
                  </p>
                )}
              </div>

              {/* FROSTED GLASS USER DETAIL OVERLAY */}
              <div className="mt-8 rounded-2xl border border-white/80 bg-white/70 p-5 text-center shadow-lg backdrop-blur-md">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">{user.username}</h2>
                <p className="mt-1 truncate text-xs font-medium text-slate-500">{user.email}</p>
              </div>

              {/* LOGOUT ACTION */}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <LogOut size={15} /> Log out from account
              </button>
            </div>
          </div>

          {/* RIGHT: CONTENT & FIELDS */}
          <div className="flex flex-col justify-center space-y-10">
            
            {/* QUOTE STATEMENT AREA */}
            <div className="relative pl-2">
              <Quote size={32} className="mb-2 text-purple-200" />
              <p className="text-2xl font-normal leading-snug text-slate-800 md:text-3xl">
                Profile details serve as your main identity across Givera campaigns and notifications.
              </p>
            </div>

            {/* STATUS / NOTICE ALERT */}
            {notice && (
              <div
                role="status"
                className={`rounded-2xl px-5 py-4 text-sm font-medium ${
                  noticeIsSuccess
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                    : "bg-rose-50 text-rose-800 border border-rose-100"
                }`}
              >
                {notice}
              </div>
            )}

            {/* TWO-COLUMN GRID FIELDS */}
            <div className="grid gap-4 sm:grid-cols-2">
              {profileFields.map(({ label, name, type, icon: Icon, placeholder }) => (
                <div
                  key={name}
                  className="group relative flex flex-col justify-between rounded-2xl bg-white p-5 border border-slate-100 shadow-xs transition hover:border-purple-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">{label}</span>
                    <span className="p-1.5 text-purple-500">
                      <Icon size={16} />
                    </span>
                  </div>

                  <div className="mt-4">
                    {isEditing ? (
                      <input
                        type={type}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-100"
                      />
                    ) : (
                      <p className="text-base font-medium text-slate-800 truncate">
                        {user[name] || <span className="text-slate-300">Not provided</span>}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}