

import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboardIcon,
  WavesIcon,
  HeartHandshakeIcon,
  BarChart3Icon,
  UsersIcon,
  BellIcon,
  BotIcon,
  UserCogIcon,
  MenuIcon,
  XIcon,
  ExternalLinkIcon } from
"lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "../ui/Logo";

const navItems = [
{ to: "/admin", label: "Dashboard", icon: LayoutDashboardIcon, end: true },
{ to: "/admin/disasters", label: "Natural disasters", icon: WavesIcon },
{ to: "/admin/underprivileged", label: "Underprivileged", icon: HeartHandshakeIcon },
{ to: "/admin/analysis", label: "Analysis", icon: BarChart3Icon },
{ to: "/admin/users", label: "User management", icon: UsersIcon },
{ to: "/admin/notifications", label: "Notifications", icon: BellIcon },
{ to: "/admin/assistant", label: "AI assistant", icon: BotIcon },
{ to: "/admin/profile", label: "Profile", icon: UserCogIcon }];


export function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full bg-[#f5f5f3] text-[#1d2522]">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#20463a] bg-[#173d32] lg:flex">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-[#d8d8d2] bg-white px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-md border border-[#d8d8d2] text-[#2b332e] lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]"
              aria-label="Open navigation"
              aria-expanded={drawerOpen}>
              
              <MenuIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.11em] text-[#6e736d]">Administrative console</p>
              <p className="text-sm font-semibold text-[#1d2522]">Operations workspace</p>
            </div>
          </div>
          <Link to="/" className="inline-flex items-center gap-1.5 rounded-md border border-[#cfd1ca] px-3 py-1.5 text-[12px] font-semibold text-[#2b332e] transition-colors hover:bg-[#f5f6f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">
            Public site <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </header>

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
            <Outlet />
          </div>
        </main>
      </div>

      <AnimatePresence>
        {drawerOpen ?
        <motion.div className="fixed inset-0 z-50 lg:hidden" initial={shouldReduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>
            <button type="button" className="absolute inset-0 bg-[#0f1c17]/40" onClick={() => setDrawerOpen(false)} aria-label="Close navigation" />
            <motion.aside
            className="relative flex h-full w-64 flex-col bg-[#173d32] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            initial={shouldReduceMotion ? false : { x: -24 }}
            animate={{ x: 0 }}
            exit={{ x: -24 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}>
            
              <SidebarContent onClose={() => setDrawerOpen(false)} />
            </motion.aside>
          </motion.div> :
        null}
      </AnimatePresence>
    </div>);

}

function SidebarContent({ onClose }: {onClose?: () => void;}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-[#26503f] px-4">
        <Logo variant="dark" subtitle="Admin console" />
        {onClose ?
        <button type="button" onClick={onClose} className="rounded p-1.5 text-[#a9c3b7] hover:bg-[#20463a] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden" aria-label="Close navigation">
            <XIcon className="h-4 w-4" aria-hidden="true" />
          </button> :
        null}
      </div>
      <nav className="flex-1 overflow-y-auto p-3" aria-label="Admin sections">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                  isActive ? "bg-[#0f8a5a] text-white" : "text-[#c3d6cd] hover:bg-[#20463a] hover:text-white"}`

                  }>
                  
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              </li>);

          })}
        </ul>
      </nav>
      <div className="border-t border-[#26503f] p-4">
        <p className="text-[11px] leading-4 text-[#8fb0a3]">Signed in as L. Fischer — Program administrator</p>
      </div>
    </>);

}