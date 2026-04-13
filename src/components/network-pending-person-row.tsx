import React from "react";
import Avatar from "./avatar";
import { Person } from "./my-network";
import { timeAgo } from "@/lib/time-ago";

export default function PendingPersonRow({
  person,
  right,
}: {
  person: Person;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar src={person.info.avatar_url} alt={person.info.full_name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {person.info.full_name}
          </p>
          {person.status ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              Connection request was sent • {timeAgo(person.created_at)}
            </p>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {
            <time
              dateTime={person.created_at}
              className="shrink-0 text-xs text-muted-foreground"
            ></time>
          }
        </p>
      </div>

      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
