import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import {
  BatteryPlus,
  ChevronDown,
  EllipsisVertical,
  MessageCircleX,
  Phone,
  Video,
} from "lucide-react";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import UserAvatar from "./avatar";
import { useUserOnlineState } from "@/store/use-get-user-online-state";
import { useCallRNDState } from "@/store/use-call-rnd";
import { useState } from "react";
import { toast } from "sonner";

export async function requestUserMediaAccess({
  type,
}: {
  type: "video" | "audio";
}) {
  try {
    await navigator.mediaDevices.getUserMedia({
      video: type === "video" ? true : false,
      audio: true,
    });

    return true;
  } catch (error: any) {
    if (error.name === "NotAllowedError") {
      toast.error(
        type === "video"
          ? "You need to allow camera and microphone access to use this feature."
          : "You need to allow microphone access to use this feature.",
      );
    }

    return false;
  }
}

function ChatAreaHeader({
  contact,
  setActiveTab,
}: {
  setActiveTab: (e: string) => void;
  contact: any;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const handleCloseChat = () => {
    setActiveTab("empty");
  };

  const onlineUsers = useUserOnlineState((state) => state.onlineUsers) || [];
  const setEnableCallRND = useCallRNDState().setEnableCallRND;

  return (
    <header className="flex items-center justify-between w-full h-16 px-4 bg-accent/40 shrink-0">
      <div className="flex items-center gap-3">
        <UserAvatar
          src={contact.info.avatar_url}
          alt="avatar"
          isOnline={!!onlineUsers[contact.contact_user_id]}
        />
        <span className="font-medium text-sm">{contact.info.full_name}</span>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-full flex items-center justify-center gap-2"
            >
              <BatteryPlus className="size-5" strokeWidth={1.89} />
              <span className="text-sm">Call</span>
              <ChevronDown className="size-4" strokeWidth={1.89} />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="bottom"
            align="end"
            className="min-w-70 flex flex-col gap-2"
          >
            <DropdownMenuGroup className="flex items-center gap-3">
              <UserAvatar
                src={contact.info.avatar_url}
                alt="avatar"
                isOnline={!!onlineUsers[contact.contact_user_id]}
              />
              <span className="font-medium text-sm">
                {contact.info.full_name}
              </span>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="h-px bg-accent" />
            <DropdownMenuGroup className="flex gap-2">
              <Button
                className="flex-1 rounded-full flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/80"
                onClick={async () => {
                  const res = await requestUserMediaAccess({ type: "audio" });
                  if (!res) return;
                  setOpen(false);
                  setEnableCallRND({
                    type: "audio",
                    callee_id: contact?.contact_user_id,
                    callMode: "direct",
                    callDirection: "outgoing",
                  });
                }}
              >
                <Phone className="size-5" strokeWidth={1.89} />
                Audio
              </Button>
              <Button
                className="flex-1 rounded-full flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/80"
                onClick={async () => {
                  const res = await requestUserMediaAccess({ type: "video" });
                  if (!res) return;
                  setOpen(false);
                  setEnableCallRND({
                    type: "video",
                    callee_id: contact?.contact_user_id,
                    callMode: "direct",
                    callDirection: "outgoing",
                  });
                }}
              >
                <Video className="size-5" strokeWidth={1.89} />
                Video
              </Button>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="rounded-full h-9 w-9 flex items-center justify-center"
            >
              <EllipsisVertical className="size-5" strokeWidth={1.89} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="min-w-45">
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer"
                onClick={handleCloseChat}
              >
                <MessageCircleX className="size-5" strokeWidth={1.89} />
                <span>Close chat</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default ChatAreaHeader;
