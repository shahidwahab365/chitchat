"use client";
import "@livekit/components-styles";
import { useCallback, useMemo } from "react";
import {
  Clock3,
  Lock,
  MessageCircle,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Search,
  Video,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useUser } from "@clerk/nextjs";
import { TabsContent } from "./ui/tabs";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import UserAvatar from "./avatar";
import { requestUserMediaAccess } from "./chat-area-header";
import { useCallRNDState } from "@/store/use-call-rnd";
import { useGetCalls } from "@/hooks/react-query/query-calls";
import { useGetContacts } from "@/hooks/react-query/query-contact";
import { cn } from "@/lib/utils";

type CallStatus = "Outgoing" | "Incoming";

type CallRecord = {
  id: string | number;
  call_mode: "direct" | "group";
  call_type: "audio" | "video";
  callee_id: string;
  caller_id: string;
  created_at: string;
  duration: number | string | null;
  ended_at: string | null;
  is_deleted: boolean;
  started_at: string | null;
  status: string;
};

type CallItem = {
  id: string;
  name: string;
  avatar: string | null;
  date: string;
  time: string;
  duration: string;
  status: CallStatus;
  callType: "audio" | "video";
  isUnanswered: boolean;
};

function formatCallDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatCallTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCallDuration(duration: CallRecord["duration"]) {
  if (
    duration === null ||
    duration === undefined ||
    duration === "" ||
    Number(duration) === 0
  ) {
    return "Unanswered";
  }

  if (typeof duration === "string") return duration;

  const totalSeconds = Math.max(0, Math.floor(duration));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) return `${seconds}s`;

  return `${minutes}m ${seconds}s`;
}

function getCallStatusStyles(item: Pick<CallItem, "isUnanswered" | "status">) {
  if (item.isUnanswered) {
    return {
      row: "border-l-2 border-destructive bg-destructive/5 hover:bg-destructive/10",
      iconWrap: "bg-destructive/10 text-destructive",
      text: "text-destructive",
      badge: "bg-destructive/10 text-destructive",
    };
  }

  if (item.status === "Outgoing") {
    return {
      row: "border-l-2 border-primary bg-primary/5 hover:bg-primary/10",
      iconWrap: "bg-primary/10 text-primary",
      text: "text-primary",
      badge: "bg-primary/10 text-primary",
    };
  }

  return {
    row: "border-l-2 border-border bg-accent/40 hover:bg-accent/70",
    iconWrap: "bg-muted text-muted-foreground",
    text: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground",
  };
}

function StatusLine({
  isUnanswered,
  status,
}: {
  isUnanswered: boolean;
  status: CallStatus;
}) {
  const styles = getCallStatusStyles({ isUnanswered, status });
  const Icon = status === "Outgoing" ? PhoneOutgoing : PhoneIncoming;

  if (isUnanswered) {
    return (
      <p className={cn("flex items-center gap-1 text-xs", styles.text)}>
        <Icon className="size-3.5" /> Unanswered {status.toLowerCase()}
      </p>
    );
  }

  return (
    <p className={cn("flex items-center gap-1 text-xs", styles.text)}>
      <Icon className="size-3.5" /> {status}
    </p>
  );
}

