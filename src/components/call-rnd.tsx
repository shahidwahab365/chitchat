import { Rnd } from "react-rnd";
import { Button } from "./ui/button";
import { Mic, Minus, Phone, ScreenShare, Square, Video, X } from "lucide-react";
import { RefObject, useRef, useState } from "react";
import { useCallRNDState } from "@/store/use-call-rnd";

function RNDHeader({
  rndRef,
  setMinimized,
}: {
  rndRef: RefObject<any>;
  setMinimized: (e: boolean) => void;
}) {
  const [isMaximized, setIsMaximized] = useState(false);
  const setDisableCallRND = useCallRNDState().setDisableCallRND;

  const handleMaximize = () => {
    if (!rndRef.current) return;

    if (!isMaximized) {
      rndRef.current.updateSize({
        width: "100vw",
        height: "100vh",
      });
      rndRef.current.updatePosition({ x: 0, y: 0 });
    } else {
      rndRef.current.updateSize({
        width: 360,
        height: 520,
      });
      rndRef.current.updatePosition({ x: 100, y: 100 });
    }

    setIsMaximized(!isMaximized);
    setMinimized(false);
  };

  const handleMinimize = () => {
    if (!rndRef.current) return;

    setMinimized(true);

    const width = 200;
    const height = 90;

    const x = window.innerWidth - width - 160;
    const y = window.innerHeight - height;

    rndRef.current.updateSize({
      width,
      height,
    });

    rndRef.current.updatePosition({ x, y });
  };

  return (
    <div className="flex items-center justify-between px-4 py-1">
      <span className="text-sm font-medium">Calling...</span>
      <div className="flex items-center justify-center gap-3">
        <Button
          onClick={handleMinimize}
          variant={"ghost"}
          className="text-muted-foreground hover:text-foreground cursor-pointer w-fit h-fit"
          type="button"
        >
          <Minus className="size-4" strokeWidth={1.89} />
        </Button>
        <Button
          onClick={handleMaximize}
          variant={"ghost"}
          className="text-muted-foreground hover:text-foreground cursor-pointer w-fit h-fit"
          type="button"
        >
          <Square className="size-4" strokeWidth={1.89} />
        </Button>
        <Button
          variant={"ghost"}
          className="text-muted-foreground hover:text-foreground cursor-pointer w-fit h-fit"
          type="button"
          onClick={setDisableCallRND}
        >
          <X className="size-4" strokeWidth={1.89} />
        </Button>
      </div>
    </div>
  );
}
function RNDFooter() {
  const setDisableCallRND = useCallRNDState().setDisableCallRND;
  return (
    <div className="flex items-center justify-center gap-2 p-1">
      <Button
        className="cursor-pointer rounded-full w-15"
        type="button"
        variant={"secondary"}
      >
        <Video className="size-5" strokeWidth={1.89} />
      </Button>
      <Button
        className="cursor-pointer rounded-full w-15"
        type="button"
        variant={"secondary"}
      >
        <Mic className="size-5" strokeWidth={1.89} />
      </Button>
      <Button
        className="cursor-pointer rounded-full w-15"
        type="button"
        variant={"secondary"}
      >
        <ScreenShare className="size-5" strokeWidth={1.89} />
      </Button>
      <Button
        className="cursor-pointer bg-red-500  text-white hover:bg-destructive rounded-full w-25"
        type="button"
        variant={"default"}
        onClick={setDisableCallRND}
      >
        <Phone className="size-5 rotate-135" strokeWidth={1.89} />
      </Button>
    </div>
  );
}

function CallRND() {
  const rndRef = useRef(null);
  const [minimized, setMinimized] = useState<boolean>(false);

  const width = window.innerWidth - 500;
  const height = window.innerHeight - 150;

  return (
    <Rnd
      default={{ x: 300, y: 100, width, height }}
      minWidth={360}
      minHeight={minimized ? 70 : 400}
      ref={rndRef}
      onDrag={() => setMinimized(false)}
      onResize={() => setMinimized(false)}
      bounds="window"
      className="bg-card text-card-foreground border border-border rounded-lg shadow-xl overflow-hidden z-60"
    >
      <div className="flex flex-col h-full w-full">
        <RNDHeader rndRef={rndRef} setMinimized={setMinimized} />

        {!minimized && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-muted m-1 rounded-lg"></div>
        )}

        <RNDFooter />
      </div>
    </Rnd>
  );
}

export default CallRND;
