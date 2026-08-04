import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import {
  ArrowUpRight,
  Bell,
  CheckCheck,
  ChevronDown,
  FileQuestion,
  HelpCircle,
  Mail,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { ArrowUpRight, Bell, CheckCheck } from "lucide-react";
import { useState, useEffect } from "react";

import { logout } from "../services/authService";
import api from "../api/axios";

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === "/";


  const [user, setUser] = useState (() => JSON.parse(localStorage.getItem("user") || "null"));
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);


  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const aboutRef = useRef(null);

  useEffect(() => {
    const syncUser = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user") || "null");
      setUser(updatedUser);
    };

    window.addEventListener("userUpdated", syncUser);
    return () => window.removeEventListener("userUpdated", syncUser);
  }, []);


  // Close "About" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (aboutRef.current && !aboutRef.current.contains(event.target)) {
        setAboutOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return undefined;

  useEffect(() => {
    if (!user) {
      return undefined;
    }

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
  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  const markRead = async (notification) => {
    if (!notification.is_read) {
      try {
        await api.patch(`/auth/notifications/${notification.id}/read/`);

        setNotifications((current) =>
          current.map((item) => (item.id === notification.id ? { ...item, is_read: true } : item))
        );
      } catch { /* Fail silently */ }

        setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, is_read: true } : item));
      } catch { /* The notification can still be opened if marking it read fails. */ }

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

      setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
    } catch { /* Keep the current unread state when the request cannot be completed. */ }

  };

  const navClass = ({ isActive }) =>
    `text-sm font-semibold transition ${
      isActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
    }`;

  const sectionClass =
    "text-sm font-semibold text-on-surface-variant transition hover:text-primary";

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/30 bg-white/80 backdrop-blur">
      <nav className="relative mx-auto flex h-18 max-w-container-max items-center justify-between px-6">
        
        {/* LEFT SIDE: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="text-2xl font-extrabold text-primary">
            Givera
          </Link>
        </div>

        {/* CENTER: Browse Campaigns & Campaign Requests */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex">
          <NavLink to="/campaigns" className={navClass}>
            Browse Campaigns
          </NavLink>
          <NavLink to="/campaigns/create" className={navClass}>
            Campaign Requests
          </NavLink>
        </div>

        {/* RIGHT SIDE: About Dropdown, Sign In, Notifications & User Menu */}
        <div className="flex items-center gap-4 sm:gap-5">
          {/* About Dropdown */}
          <div className="relative" ref={aboutRef}>
            <button
              type="button"
              onClick={() => setAboutOpen((open) => !open)}
              className={`inline-flex items-center gap-1 ${sectionClass}`}
              aria-expanded={aboutOpen}
            >
              About
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  aboutOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>

            {aboutOpen && (
              <div className="absolute right-0 top-10 z-50 w-52 overflow-hidden rounded-2xl border border-outline-variant/70 bg-white p-2 shadow-[0_18px_45px_rgba(41,35,62,0.16)]">
                <a
                  href="#how-it-works"
                  onClick={() => setAboutOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
                >
                  <HelpCircle size={16} />
                  How it works
                </a>
                <a
                  href="#faq"
                  onClick={() => setAboutOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
                >
                  <FileQuestion size={16} />
                  FAQ
                </a>
                <a
                  href="#faq"
                  onClick={() => setAboutOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
                >
                  <Mail size={16} />
                  Contact us
                </a>
              </div>
            )}
          </div>

          {/* User Controls / Auth Links */}
          {user ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((open) => !open)}
                  className="relative grid h-10 w-10 place-items-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
                  aria-label="Notifications"
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
                        <p className="font-extrabold text-on-surface">Notifications</p>
                        <p className="text-xs text-on-surface-variant">
                          {unreadCount ? `${unreadCount} unread` : "You’re all caught up"}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllRead}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                        >
                          <CheckCheck size={15} />
                          Mark all read
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
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="px-5 py-10 text-center text-sm text-on-surface-variant">
                          Updates about your campaigns and donations will appear here.
                        </p>
                      )}
                    </div>
                  </div>
                )}

              <div className="relative">
                <button type="button" onClick={() => setNotificationsOpen((open) => !open)} className="relative grid h-10 w-10 place-items-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary" aria-label="Notifications" aria-expanded={notificationsOpen}>
                  <Bell size={20} aria-hidden="true" />
                  {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                </button>
                {notificationsOpen && <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-outline-variant/70 bg-white shadow-[0_18px_45px_rgba(41,35,62,0.16)]">
                  <div className="flex items-center justify-between border-b border-outline-variant/60 px-4 py-3"><div><p className="font-extrabold text-on-surface">Notifications</p><p className="text-xs text-on-surface-variant">{unreadCount ? `${unreadCount} unread` : "You’re all caught up"}</p></div>{unreadCount > 0 && <button type="button" onClick={markAllRead} className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"><CheckCheck size={15} />Mark all read</button>}</div>
                  <div className="max-h-96 overflow-y-auto">{notifications.length ? notifications.map((notification) => <Link key={notification.id} to={notification.link || "/dashboard"} onClick={() => markRead(notification)} className={`block border-b border-outline-variant/45 px-4 py-3 last:border-0 transition hover:bg-surface-container-low ${notification.is_read ? "" : "bg-primary-fixed/30"}`}><div className="flex gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.is_read ? "bg-transparent" : "bg-primary"}`} /><div className="min-w-0"><p className="text-sm font-bold text-on-surface">{notification.title}</p><p className="mt-1 text-xs leading-5 text-on-surface-variant">{notification.message}</p><p className="mt-1.5 text-[11px] font-semibold text-on-surface-variant">{new Date(notification.created_at).toLocaleDateString()}</p></div></div></Link>) : <p className="px-5 py-10 text-center text-sm text-on-surface-variant">Updates about your campaigns and donations will appear here.</p>}</div>
                </div>}
              </div>
              <Link
                to="/profile"
                className="hidden text-sm text-on-surface-variant sm:block"
              >
              <div className="bg-[#7047eb] text-white flex h-10 w-10 items-center justify-center rounded-full font-bold shadow-sm transition hover:bg-[#5b36d6]">
                {user?.username?.charAt(0).toUpperCase()}

              </div>

              {/* Profile Avatar */}
              <Link to="/profile" className="hidden text-sm text-on-surface-variant sm:block">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7047eb] font-bold text-white shadow-sm transition hover:bg-[#5b36d6]">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </Link>

              {/* Log out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-low"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              {/* Sign In Link */}
              <Link
                to="/login"
                className="text-sm font-semibold text-on-surface-variant transition hover:text-primary"
              >
                Sign in
              </Link>

              {/* Start Campaign CTA */}
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Start campaign
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* MOBILE SECONDARY NAV ROW */}
      <nav
        aria-label="Mobile Navigation"
        className="mx-auto flex max-w-container-max justify-center gap-2 overflow-x-auto border-t border-outline-variant/30 px-4 py-2 lg:hidden"
      >
        <NavLink
          to="/campaigns"
          className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-primary-fixed hover:text-primary"
        >
          Browse Campaigns
        </NavLink>
        <NavLink
          to="/campaigns/create"
          className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold text-on-surface-variant hover:bg-primary-fixed hover:text-primary"
        >
          Campaign Requests
        </NavLink>
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
      </nav>
    </header>
  );
}