function Calls() {
  const { data, error, isLoading } = useGetCalls();
  const { data: cachedContacts = [] } = useGetContacts();
  const setEnableCallRND = useCallRNDState((state) => state.setEnableCallRND);
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [callType, setCallType] = useState<"video" | "audio">("video");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();
  const currentUserId = user?.id;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const recentCalls = useMemo<CallItem[]>(() => {
    if (!currentUserId || !data) return [];

    return (data as CallRecord[]).map((call) => {
      const isOutgoing = call.caller_id === currentUserId;
      const otherUserId = isOutgoing ? call.callee_id : call.caller_id;
      const contact = cachedContacts.find(
        (item) =>
          item.contact_user_id === otherUserId &&
          item.status === "accepted" &&
          !item.is_deleted,
      );
      const duration = formatCallDuration(call.duration);

      return {
        id: String(call.id),
        name: contact?.info?.full_name ?? "Unknown Contact",
        avatar: contact?.info?.avatar_url ?? null,
        date: formatCallDate(call.created_at),
        time: formatCallTime(call.created_at),
        duration,
        status: isOutgoing ? "Outgoing" : "Incoming",
        callType: call.call_type,
        isUnanswered: duration === "Unanswered",
      };
    });
  }, [cachedContacts, currentUserId, data]);
  const filteredRecentCalls = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return recentCalls;

    return recentCalls.filter((item) =>
      item.name.toLowerCase().includes(query),
    );
  }, [recentCalls, searchQuery]);

  const handleTabChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <TabsContent value="call" className="h-full p-0">
      <div className="h-full w-full overflow-hidden bg-background text-foreground">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel
            defaultSize={30}
            minSize={22}
            maxSize={42}
            className="border-r border-border bg-accent/30 p-2"
          >
            <aside className="flex h-full min-h-0 flex-col gap-4">
              <h2 className="text-lg font-semibold">Calls</h2>

              <div className="w-full h-fit relative">
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="rounded-full border-none pl-8"
                  placeholder="Search your friends list..."
                />
                <Search
                  className="size-4 absolute top-1/2 left-2 -translate-y-1/2 text-foreground"
                  strokeWidth={1.89}
                />
              </div>

              <Separator className="max-w-[95%] mx-auto " />

              <div className="min-h-0 flex-1 overflow-y-auto px-2">
                <h3 className="mb-4 text-lg font-semibold">Recent</h3>
                {isLoading ? (
                  <div className="px-1 py-6 text-sm text-muted-foreground">
                    Loading calls...
                  </div>
                ) : error ? (
                  <div className="px-1 py-6 text-sm text-destructive">
                    Failed to load calls.
                  </div>
                ) : recentCalls.length === 0 ? (
                  <div className="px-1 py-6 text-sm text-muted-foreground">
                    No recent calls yet.
                  </div>
                ) : filteredRecentCalls.length === 0 ? (
                  <div className="px-1 py-6 text-sm text-muted-foreground">
                    No calls found for {searchQuery.trim()}.
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {filteredRecentCalls.map((item) => {
                      const styles = getCallStatusStyles(item);
                      const DirectionIcon =
                        item.status === "Outgoing"
                          ? PhoneOutgoing
                          : PhoneIncoming;

                      return (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>
                            <li
                              className={cn(
                                "flex cursor-pointer items-start justify-between gap-4 rounded-md px-2 py-2 transition-colors",
                                styles.row,
                              )}
                            >
                              <div className="flex min-w-0 items-start gap-3">
                                <UserAvatar
                                  src={item.avatar}
                                  alt={item.name}
                                  isOnline={false}
                                />
                                <div className="min-w-0">
                                  <p className="truncate text-base font-medium text-foreground">
                                    {item.name}
                                  </p>
                                  <p className="truncate text-xs capitalize text-muted-foreground">
                                    {item.callType} call
                                  </p>
                                  <StatusLine
                                    isUnanswered={item.isUnanswered}
                                    status={item.status}
                                  />
                                </div>
                              </div>
                              <span className="shrink-0 pt-1 text-xs text-muted-foreground">
                                {item.date}
                              </span>
                            </li>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            align="start"
                            className="w-56 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-md"
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={cn(
                                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                                  styles.iconWrap,
                                )}
                              >
                                <DirectionIcon className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">
                                  {item.name}
                                </p>
                                <p className="mt-0.5 truncate text-xs capitalize text-muted-foreground">
                                  {item.callType} call
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 space-y-1.5 text-xs">
                              <p className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                  Status
                                </span>
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 font-medium",
                                    styles.badge,
                                  )}
                                >
                                  {item.isUnanswered
                                    ? "Unanswered"
                                    : item.status}
                                </span>
                              </p>
                              <p className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                  Direction
                                </span>
                                <span>{item.status}</span>
                              </p>
                              <p className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                  Date
                                </span>
                                <span>{item.date}</span>
                              </p>
                              <p className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                  Time
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock3 className="size-3" />
                                  {item.time}
                                </span>
                              </p>
                              <p className="flex items-center justify-between gap-2">
                                <span className="text-muted-foreground">
                                  Duration
                                </span>
                                <span
                                  className={cn(
                                    item.isUnanswered && styles.text,
                                  )}
                                >
                                  {item.duration}
                                </span>
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="border-t border-border px-6 py-4">
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock className="size-4" />
                  Your personal calls are end-to-end encrypted
                </p>
              </div>
            </aside>
          </ResizablePanel>
          <ResizableHandle withHandle={false} />
          <ResizablePanel
            defaultSize={70}
            minSize={58}
            className="bg-background"
          >
            <section className="flex h-full min-h-0 items-center justify-center px-8">
              <div className="w-full max-w-md">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setCallType("video");
                      setOpenContactDialog(true);
                    }}
                    className="flex min-h-25 items-center justify-center gap-2 rounded-xl bg-accent/40 px-5 py-5 text-md font-medium text-foreground transition-colors hover:bg-accent cursor-pointer"
                  >
                    <Video strokeWidth={1.89} className="size-6 text-primary" />
                    Video call
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setCallType("audio");
                      setOpenContactDialog(true);
                    }}
                    className="flex min-h-25 items-center justify-center gap-2 rounded-xl bg-accent/40 px-5 py-5 text-md font-medium text-foreground transition-colors hover:bg-accent cursor-pointer"
                  >
                    <PhoneCall strokeWidth={1.89} className="size-6 text-primary" />
                    Audio call
                  </Button>
                  <Button
                    onClick={() => handleTabChange("chat")}
                    type="button"
                    className="flex min-h-25 items-center justify-center gap-2 rounded-xl bg-accent/40 px-5 py-5 text-md font-medium text-foreground transition-colors hover:bg-accent sm:col-span-2 cursor-pointer"
                  >
                    <MessageCircle strokeWidth={1.89} className="size-6 text-primary" />
                    Message
                  </Button>
                </div>
                <div className="mt-16 flex items-center justify-center">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="size-5" />
                    Your personal calls are end-to-end encrypted
                  </p>
                </div>
              </div>
            </section>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <Dialog open={openContactDialog} onOpenChange={setOpenContactDialog}>
        <DialogContent className="max-w-md p-0">
          <DialogHeader className="border-b border-border px-5 py-4">
            <DialogTitle className="text-base font-semibold">
              {callType === "video" ? "Start Video Call" : "Start Audio Call"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select a contact to start {callType} calling.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-105 overflow-y-auto p-2">
            {cachedContacts.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No contacts found in cache.
              </div>
            ) : (
              <ul className="space-y-1 h-full">
                {cachedContacts.map((contact: any, index: number) => (
                  <li key={contact.id ?? index} className="h-15">
                    <Button
                      type="button"
                      className="flex w-full h-full items-center justify-start gap-3 rounded-md text-left transition-colors bg-accent hover:bg-accent/60 cursor-pointer"
                      variant={"default"}
                      onClick={async () => {
                        const res = await requestUserMediaAccess({
                          type: callType,
                        });
                        if (!res) return;
                        setEnableCallRND({
                          type: callType,
                          callee_id: contact?.contact_user_id,
                          callMode: "direct",
                          callDirection: "outgoing",
                        });
                        setOpenContactDialog(false);
                      }}
                    >
                      <UserAvatar
                        src={contact.info?.avatar_url}
                        alt={contact.info?.full_name || "avatar"}
                        isOnline={false}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {contact.info?.full_name || "Unknown Contact"}
                        </p>
                      </div>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
}

export default Calls;
