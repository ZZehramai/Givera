



import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { NotificationList } from "../../components/ui/NotificationList";
import { donorNotifications } from "../../components/data/mockData";

export function Notifications() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader eyebrow="Activity" title="Notifications" description="Updates on your campaigns, receipts, and new public disclosures." />
      <div className="mt-6">
        <NotificationList items={donorNotifications} />
      </div>
    </div>);

}