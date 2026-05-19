import {
  CameraIcon,
  EllipsisVertical,
  PhoneCall,
  Search,
  SquarePlus,
  TrashIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { ResizablePanel } from "./ui/resizable";
import { Input } from "./ui/input";
import { TabsList, TabsTrigger } from "./ui/tabs";
import { useState } from "react";
import AddFriend from "./add-friend-overlay";
import { ContactListSkeleton } from "./skeletons/contacts-skeleton";
import { useUserOnlineState } from "@/store/use-get-user-online-state";
import UserAvatar from "./avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { requestUserMediaAccess } from "./chat-area-header";
import { useCallRNDState } from "@/store/use-call-rnd";
import { useRemoveContact } from "@/hooks/react-query/mutation-contact";

function ChatTabSidebar({
  contacts,
  loading,
}: {
  contacts: any;
  loading: boolean;
}) {
  const [showOverlay, setShowOverlay] = useState(false);
  const onlineUsers = useUserOnlineState((state) => state.onlineUsers) || [];
  const [openContextId, setOpenContextId] = useState<string | null>(null);
  const setEnableCallRND = useCallRNDState((state) => state.setEnableCallRND);
  const { mutate: removeContactFn, isPending } = useRemoveContact();

  return (
    <ResizablePanel
      defaultSize={20}
      minSize={16}
      maxSize={40}
      className="p-2 flex flex-1 w-full flex-col items-start gap-2 bg-accent/30 relative overflow-hidden"
    >
      <div
        className={`w-full h-full flex flex-col gap-2 transition-all duration-300 ${showOverlay ? "blur-sm pointer-events-none" : ""}`}
      >
        <div className="w-full flex items-center justify-between h-10 py-5">
          <Label className="font-semibold text-lg">Chats</Label>
          <div className="flex items-center">
            <Button
              className="p-0 h-8 w-8 rounded-full bg-transparent hover:bg-primary-foreground cursor-pointer"
              onClick={() => setShowOverlay(true)}
            >
              <SquarePlus className="size-5 text-primary" strokeWidth={1.89} />
            </Button>
            <Button className="p-0 h-8 w-8 rounded-full bg-transparent hover:bg-primary-foreground cursor-pointer">
              <EllipsisVertical
                className="size-5 text-primary"
                strokeWidth={1.89}
              />
            </Button>
          </div>
        </div>
        <div className="w-full">
          <div className="w-full h-fit relative">
            <Input
              className="rounded-full border-none pl-8"
              placeholder="Search your friends list..."
            />
            <Search
              className="size-4 absolute top-1/2 left-2 -translate-y-1/2 text-foreground"
              strokeWidth={1.89}
            />
          </div>
        </div>
        <div className="w-full h-full">
          <TabsList className="flex flex-col justify-start w-full min-h-full bg-transparent gap-1">
            {loading ? (
              <ContactListSkeleton />
            ) : (
              contacts?.map((contact: any) => {
                return (
                  <ContextMenu
                    key={contact.id}
                    onOpenChange={(open) =>
                      setOpenContextId(open ? contact.id : null)
                    }
                  >
                    <ContextMenuTrigger className="w-full h-fit">
                      <TabsTrigger
                        value={contact.id}
                        className={`flex items-center justify-start gap-2 rounded-md border-none w-full max-h-fit p-2 cursor-pointer
    hover:bg-accent/60 dark:data-[state=active]:bg-accent/60 data-[state=active]:text-foreground transition-colors ${openContextId === contact.id ? "bg-accent/60 text-foreground" : ""}`}
                      >
                        <UserAvatar
                          src={contact.info.avatar_url}
                          alt="avatar"
                          isOnline={!!onlineUsers[contact.contact_user_id]}
                        />

                        <div className="flex flex-col items-start justify-center overflow-hidden min-w-0">
                          <h2 className="text-sm font-medium">
                            {contact.info.full_name}
                          </h2>
                          <span className="text-xs text-muted-foreground italic truncate font-normal">
                            Click to start conversation
                          </span>
                        </div>
                      </TabsTrigger>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-50">
                      <ContextMenuGroup>
                        <ContextMenuItem
                          onClick={async () => {
                            const res = await requestUserMediaAccess({
                              type: "audio",
                            });
                            if (!res) return;
                            setEnableCallRND({
                              type: "audio",
                              callee_id: contact?.contact_user_id,
                              callMode: "direct",
                              callDirection: "outgoing",
                            });
                          }}
                          className="cursor-pointer gap-5"
                        >
                          <PhoneCall strokeWidth={1.89} className=" size-4" />
                          Audio Call
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={async () => {
                            const res = await requestUserMediaAccess({
                              type: "video",
                            });
                            if (!res) return;
                            setEnableCallRND({
                              type: "video",
                              callee_id: contact?.contact_user_id,
                              callMode: "direct",
                              callDirection: "outgoing",
                            });
                          }}
                          className="cursor-pointer gap-5"
                        >
                          <CameraIcon strokeWidth={1.89} className=" size-4" />
                          Video Call
                        </ContextMenuItem>
                      </ContextMenuGroup>
                      <ContextMenuSeparator />
                      <ContextMenuGroup>
                        <ContextMenuItem
                          className="cursor-pointer gap-5"
                          variant="destructive"
                          onClick={() =>
                            removeContactFn({ id: contact.contact_user_id })
                          }
                        >
                          <TrashIcon strokeWidth={1.89} className="size-4" />
                          {isPending ? "Deleting..." : "Delete"}
                        </ContextMenuItem>
                      </ContextMenuGroup>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })
            )}
          </TabsList>
        </div>
      </div>

      <AddFriend showOverlay={showOverlay} setShowOverlay={setShowOverlay} />
    </ResizablePanel>
  );
}

export default ChatTabSidebar;
