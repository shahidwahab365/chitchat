"use client";

import { useNotification } from "@/hooks/react-query/query-notification";
import { TabsContent } from "@radix-ui/react-tabs";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { timeAgo } from "@/lib/time-ago";
import { NotificationSkeleton } from "./skeletons/notification-skeleton";
import InfiniteScroll from "react-infinite-scroll-component";

type NotificationInfo = {
  avatar_url?: string;
};

type NotificationItem = {
  id: number;
  created_at: string;
  title: string;
  body: string;
  is_read: boolean;
  notification_type: string;
  info?: NotificationInfo | null;
  data?: unknown;
};

function NotificationRow({ n }: { n: NotificationItem }) {
  const avatar =
    n.info?.avatar_url ||
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='100%25' height='100%25' fill='%23ddd'/%3E%3C/svg%3E";

  return (
    <li
      className={[
        "group relative rounded-xl border border-border bg-card",
        "p-4 transition-colors",
        "hover:bg-accent",
        !n.is_read ? "bg-primary/5" : "",
      ].join(" ")}
    >
      {/* Unread dot */}
      {!n.is_read && (
        <span
          className="absolute right-4 top-4 size-2.5 rounded-full bg-primary"
          aria-label="Unread"
        />
      )}

      <div className="flex gap-3">
        <div className="relative shrink-0 ">
          <Image
            src={avatar}
            alt=""
            className="size-10 rounded-full object-cover ring-1 ring-border"
            width={50}
            height={50}
            priority={false}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground flex items-center gap-2">
                  {n.title}
                </p>
                <time
                  dateTime={n.created_at}
                  className="shrink-0 text-xs text-muted-foreground"
                >
                  {timeAgo(n.created_at)}
                </time>
              </div>

              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                {n.body}
              </p>
            </div>
          </div>

          {n.notification_type === "connect_request" && (
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                className={[
                  "inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-medium",
                  "bg-primary text-primary-foreground",
                  "hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                ].join(" ")}
                type="button"
              >
                Accept
              </Button>
              <Button
                className={[
                  "inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-medium",
                  "border border-border bg-background text-foreground",
                  "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                ].join(" ")}
                type="button"
              >
                Ignore
              </Button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export default function Notification() {
  const { data, error, isLoading, fetchNextPage, hasNextPage } =
    useNotification({ limit: 5 });

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const notifications = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) ?? [];
  }, [data]);

  const sorted = useMemo(() => {
    return notifications
      .slice()
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [notifications]);

  const unreadCount = useMemo(
    () => sorted.filter((n) => !n.is_read).length,
    [sorted],
  );

  const filtered = useMemo(() => {
    if (filter === "unread") return sorted.filter((n) => !n.is_read);
    return sorted;
  }, [sorted, filter]);

  if (error) {
    return (
      <TabsContent value="notification" className="p-4 sm:p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">
            Failed to load notifications
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        </div>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="notification" className="p-3 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="sticky top-0 z-10 -mx-3 mb-4 border-b border-border bg-background/80 px-3 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
                Notifications
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You’re all caught up"}
              </p>
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                type="button"
                onClick={() => setFilter("all")}
                className={[
                  "flex-1 sm:flex-none rounded-lg px-3 py-2 text-sm font-medium",
                  "border border-border",
                  filter === "all"
                    ? "bg-accent text-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                ].join(" ")}
              >
                All
              </Button>
              <Button
                type="button"
                onClick={() => setFilter("unread")}
                className={[
                  "flex-1 sm:flex-none rounded-lg px-3 py-2 text-sm font-medium",
                  "border border-border",
                  filter === "unread"
                    ? "bg-accent text-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                ].join(" ")}
              >
                Unread
              </Button>

              <Button
                type="button"
                disabled={unreadCount === 0}
                className={[
                  "hidden sm:inline-flex rounded-lg px-3 py-2 text-sm font-medium",
                  "border border-border bg-background text-foreground",
                  "hover:bg-accent disabled:opacity-50 disabled:hover:bg-background",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                ].join(" ")}
                title="Wire this to a mark-all-read mutation"
              >
                Mark all as read
              </Button>
            </div>
          </div>
        </div>
        <InfiniteScroll
          dataLength={notifications.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={<NotificationSkeleton />}
          scrollableTarget="scrollableDiv"
        >
          {isLoading ? (
            <NotificationSkeleton />
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-sm font-medium text-foreground">
                No notifications
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {filter === "unread"
                  ? "You have no unread notifications."
                  : "We’ll let you know when something happens."}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((n: any) => (
                <NotificationRow key={n.id} n={n} />
              ))}
            </ul>
          )}
        </InfiniteScroll>
      </div>
    </TabsContent>
  );
}
