"use client";

import MainHeader from "@/components/main-header";
import React, { Suspense, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellRing, MessageSquareText, Phone, UsersRound } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { ModeToggle } from "@/components/theme-toggle";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useSession,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import SplashScreen from "@/components/splash-screen";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { SOUNDS } from "@/constants/sounds";
import { IMessages } from "@/types/messages";
import { useUserOnlineState } from "@/store/use-get-user-online-state";
import { useCallRNDState } from "@/store/use-call-rnd";
import CallRND from "@/components/call-rnd";

type TabItem = {
  Icon: keyof typeof icons;
  value: string;
};

const icons = {
  MessageSquareText,
  Phone,
  BellRing,
  UsersRound,
};

const items: TabItem[] = [
  { Icon: "MessageSquareText", value: "chat" },
  { Icon: "Phone", value: "call" },
  { Icon: "BellRing", value: "notification" },
  { Icon: "UsersRound", value: "my-network" },
];

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const { session } = useSession();
  const supabase = useSupabase();
  const client = useQueryClient();
  const currentTab = searchParams.get("tab") || "chat";
  const { setOnlineUsersBulk } = useUserOnlineState();

  const notifyAudioRef = React.useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    notifyAudioRef.current = new Audio(SOUNDS.NOTIFICATION);
  }, []);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`?${params.toString()}`);
  };

  useEffect(() => {
    if (!user?.id) return;

    const channels: any[] = [];

    const subscribe = async () => {
      const token = await session?.getToken({ template: "supabase" });
      if (!token) return;

      await supabase.realtime.setAuth(token);

      const notificationChannel = supabase
        .channel(`notifications:${user.id}`, {
          config: { private: true },
        })
        .on("broadcast", { event: "INSERT" }, (payload) => {
          client.invalidateQueries({
            queryKey: ["get-invitations", user.id],
          });

          client.invalidateQueries({
            queryKey: ["get-pending-contacts", user.id],
          });

          client.invalidateQueries({
            queryKey: ["get-contacts", user.id],
          });

          client.invalidateQueries({
            queryKey: ["notifications", user.id],
          });

          notifyAudioRef.current!.volume = 1;
          notifyAudioRef.current?.play();
          toast(payload.payload.title, {
            description: payload.payload.body,
          });
        })
        .subscribe((status) => {
          if (status === "CLOSED") {
            subscribe();
          }
        });

      const messageChannel = supabase
        .channel("message-listner")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newMessage = payload.new;

              const incomingMessage: IMessages = {
                id: newMessage.id,
                sender_id: newMessage.sender_id,
                recipient_id: newMessage.recipient_id,
                message_type: newMessage.message_type,
                content: newMessage.content,
                file_name: newMessage.file_name,
                file_size: newMessage.file_size,
                duration: newMessage.duration,
                reply_to_message_id: newMessage.reply_to_message_id,
                is_edited: newMessage.is_edited,
                message_read_status: newMessage.message_read_status,
                created_at: newMessage.created_at,
              };

              client.setQueryData(
                ["messages", newMessage.sender_id],
                (oldData: any) => {
                  if (!oldData) return oldData;

                  const alreadyExists = oldData.pages.some((page: any) =>
                    page.data.some((msg: any) => msg.id === incomingMessage.id),
                  );

                  if (alreadyExists) return oldData;

                  return {
                    ...oldData,
                    pages: oldData.pages.map((page: any, index: any) => {
                      if (index === 0) {
                        return {
                          ...page,
                          data: [incomingMessage, ...page.data],
                        };
                      }

                      return page;
                    }),
                  };
                },
              );
            }

            if (payload.eventType === "UPDATE") {
              const updatedMessage = payload.new;

              if (updatedMessage.is_deleted) {
                client.setQueryData(
                  ["messages", updatedMessage.sender_id],
                  (oldData: any) => {
                    if (!oldData) return oldData;

                    return {
                      ...oldData,
                      pages: oldData.pages.map((page: any) => ({
                        ...page,
                        data: page.data.filter(
                          (msg: any) => msg.id !== updatedMessage.id,
                        ),
                      })),
                    };
                  },
                );
              }
            }
          },
        )
        .subscribe((status) => {
          if (status === "CLOSED") {
            subscribe();
          }
        });

      const presenceChannel = supabase.channel("online-users", {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      presenceChannel
        .on("presence", { event: "sync" }, () => {
          const state = presenceChannel.presenceState();
          setOnlineUsersBulk(state);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await presenceChannel.track({
              user_id: user.id,
            });
          }

          if (status === "CLOSED") {
            subscribe();
          }
        });

      channels.push(notificationChannel, messageChannel, presenceChannel);
    };

    subscribe();

    return () => {
      if (channels.length) {
        channels.map((channel) => {
          supabase.removeChannel(channel);
        });
      }
    };
  }, [user?.id]);

  return (
    <Tabs
      value={currentTab}
      onValueChange={handleTabChange}
      className="flex flex-1 overflow-hidden"
    >
      <div className="flex flex-1 overflow-hidden">
        <div className="max-w-fit bg-sidebar flex flex-col justify-between">
          <TabsList className="flex bg-sidebar flex-col flex-1 items-center justify-start gap-2 p-2 border-none rounded-none w-14">
            {items.map((item) => {
              const Icon = icons[item.Icon];
              return (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="flex items-center justify-center dark:data-[state=active]:bg-primary-foreground gap-2 rounded-full border-none max-h-9 min-w-9 p-2 cursor-pointer"
                >
                  <Icon className="size-5" strokeWidth={1.89} />
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div className="w-full h-fit flex flex-col items-center gap-2 p-2">
            <ModeToggle />
            <SignedOut>
              <SignInButton>
                <Button className="bg-primary rounded-full font-medium text-sm sm:text-base px-4 sm:px-5 cursor-pointer">
                  Sign in
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "min-w-9 min-h-9 border-2 border-red",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>

        <div className="flex-1 h-full bg-background border-primary border-r-0  border-l border-t rounded-tl-lg overflow-clip">
          {children}
        </div>
      </div>
    </Tabs>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useUser();
  const isShowCallRND = useCallRNDState().isShowCallRND;

  if (!isLoaded) {
    return <SplashScreen />;
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <MainHeader />
      {isShowCallRND && <CallRND />}
      <Suspense fallback={<SplashScreen />}>
        <AppLayoutContent>{children}</AppLayoutContent>
      </Suspense>
    </div>
  );
}

export default AppLayout;
