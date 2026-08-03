import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
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


  useEffect(() => {
    // 2. Create a function to refresh the user from storage
    const syncUser = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user") || "null");
      setUser(updatedUser);
    };

    // 3. Listen for the custom event we dispatched in Profile.jsx
    window.addEventListener("userUpdated", syncUser);

    // 4. Cleanup the listener when component unmounts
    return () => window.removeEventListener("userUpdated", syncUser);
  }, []);

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

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;
  const markRead = async (notification) => {
    if (!notification.is_read) {
      try {
        await api.patch(`/auth/notifications/${notification.id}/read/`);
        setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, is_read: true } : item));
      } catch { /* The notification can still be opened if marking it read fails. */ }
    }
    setNotificationsOpen(false);
  };

  const markAllRead = async () => {
    try {
      await api.post("/auth/notifications/read-all/");
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
        <Link to="/" className="text-2xl font-bold text-primary">
          Givera
        </Link>
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex">
            {isLandingPage ? (
              <>
                <a href="#campaigns" className={sectionClass}>Campaigns</a>
                <a href="#how-it-works" className={sectionClass}>How it works</a>
                <a href="#faq" className={sectionClass}>FAQ</a>
                {user && (
                  <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
                )}
              </>
            ) : (
              <>
                {user && (
                  <NavLink to="/dashboard" className={navClass}>
                    Dashboard
                  </NavLink>
                )}
                <NavLink to="/campaigns" className={navClass}>
                  Browse campaigns
                </NavLink>
                {user && (
                  <NavLink to="/my-campaigns" className={navClass}>
                    My campaigns
                  </NavLink>
                )}
                {(user?.role === "admin" || user?.is_staff) && (
                  <NavLink to="/admin/campaigns" className={navClass}>
                    Review queue
                  </NavLink>
                )}
              </>
            )}
          </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
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
              </Link>

            
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-semibold text-on-surface hover:bg-surface-container-low"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low"
            >
              Log in
            </Link>
          )}
          <Link
            to={user ? "/campaigns/create" : "/login"}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            Start a campaign
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </nav>
      {isLandingPage && (
        <nav
          aria-label="Landing page sections"
          className="mx-auto flex max-w-container-max justify-center gap-2 overflow-x-auto border-t border-outline-variant/30 px-4 py-2 lg:hidden"
        >
          {[
            ["#campaigns", "Campaigns"],
            ["#how-it-works", "How it works"],
            ["#faq", "FAQ"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold text-on-surface-variant transition hover:bg-primary-fixed hover:text-primary"
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
