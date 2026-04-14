"use client";
import "@livekit/components-styles";
import { TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import CallRND from "./call-rnd";
import { useState } from "react";

function Calls() {
  const [isEnable, setIsEnable] = useState<boolean>(false);

  return (
    <TabsContent value="call" className="h-full p-0">
      <Button type="button" variant={"ghost"} onClick={() => setIsEnable((prev: boolean) => !prev)}>
        open
      </Button>

      {isEnable && <CallRND /> }
     
    </TabsContent>
  );
}

export default Calls;
