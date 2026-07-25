import { Link, NavLink, useNavigate } from "react-router-dom";

import { logout } from "../services/authService";

export default function AppHeader() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    `text-sm font-semibold transition ${
      isActive ? "text-primary" : "text-on-surface-variant hover:text-primary"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/30 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-18 max-w-container-max items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-primary">
            Givera
          </Link>
          <div className="hidden items-center gap-6 md:flex">
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
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/profile"
                className="hidden text-sm text-on-surface-variant sm:block"
              >
                {user.first_name || user.username}
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
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
          >
            Start a campaign
          </Link>
        </div>
      </nav>
    </header>
  );
}
