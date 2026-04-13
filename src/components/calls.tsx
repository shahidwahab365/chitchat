"use client";
import "@livekit/components-styles";
import { TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import CallRND from "./call-rnd";

function Calls() {
  return (
    <TabsContent value="call" className="h-full p-0">
      <Button type="button" variant={"ghost"}>
        open
      </Button>

      <CallRND />
     
    </TabsContent>
  );
}

export default Calls;
