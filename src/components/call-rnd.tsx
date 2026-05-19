"use client";
import { Rnd } from "react-rnd";
import { Button } from "./ui/button";
import {
  Mic,
  MicOff,
  Minus,
  Phone,
  PhoneCall,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Square,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import {
  type ButtonHTMLAttributes,
  type ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useCallRNDState } from "@/store/use-call-rnd";
import {
  useSendCallSignal,
  useUpdateIsInCall,
} from "@/hooks/react-query/mutation-calls";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Logo from "./logo";
import { SOUNDS } from "@/constants/sounds";
import { getLiveKitToken } from "@/services/call.service";
import LiveKitCallRoom from "./live-kit-room";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMaybeRoomContext, useTrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";
import { cn } from "@/lib/utils";

function formatCallDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }

  return `${formattedMinutes}:${formattedSeconds}`;
}

function RNDHeader({
  rndRef,
  setMinimized,
  sendCallSignal,
  callee_id,
  call_type,
}: {
  rndRef: RefObject<any>;
  setMinimized: (e: boolean) => void;
  callee_id: string;
  call_type: "video" | "audio" | null;
  sendCallSignal: ({
    calleeId,
    callType,
    call_status,
    room_name,
  }: {
    calleeId: string;
    callType: "audio" | "video";
    call_status: "ringing" | "close";
    room_name: string | null;
  }) => void;
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
      <Logo className="w-18" />
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant={"ghost"}
              className="text-muted-foreground hover:text-foreground cursor-pointer w-fit h-fit"
              type="button"
            >
              <X className="size-4" strokeWidth={1.89} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="z-100">
            <AlertDialogHeader>
              <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                <PhoneCall strokeWidth={1.89} size={4} />
              </AlertDialogMedia>
              <AlertDialogTitle>End call?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to end the call? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer" variant="outline">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="cursor-pointer"
                variant="destructive"
                onClick={() => {
                  sendCallSignal({
                    calleeId: callee_id,
                    callType: call_type!,
                    call_status: "close",
                    room_name: null,
                  });
                  setTimeout(() => {
                    setDisableCallRND();
                  }, 500);
                }}
              >
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
function RNDFooter({
  sendCallSignal,
  callee_id,
  call_type,
  call_direction,
  call_status,
  room_name,
}: {
  call_direction: "ingoing" | "outgoing";
  callee_id: string;
  call_type: "video" | "audio" | null;
  call_status: "ringing" | "close" | "missed" | "accepted" | null;
  room_name: string | null;
  sendCallSignal: ({
    calleeId,
    callType,
    call_status,
    room_name,
  }: {
    calleeId: string;
    callType: "audio" | "video";
    call_status: "ringing" | "close" | "missed" | "accepted";
    room_name?: string | null;
  }) => void;
}) {
  const room = useMaybeRoomContext();
  const micToggle = useTrackToggle({ source: Track.Source.Microphone });
  const cameraToggle = useTrackToggle({ source: Track.Source.Camera });
  const screenShareToggle = useTrackToggle({
    source: Track.Source.ScreenShare,
  });
  const setDisableCallRND = useCallRNDState().setDisableCallRND;
  const updateCallStatus = useCallRNDState().updateCallStatus;

  const isAccepted = call_status === "accepted";
  const canControlMedia = Boolean(room && isAccepted);
  const canUseCamera = canControlMedia && call_type === "video";

  const handleCloseCall = () => {
    room?.disconnect();
    sendCallSignal({
      calleeId: callee_id,
      callType: call_type!,
      call_status: "close",
    });
    setTimeout(() => {
      setDisableCallRND();
    }, 500);
  };

  const renderControlButton = ({
    label,
    activeLabel,
    enabled,
    disabled,
    buttonProps,
    children,
  }: {
    label: string;
    activeLabel: string;
    enabled: boolean;
    disabled: boolean;
    buttonProps: ButtonHTMLAttributes<HTMLButtonElement>;
    children: ReactNode;
  }) => {
    const {
      className,
      disabled: liveKitDisabled,
      ...restButtonProps
    } = buttonProps;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            {...restButtonProps}
            aria-label={enabled ? activeLabel : label}
            className={cn(
              "cursor-pointer rounded-full w-15",
              !enabled &&
                "bg-destructive/10 text-destructive hover:bg-destructive/15",
              className,
            )}
            disabled={disabled || liveKitDisabled}
            type="button"
            variant={"secondary"}
          >
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{enabled ? activeLabel : label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="flex items-center justify-center gap-2 p-1">
      {renderControlButton({
        label: "Unmute microphone",
        activeLabel: "Mute microphone",
        enabled: micToggle.enabled,
        disabled: !canControlMedia,
        buttonProps: micToggle.buttonProps,
        children: micToggle.enabled ? (
          <Mic className="size-5" strokeWidth={1.89} />
        ) : (
          <MicOff className="size-5" strokeWidth={1.89} />
        ),
      })}
      {renderControlButton({
        label: "Turn camera on",
        activeLabel: "Turn camera off",
        enabled: cameraToggle.enabled,
        disabled: !canUseCamera,
        buttonProps: cameraToggle.buttonProps,
        children: cameraToggle.enabled ? (
          <Video className="size-5" strokeWidth={1.89} />
        ) : (
          <VideoOff className="size-5" strokeWidth={1.89} />
        ),
      })}
      {renderControlButton({
        label: "Share screen",
        activeLabel: "Stop sharing",
        enabled: screenShareToggle.enabled,
        disabled: !canControlMedia,
        buttonProps: screenShareToggle.buttonProps,
        children: screenShareToggle.enabled ? (
          <ScreenShareOff className="size-5" strokeWidth={1.89} />
        ) : (
          <ScreenShare className="size-5" strokeWidth={1.89} />
        ),
      })}
      {call_direction === "ingoing" && !isAccepted && (
        <Button
          className="cursor-pointer bg-green-500 text-white hover:bg-green-600 rounded-full min-w-23"
          type="button"
          variant={"default"}
          onClick={() => {
            sendCallSignal({
              calleeId: callee_id,
              callType: call_type!,
              call_status: "accepted",
              room_name,
            });
            updateCallStatus({ call_status: "accepted" });
          }}
        >
          <Phone className="size-5 rotate-135" strokeWidth={1.89} />
        </Button>
      )}
      <Button
        className="cursor-pointer bg-red-500  text-white hover:bg-destructive rounded-full w-23"
        type="button"
        variant={"default"}
        onClick={handleCloseCall}
      >
        <PhoneOff className="size-5" strokeWidth={1.89} />
      </Button>
    </div>
  );
}

function CallRND() {
  const callBeepAudio = useRef(new Audio(SOUNDS.BEEP));
  const [counter, setCounter] = useState<number>(0);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [hasConversationStarted, setHasConversationStarted] =
    useState<boolean>(false);
  const [isRinging, setIsRinging] = useState<boolean>(false);
  const client = useQueryClient();
  const callee_id = useCallRNDState((state) => state.callee_id) as string;
  const caller_id = useCallRNDState((state) => state.caller_id) as
    | string
    | null;
  const callType = useCallRNDState((state) => state.callType);
  const callDirection = useCallRNDState((state) => state.callDirection);
  const { mutate: sendCallSignal } = useSendCallSignal({
    callee_id,
    setIsRinging,
  });
  const { user } = useUser();
  const rndRef = useRef(null);
  const [minimized, setMinimized] = useState<boolean>(false);
  const setDisableCallRND = useCallRNDState((state) => state.setDisableCallRND);
  const call_status = useCallRNDState((state) => state.call_status);
  const { mutate: updateIsInCall } = useUpdateIsInCall();
  const updateCallStatus = useCallRNDState((state) => state.updateCallStatus);
  const updateLiveKitInfo = useCallRNDState((state) => state.updateLiveKitInfo);
  const roomName = useCallRNDState((state) => state.roomName);
  const token = useCallRNDState((state) => state.token);
  const outgoingRingSignalKeyRef = useRef<string | null>(null);
  const width = window.innerWidth - 550;
  const height = window.innerHeight - 150;
  const isWaitingForAnswer = isRinging && call_status === "ringing";
  const isCallAccepted = call_status === "accepted";
  const callStatusText = hasConversationStarted
    ? formatCallDuration(callDuration)
    : isCallAccepted
      ? "Connecting..."
      : callDirection === "outgoing"
        ? isWaitingForAnswer
          ? "Ringing..."
          : "Calling..."
        : callType === "audio"
          ? "Voice call"
          : "Video call";

  const user_info = (() => {
    if (
      (callDirection === "ingoing" && caller_id) ||
      (callDirection === "outgoing" && callee_id)
    ) {
      const contacts: any = client.getQueryData(["get-contacts", user?.id]);
      const res = contacts?.find(
        (c: any) =>
          c.contact_user_id ===
            (callDirection === "ingoing" ? caller_id : callee_id) &&
          c.status === "accepted" &&
          !c.is_deleted,
      );
      return {
        name: res?.info.full_name ?? null,
        avatar: res?.info.avatar_url ?? null,
      };
    }
    return { name: null, avatar: null };
  })();

  useEffect(() => {
    if (call_status === "close") {
      setTimeout(() => {
        updateIsInCall({ is_in_call: false });
        setDisableCallRND();
      }, 2000);
    }
  }, [call_status, setDisableCallRND, updateIsInCall]);

  useEffect(() => {
    if (!isWaitingForAnswer) return;

    if (counter >= 20) {
      updateIsInCall({ is_in_call: false });
      setDisableCallRND();
      return;
    }

    const timer = setTimeout(() => {
      setCounter((prev) => prev + 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    counter,
    isWaitingForAnswer,
    setDisableCallRND,
    updateIsInCall,
    caller_id,
    user,
  ]);

  useEffect(() => {
    if (!isWaitingForAnswer || callDirection !== "outgoing") return;

    const interval = setInterval(() => {
      callBeepAudio.current.pause();
      callBeepAudio.current.currentTime = 0;
      callBeepAudio.current.volume = 1;
      callBeepAudio.current.play();
    }, 2000);

    return () => clearInterval(interval);
  }, [isWaitingForAnswer, callDirection]);

  const handleConversationConnected = useCallback(() => {
    setHasConversationStarted(true);
  }, []);

  useEffect(() => {
    if (!hasConversationStarted) return;

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [hasConversationStarted]);

  useEffect(() => {
    if (roomName?.length && call_status === "accepted") {

      if (roomName.length && token?.length) {
        return;
      }

      async function getToken() {
        const result = await getLiveKitToken({ RN: roomName });
        if (!result) {
          setCounter(20);
          return;
        }

        updateLiveKitInfo({ roomName, token: result.token });
      }
      getToken();
    }
  }, [roomName, updateLiveKitInfo, call_status, token]);

  useEffect(() => {
    if (callDirection === "ingoing") return;
    if (!callType || !callee_id) return;

    
    const signalKey = `${callee_id}:${callType}`;
    if (outgoingRingSignalKeyRef.current === signalKey) return;
    outgoingRingSignalKeyRef.current = signalKey;

    updateCallStatus({ call_status: "ringing" });
    sendCallSignal({ calleeId: callee_id, callType, call_status: "ringing" });
  }, [callType, callee_id, callDirection, sendCallSignal, updateCallStatus]);

  return (
    <Rnd
      default={{ x: 300, y: 100, width, height }}
      minWidth={420}
      minHeight={minimized ? 70 : 400}
      ref={rndRef}
      onDrag={() => setMinimized(false)}
      onResize={() => setMinimized(false)}
      bounds="window"
      className="bg-card text-card-foreground border border-border rounded-lg shadow-xl overflow-hidden z-60"
    >
      <div className="flex flex-col h-full w-full">
        <RNDHeader
          call_type={callType}
          callee_id={callDirection === "ingoing" ? caller_id! : callee_id}
          sendCallSignal={sendCallSignal}
          rndRef={rndRef}
          setMinimized={setMinimized}
        />
        <LiveKitCallRoom
          minimized={minimized}
          onConversationConnected={handleConversationConnected}
          statusText={callStatusText}
          userInfo={user_info}
        >
          <RNDFooter
            call_direction={callDirection ?? "outgoing"}
            call_type={callType}
            call_status={call_status}
            room_name={roomName}
            callee_id={callDirection === "ingoing" ? caller_id! : callee_id}
            sendCallSignal={sendCallSignal}
          />
        </LiveKitCallRoom>
      </div>
    </Rnd>
  );
}

export default CallRND;
