




import React, { useMemo, useState } from "react";
import { SearchIcon, MoreHorizontalIcon } from "lucide-react";
import { PageHeader } from "../../components/ui/PageHeader";
import { inputClass } from "../../components/ui/Field";
import { managedUsers, formatCurrency } from "../../components/data/mockData";

const statusStyles: Record<string, string> = {
  Verified: "border-[#a9d5c2] bg-[#f0f8f4] text-[#126240]",
  Pending: "border-[#e6c3ac] bg-[#fbf1e9] text-[#a35a1f]",
  Suspended: "border-[#e0b4b4] bg-[#fbeeee] text-[#a33232]"
};

const roles = ["All", "Donor", "Campaign owner", "Administrator"] as const;

export function UserManagement() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]>("All");

  const list = useMemo(
    () =>
    managedUsers.
    filter((u) => role === "All" ? true : u.role === role).
    filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())),
    [query, role]
  );

  return (
    <div>
      <PageHeader eyebrow="Directory" title="User management" description="Review donor and campaign-owner accounts, roles, and verification status." />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a9d96]" aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" aria-label="Search users" className={`${inputClass} pl-9`} />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by role">
          {roles.map((r) =>
          <button key={r} type="button" onClick={() => setRole(r)} aria-pressed={role === r} className={`rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e] ${role === r ? "border-[#16734e] bg-[#f0f8f4] text-[#126240]" : "border-[#cfd1ca] bg-white text-[#4a504a] hover:bg-[#f5f6f3]"}`}>{r}</button>
          )}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-[#d8d8d2] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="border-b border-[#e3e3de] bg-[#fbfbf9] text-[11px] font-bold uppercase tracking-[0.06em] text-[#777b75]">
              <tr>
                <th scope="col" className="px-4 py-3">User</th>
                <th scope="col" className="px-4 py-3">Role</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Joined</th>
                <th scope="col" className="px-4 py-3 text-right">Contributions</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeea]">
              {list.map((u) =>
              <tr key={u.id} className="hover:bg-[#fafaf8]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eef2f0] text-[11px] font-bold text-[#3a5346]">{u.name.split(" ").map((n) => n[0]).join("")}</span>
                      <div><p className="font-semibold text-[#1d2522]">{u.name}</p><p className="text-[11px] text-[#888b84]">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#5f655e]">{u.role}</td>
                  <td className="px-4 py-3"><span className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold ${statusStyles[u.status]}`}>{u.status}</span></td>
                  <td className="px-4 py-3 text-[#5f655e]">{u.joined}</td>
                  <td className="px-4 py-3 text-right font-semibold text-[#1d2522]">{u.contributions ? formatCurrency(u.contributions) : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" className="grid h-8 w-8 place-items-center rounded-md border border-[#cfd1ca] text-[#5f655e] hover:bg-[#f5f6f3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16734e]" aria-label={`Actions for ${u.name}`}><MoreHorizontalIcon className="h-4 w-4" aria-hidden="true" /></button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}