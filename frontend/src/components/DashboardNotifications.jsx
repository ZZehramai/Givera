import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";

import api from "../api/axios";
import { useLanguage } from "../i18n/LanguageContext";

export default function DashboardNotifications({ sidebar = false }) {
  const { t, formatDate } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/auth/notifications/")
      .then(({ data }) => { if (active) setNotifications(data); })
      .catch(() => { if (active) setNotifications([]); });
    return () => { active = false; };
  }, []);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const markRead = async (notification) => {
    if (!notification.is_read) {
      try {
        await api.patch(`/auth/notifications/${notification.id}/read/`);
        setNotifications((current) => current.map((item) => (
          item.id === notification.id ? { ...item, is_read: true } : item
        )));
      } catch {
        // Navigation remains available if read status cannot be saved.
      }
    }
    setOpen(false);
  };

  const markAllRead = async () => {
    try {
      await api.post("/auth/notifications/read-all/");
      setNotifications((current) => current.map((item) => ({ ...item, is_read: true })));
    } catch {
      // Keep the current state so the user can retry.
    }
  };

  return (
    <div className={`relative ${sidebar ? "ml-auto shrink-0" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={t("notifications")}
        aria-expanded={open}
        className={`relative grid place-items-center text-[#6549C9] transition hover:text-[#5138B5] ${sidebar ? "h-9 w-9" : "h-11 w-11"}`}
      >
        <Bell size={20} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-[#F6F6FB]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute right-0 z-50 w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_22px_55px_rgba(41,35,80,.18)] ${sidebar ? "bottom-12" : "top-14"}`}>
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-extrabold text-slate-900">{t("notifications")}</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount ? `${unreadCount} ${t("unread")}` : t("caughtUp")}
              </p>
            </div>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6549C9] hover:underline">
                <CheckCheck size={15} /> {t("markAllRead")}
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length ? notifications.map((notification) => (
              <Link
                key={notification.id}
                to={notification.link || "/dashboard"}
                onClick={() => markRead(notification)}
                className={`block border-b border-slate-100 px-5 py-4 transition last:border-0 hover:bg-[#F8F6FF] ${notification.is_read ? "bg-white" : "bg-[#F1EDFF]/70"}`}
              >
                <div className="flex gap-3">
                  <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${notification.is_read ? "bg-slate-200" : "bg-[#6F52D9]"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-slate-900">{notification.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{notification.message}</p>
                    <p className="mt-2 text-[11px] font-semibold text-slate-400">{formatDate(notification.created_at)}</p>
                  </div>
                </div>
              </Link>
            )) : (
              <div className="px-6 py-12 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#F1EDFF] text-[#6F52D9]"><Bell size={21} /></span>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">{t("notificationEmpty")}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
