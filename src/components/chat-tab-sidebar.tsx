import { EllipsisVertical, Search, SquarePlus, X } from "lucide-react";
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

function ChatTabSidebar({
  contacts,
  loading,
}: {
  contacts: any;
  loading: boolean;
}) {
  const [showOverlay, setShowOverlay] = useState(false);
  const onlineUsers = useUserOnlineState((state) => state.onlineUsers) || [];

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
              contacts?.map((contact: any, index: number) => {
                return (
                  <TabsTrigger
                    key={index}
                    value={contact.id}
                    className="flex items-center justify-start gap-2 rounded-md border-none w-full max-h-fit p-2 cursor-pointer
    hover:bg-accent/60 dark:data-[state=active]:bg-accent/60 data-[state=active]:text-foreground transition-colors"
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
