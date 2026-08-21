import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Bell,
  CheckCheck,
  UserRound,
} from "lucide-react";
import { useState, useEffect } from "react";
import { logout } from "../services/authService";
import api from "../api/axios";
import LanguageSwitch from "./LanguageSwitch";
import { useLanguage } from "../i18n/LanguageContext";

export default function AppHeader({ minimal = false }) {
  const navigate = useNavigate();
  const { t, formatDate } = useLanguage();

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user") || "null");
      setUser(updatedUser);
    };

    window.addEventListener("userUpdated", syncUser);
    return () => window.removeEventListener("userUpdated", syncUser);
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    api.get("/auth/notifications/")
      .then(({ data }) => { if (active) setNotifications(data); })
      .catch(() => { if (active) setNotifications([]); });
    return () => { active = false; };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = async (notification) => {
    if (!notification.is_read) {
      try {
        await api.patch(`/auth/notifications/${notification.id}/read/`);
        setNotifications((current) =>
          current.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item))
        );
      } catch { /* Fail silently */ }
    }
    setNotificationsOpen(false);
  };

  const markAllRead = async () => {
    try {
      await api.post("/auth/notifications/read-all/");
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, is_read: true }))
      );
    } catch { /* Fail silently */ }
  };

  const sectionClass =
    "text-sm font-semibold text-on-surface-variant transition hover:text-primary";

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/30 bg-white backdrop-blur">
      <nav className="relative mx-auto flex h-18 max-w-container-max items-center justify-between px-6">
        
        {/* LEFT SIDE: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-extrabold text-primary">
            Givera
          </Link>
        </div>

        {/* CENTER Navigation Links */}
        {!minimal && <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex">
          <a href="#hero" className={sectionClass}>
            {t("home")}
          </a>
          <a href="#campaigns" className={sectionClass}>
            {t("campaigns")}
          </a>
          <a href="#campaign-request" className={sectionClass}>
            {t("campaignRequests")}
          </a>
          <a href="#how-it-works" className={sectionClass}>
            {t("howItWorks")}
          </a>
          <a href="#faq" className={sectionClass}>
            {t("faq")}
          </a>
        </div>}

        {/* RIGHT SIDE: Notifications & User Menu */}
        <div className="flex items-center gap-4 sm:gap-5">
          <LanguageSwitch compact />
          {user ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((open) => !open)}
                  className="relative grid h-10 w-10 place-items-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
                  aria-label={t("notifications")}
                  aria-expanded={notificationsOpen}
                >
                  <Bell size={20} aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-outline-variant/70 bg-white shadow-[0_18px_45px_rgba(41,35,62,0.16)]">
                    <div className="flex items-center justify-between border-b border-outline-variant/60 px-4 py-3">
                      <div>
                        <p className="font-extrabold text-on-surface">{t("notifications")}</p>
                        <p className="text-xs text-on-surface-variant">
                          {unreadCount ? `${unreadCount} ${t("unread")}` : t("caughtUp")}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          <CheckCheck size={15} />
                          {t("markAllRead")}
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length ? (
                        notifications.map((notification) => (
                          <Link
                            key={notification.id}
                            to={notification.link || "/dashboard"}
                            onClick={() => markRead(notification)}
                            className={`block border-b border-outline-variant/45 px-4 py-3 last:border-0 transition hover:bg-surface-container-low ${
                              notification.is_read ? "" : "bg-primary-fixed/30"
                            }`}
                          >
                            <div className="flex gap-3">
                              <span
                                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                  notification.is_read ? "bg-transparent" : "bg-primary"
                                }`}
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-on-surface">
                                  {notification.title}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                                  {notification.message}
                                </p>
                                <p className="mt-1.5 text-[11px] font-semibold text-on-surface-variant">
                                  {formatDate(notification.created_at)}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="px-5 py-10 text-center text-sm text-on-surface-variant">
                          {t("notificationEmpty")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Profile Avatar */}
              <Link to="/dashboard" className={minimal ? "block" : "hidden sm:block"}>
                <div className="h-10 w-10 overflow-hidden rounded-full border border-purple-200 shadow-xs transition hover:opacity-90 hover:ring-2 hover:ring-purple-400">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#7047eb] font-bold text-white">
                      {user?.username ? user.username.charAt(0).toUpperCase() : <UserRound size={18} />}
                    </div>
                  )}
                </div>
              </Link>

              {/* Log out Button */}
              {!minimal && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-low"
                >
                  {t("logout")}
                </button>
              )}
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-primary transition"
              >
                {t("signIn")}
              </Link>

              {!minimal && (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
                >
                  {t("donateNow")}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              )}
            </>
          )}
        </div>
      </nav>

      {/* MOBILE SECONDARY NAV ROW */}
      {!minimal && <nav
        aria-label="Mobile Navigation"
        className="mx-auto flex max-w-container-max justify-center gap-2 overflow-x-auto border-t border-outline-variant/30 px-4 py-2 lg:hidden"
      >
        <a
          href="#campaigns"
          className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-primary-fixed hover:text-primary"
        >
          Browse Campaigns
        </a>
        <a
          href="#campaign-request"
          className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-primary-fixed hover:text-primary"
        >
          Campaign Requests
        </a>
        <a
          href="#how-it-works"
          className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-primary-fixed hover:text-primary"
        >
          How it works
        </a>
        <a
          href="#faq"
          className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-primary-fixed hover:text-primary"
        >
          FAQ
        </a>
      </nav>}
    </header>
  );
}
