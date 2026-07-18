




import React from "react";
import { PageHeader } from "../../components/ui/PageHeader";
import { NotificationList } from "../../components/ui/NotificationList";
import { adminNotifications } from "../../components/data/mockData";

export function AdminNotifications() {
  return (
    <div>
      <PageHeader eyebrow="Operations" title="Notifications" description="Approvals, disclosure deadlines, and platform alerts." />
      <div className="mt-6 max-w-3xl">
        <NotificationList items={adminNotifications} />
      </div>
    </div>);

}