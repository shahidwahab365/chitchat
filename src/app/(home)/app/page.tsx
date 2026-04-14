"use client";

import Calls from "@/components/calls";
import Chat from "@/components/chat";
import MyNetwork from "@/components/my-network";
import Notification from "@/components/notification";

function ChatPage() {
  return (
    <div className="w-full h-full overflow-auto" id="scrollableDiv">
      <Chat />
      <Calls />
      <Notification />
      <MyNetwork />
    </div>
  );
}

export default ChatPage;