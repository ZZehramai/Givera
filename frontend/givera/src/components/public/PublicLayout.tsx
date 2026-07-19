import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { MenuIcon, XIcon, BellIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "../ui/Logo";

const navItems = [
  { to: "/disasters", label: "Natural disasters" },
  { to: "/underprivileged", label: "Underprivileged" },
  { to: "/transparency", label: "Analysis" },
  { to: "/dashboard", label: "Dashboard" },
];

export function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-[13px] font-medium transition-colors ${isActive ? "text-[#16734e]" : "text-[#4a504a] hover:text-[#1d2522]"}`;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f5f5f3] text-[#1d2522]">
      <header className="sticky top-0 z-40 border-b border-[#d8d8d2] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo subtitle="Accountable giving" />
          <nav
            className="hidden items-center gap-7 md:flex"
            aria-label="Primary"
          >
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/notifications"
              className="grid h-9 w-9 place-items-center rounded-md border border-[#d8d8d2] text-[#4a504a] transition-colors hover:bg-[#f5f6f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]"
              aria-label="Notifications"
            >
              <BellIcon className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/login"
              className="rounded-md border border-[#cfd1ca] px-3.5 py-2 text-[13px] font-semibold text-[#2b332e] transition-colors hover:bg-[#f5f6f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]"
            >
              Log in
            </Link>
             <Link
              to="/profile"
              className="rounded-md border border-[#cfd1ca] px-3.5 py-2 text-[13px] font-semibold text-[#2b332e] transition-colors hover:bg-[#f5f6f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]"
            >
              Profile
            </Link>
            <Link
              to="/donate"
              className="rounded-md bg-[#16734e] px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#125f40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]"
            >
              Donate
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-md border border-[#d8d8d2] text-[#2b332e] md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <XIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <MenuIcon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
        <AnimatePresence>
          {menuOpen ? (
            <motion.nav
              className="border-t border-[#e6e6e2] bg-white px-4 py-3 md:hidden"
              initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              aria-label="Mobile"
            >
              <div className="flex flex-col gap-1">
                {[
                  ...navItems,
                  { to: "/notifications", label: "Notifications" },
                  { to: "/history", label: "History" },
                  { to: "/profile", label: "Profile" },
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-[#f0f8f4] text-[#16734e]" : "text-[#3a413a] hover:bg-[#f5f6f3]"}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="mt-2 flex gap-2">
                  <Link
                    to="/login"
                    className="flex-1 rounded-md border border-[#cfd1ca] px-3 py-2 text-center text-[13px] font-semibold text-[#2b332e]"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/donate"
                    className="flex-1 rounded-md bg-[#16734e] px-3 py-2 text-center text-[13px] font-semibold text-white"
                  >
                    Donate
                  </Link>
                </div>
              </div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[#d8d8d2] bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo subtitle="Accountable giving" />
            <p className="mt-3 max-w-xs text-[13px] leading-5 text-[#6e736d]">
              Open-data charity infrastructure built for public trust,
              transparent allocation, and independent verification.
            </p>
          </div>
          <FooterCol
            title="Give"
            links={[
              ["Natural disasters", "/disasters"],
              ["Underprivileged", "/underprivileged"],
              ["Make a donation", "/donate"],
              ["Request a campaign", "/request-campaign"],
            ]}
          />
          <FooterCol
            title="Accountability"
            links={[
              ["Transparency archive", "/transparency"],
              ["Annual reports", "/transparency"],
              ["Assistant", "/assistant"],
            ]}
          />
          <FooterCol
            title="Account"
            links={[
              ["Log in", "/login"],
              ["Register", "/register"],
              ["Admin console", "/admin/login"],
            ]}
          />
        </div>
        <div className="border-t border-[#eeeeea]">
          <div className="mx-auto flex w-full max-w-6xl flex-col justify-between gap-2 px-4 py-4 text-[11px] text-[#8a8f88] sm:flex-row sm:px-6">
            <span>© 2026 Givera. A public accountability demonstration.</span>
            <span>
              Frontend prototype — records shown are representative data.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#8a8f88]">
        {title}
      </h2>
      <ul className="mt-3 space-y-2">
        {links.map(([label, to]) => (
          <li key={label + to}>
            <Link
              to={to}
              className="text-[13px] text-[#4a504a] transition-colors hover:text-[#16734e]"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
