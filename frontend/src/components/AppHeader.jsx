import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { logout } from "../services/authService";

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const [user, setUser] = useState (() => JSON.parse(localStorage.getItem("user") || "null"));


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

  const handleLogout = () => {
    logout();
    navigate("/login");
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
              <Link
                to="/profile"
                className="hidden text-sm text-on-surface-variant sm:block"
              >
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white text-1xl font-bold shadow-lg mb-0.2">
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
