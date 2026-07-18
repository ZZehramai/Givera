


import React, { useState } from "react";
import { FileTextIcon, HeartIcon, ReceiptTextIcon, SettingsIcon, CheckCheckIcon, ClipboardCheckIcon } from "lucide-react";
import type { NotificationItem } from "../data/mockData";

const categoryMeta: Record<NotificationItem["category"], {icon: typeof FileTextIcon;tint: string;}> = {
  disclosure: { icon: FileTextIcon, tint: "bg-[#f0f8f4] text-[#16734e]" },
  campaign: { icon: HeartIcon, tint: "bg-[#fbf1e9] text-[#a35a1f]" },
  receipt: { icon: ReceiptTextIcon, tint: "bg-[#eef2f6] text-[#3d5670]" },
  system: { icon: SettingsIcon, tint: "bg-[#f2f2ef] text-[#6b706a]" },
  approval: { icon: ClipboardCheckIcon, tint: "bg-[#f0f8f4] text-[#16734e]" }
};

export function NotificationList({ items }: {items: NotificationItem[];}) {
  const [notifications, setNotifications] = useState(items);
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="rounded-lg border border-[#d8d8d2] bg-white">
      <div className="flex items-center justify-between border-b border-[#e3e3de] px-4 py-3">
        <p className="text-[13px] font-semibold text-[#1d2522]">{unread} unread</p>
        <button
          type="button"
          onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
          disabled={unread === 0}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#16734e] transition-colors hover:underline disabled:text-[#a2a69f] disabled:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]">
          
          <CheckCheckIcon className="h-3.5 w-3.5" aria-hidden="true" /> Mark all read
        </button>
      </div>
      <ul className="divide-y divide-[#eeeeea]">
        {notifications.map((n) => {
          const meta = categoryMeta[n.category];
          const Icon = meta.icon;
          return (
            <li key={n.id} className={`flex gap-3 px-4 py-4 ${n.unread ? "bg-[#fbfcfb]" : ""}`}>
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded ${meta.tint}`}><Icon className="h-4 w-4" aria-hidden="true" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-semibold text-[#1d2522]">{n.title}</p>
                  <span className="shrink-0 text-[11px] text-[#9a9d96]">{n.time}</span>
                </div>
                <p className="mt-0.5 text-[13px] leading-5 text-[#5f655e]">{n.body}</p>
              </div>
              {n.unread ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#16734e]" aria-label="Unread" /> : null}
            </li>);

        })}
      </ul>
    </div>);

}