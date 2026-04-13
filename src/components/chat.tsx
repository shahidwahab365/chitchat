"use client";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatTabSidebar from "@/components/chat-tab-sidebar";
import { TabsContent } from "@radix-ui/react-tabs";
import { Tabs } from "./ui/tabs";
import { useState } from "react";
import ChatForm from "./chat-form";
import ChatAreaHeader from "./chat-area-header";
import { useGetContacts } from "@/hooks/react-query/query-contact";
import ChatsMain from "./chats-main";

export type UploadProgress = {
  fileName: string;
  percentage: number;
};

function Chat() {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);
  const [activeTab, setActiveTab] = useState<string>("empty");
  const { data, error, isLoading } = useGetContacts();
  const [percentage, setPercentage] = useState<UploadProgress[] | null>(null);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-medium">Failed to load contacts</h2>
          <p className="text-sm">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <TabsContent value="chat" className="w-full h-full">
      <Tabs
        className="w-full h-full"
        value={activeTab}
        defaultValue="empty"
        onValueChange={setActiveTab}
      >
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ChatTabSidebar contacts={data} loading={isLoading} />
          <ResizableHandle withHandle />
          <ResizablePanel>
            <TabsContent value="empty" className="h-full">
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center space-y-2">
                  <h2 className="text-lg font-medium">No chat selected</h2>
                  <p className="text-sm">
                    Select a conversation to start chatting
                  </p>
                </div>
              </div>
            </TabsContent>

            {data?.map((contact: any, index: number) => (
              <TabsContent
                value={contact.id}
                key={index}
                className="w-full h-full flex flex-col"
              >
                <ChatAreaHeader contact={contact} setActiveTab={setActiveTab} />

                <ChatsMain
                  setSelectedFiles={setSelectedFiles}
                  open={open}
                  selectedFiles={selectedFiles}
                  setOpen={setOpen}
                  recipient_id={contact.contact_user_id}
                  percentage={percentage}
                />

                <ChatForm
                  setPercentage={(fileName: string, percentage: number) =>
                    setPercentage([{ fileName, percentage }])
                  }
                  open={open}
                  setSelectedFiles={setSelectedFiles}
                  setOpen={setOpen}
                  recipient_id={contact.contact_user_id}
                  selectedFiles={selectedFiles}
                />
              </TabsContent>
            ))}
          </ResizablePanel>
        </ResizablePanelGroup>
      </Tabs>
    </TabsContent>
  );
}

export default Chat;
