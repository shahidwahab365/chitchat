"use client";

import Calls from "@/components/calls";
import Chat from "@/components/chat";
import MyNetwork from "@/components/my-network";
import Notification from "@/components/notification";
import { useSearchParams } from "next/navigation";

function ChatPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "chat";

  return (
    <div className="w-full h-full overflow-auto" id="scrollableDiv">
      {tab === "chat" && <Chat />}
      {tab === "call" && <Calls />}
      {tab === "notification" && <Notification />}
      {tab === "my-network" && <MyNetwork />}
    </div>
  );
}

export default ChatPage;