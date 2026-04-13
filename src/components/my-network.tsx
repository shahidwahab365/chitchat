"use client";

import { TabsContent } from "@radix-ui/react-tabs";
import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";
import NetworkPendings from "./network-pending";
import NetworkInvitations from "./network-invitations";
import NetworkConnections from "./network-connections";

export type Person = {
  id: number | string;
  info: {
    full_name: string;
    avatar_url: string | null;
  };
  created_at: string;
  user_id: string;
  status: "requested" | "accepted" | "blocked";
};

function TabTrigger({
  value,
  label,
  count,
}: {
  value: string;
  label: string;
  count?: number;
}) {
  return (
    <Tabs.Trigger
      value={value}
      className={[
        "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
        "border border-border bg-background text-muted-foreground",
        "hover:bg-accent hover:text-foreground",
        "data-[state=active]:bg-accent data-[state=active]:text-foreground",
        "focus-visible:outline-none",
        "whitespace-nowrap cursor-pointer",
      ].join(" ")}
    >
      <span>{label}</span>
      {typeof count === "number" ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
      ) : null}
    </Tabs.Trigger>
  );
}

function MyNetwork() {
  const [pendingRequestsLength, setPendingRequestsLength] = useState<number>(0);
  const [invitationsLength, setInvitationsLength] = useState<number>(0);
  const [contactsLength, setContactsLength] = useState<number>(0);

  return (
    <TabsContent value="my-network" className="p-3 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            My Network
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage connections, invitations, and pending requests.
          </p>
        </div>

        <Tabs.Root defaultValue="connections">
          <div className="sticky top-0 z-10 -mx-3 mb-4 border-b border-border bg-background/80 px-3 py-3 backdrop-blur sm:-mx-6 sm:px-6">
            <Tabs.List className="flex w-full gap-2 overflow-x-auto pb-1">
              <TabTrigger
                value="connections"
                label="Connections"
                count={contactsLength}
              />
              <TabTrigger
                value="invitations"
                label="Invitations"
                count={invitationsLength}
              />
              <TabTrigger
                value="pending"
                label="Pending"
                count={pendingRequestsLength}
              />
            </Tabs.List>
          </div>

          <NetworkConnections setContactsLength={setContactsLength} />
          <NetworkInvitations setInvitationsLength={setInvitationsLength} />
          <NetworkPendings setPendingRequestsLength={setPendingRequestsLength} />
        </Tabs.Root>
      </div>
    </TabsContent>
  );
}

export default MyNetwork;
