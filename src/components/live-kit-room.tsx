"use client";

import { useEffect, type ReactNode } from "react";
import UserAvatar from "./avatar";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-core";
import {
  isTrackReference,
  LiveKitRoom,
  RoomAudioRenderer,
  useConnectionState,
  useParticipants,
  useTracks,
  VideoTrack,
  setLogLevel,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";
import { useCallRNDState } from "@/store/use-call-rnd";
import { toast } from "sonner";

type CallUserInfo = {
  name: string | null;
  avatar: string | null;
};

type LiveKitCallRoomProps = {
  children: ReactNode;
  minimized: boolean;
  onConversationConnected: () => void;
  statusText: string;
  userInfo: CallUserInfo;
};

setLogLevel("silent", { liveKitClientLogLevel: "silent" });
function ConnectionBadge() {
  const connectionState = useConnectionState();
  const participants = useParticipants();

  const isConnected = connectionState === ConnectionState.Connected;
  const label = isConnected
    ? `${participants.length - 1} connected`
    : connectionState.replace(/([A-Z])/g, " $1").toLowerCase();

  return (
    <div className="absolute left-3 top-3 z-10 flex items-center justify-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm ring-1 ring-border backdrop-blur">
      <span
        className={`size-2 rounded-full ${
          isConnected ? "bg-green-500" : "bg-yellow-500"
        }`}
      />
      {label}
    </div>
  );
}

function CallTimerBadge({ statusText }: { statusText: string }) {
  if (statusText.startsWith("Con")) return;

  return (
    <div className="absolute right-3 top-3 z-10 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold tabular-nums text-foreground shadow-sm ring-1 ring-border backdrop-blur">
      {statusText}
    </div>
  );
}

function AudioCallStage({
  statusText,
  userInfo,
}: {
  statusText: string;
  userInfo: CallUserInfo;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-4 bg-muted m-1 rounded-lg border">
      <ConnectionBadge />
      <CallTimerBadge statusText={statusText} />
      <UserAvatar
        className="min-w-30 min-h-30"
        src={userInfo.avatar}
        alt="avatar"
      />
      <p className="text-xl dark:text-white/90 font-semibold">
        {userInfo.name}
      </p>
    </div>
  );
}

function WaitingCallStage({
  statusText,
  userInfo,
}: {
  statusText: string;
  userInfo: CallUserInfo;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-4 bg-muted m-1 rounded-lg border">
      <UserAvatar
        className="min-w-30 min-h-30"
        src={userInfo.avatar}
        alt="avatar"
      />
      <p className="text-xl dark:text-white/90 font-semibold">
        {userInfo.name}
      </p>
      <p className="text-sm font-medium text-muted-foreground">{statusText}</p>
    </div>
  );
}

function ParticipantVideoTile({
  trackRef,
  userInfo,
  featured,
}: {
  trackRef: TrackReferenceOrPlaceholder;
  userInfo: CallUserInfo;
  featured: boolean;
}) {
  const hasVideo = isTrackReference(trackRef);
  const name = trackRef.participant.isLocal ? "You" : userInfo.name;
  const isScreenShare = trackRef.source === Track.Source.ScreenShare;

  return (
    <div
      className={`relative min-h-0 overflow-hidden rounded-md border bg-muted ${
        featured ? "col-span-full row-span-2" : ""
      }`}
    >
      {hasVideo ? (
        <VideoTrack
          trackRef={trackRef}
          className={`h-full w-full bg-black ${
            isScreenShare ? "object-contain" : "object-cover"
          }`}
        />
      ) : (
        <div className="flex h-full min-h-44 flex-col items-center justify-center gap-3">
          <UserAvatar
            className="min-w-20 min-h-20"
            src={trackRef.participant.isLocal ? null : userInfo.avatar}
            alt="avatar"
          />
          <p className="text-sm font-medium text-muted-foreground">
            Camera off
          </p>
        </div>
      )}
      <div className="absolute bottom-2 left-2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm ring-1 ring-border backdrop-blur">
        {isScreenShare ? `${name ?? "Participant"}'s screen` : name}
      </div>
    </div>
  );
}

function VideoCallStage({
  statusText,
  userInfo,
}: {
  statusText: string;
  userInfo: CallUserInfo;
}) {
  const tracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
    { source: Track.Source.Camera, withPlaceholder: true },
  ]);
  const screenShareTracks = tracks.filter(
    (trackRef) => trackRef.source === Track.Source.ScreenShare,
  );
  const cameraTracks = tracks.filter(
    (trackRef) => trackRef.source === Track.Source.Camera,
  );
  const visibleTracks = screenShareTracks.length
    ? screenShareTracks
    : cameraTracks;

  return (
    <div className="relative flex flex-1 min-h-0 flex-col bg-muted m-1 rounded-lg border">
      <ConnectionBadge />
      <CallTimerBadge statusText={statusText} />
      {visibleTracks.length ? (
        <div
          className={`grid flex-1 min-h-0 gap-2 p-2 ${
            visibleTracks.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {visibleTracks.map((trackRef, index) => (
            <ParticipantVideoTile
              key={`${trackRef.participant.identity}-${trackRef.source}`}
              trackRef={trackRef}
              userInfo={userInfo}
              featured={screenShareTracks.length > 0 && index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm font-medium text-muted-foreground">
          {statusText}
        </div>
      )}
    </div>
  );
}

function CallStage({
  minimized,
  statusText,
  userInfo,
}: {
  minimized: boolean;
  statusText: string;
  userInfo: CallUserInfo;
}) {
  const callType = useCallRNDState((state) => state.callType);
  const tracks = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);
  const hasScreenShare = tracks.length > 0;

  if (minimized) return null;

  if (callType === "video" || hasScreenShare) {
    return <VideoCallStage statusText={statusText} userInfo={userInfo} />;
  }

  return <AudioCallStage statusText={statusText} userInfo={userInfo} />;
}

function ConversationConnectionWatcher({
  onConversationConnected,
}: {
  onConversationConnected: () => void;
}) {
  const connectionState = useConnectionState();
  const participants = useParticipants();
  const remoteParticipantsCount = participants.filter(
    (participant) => !participant.isLocal,
  ).length;

  useEffect(() => {
    if (
      connectionState === ConnectionState.Connected &&
      remoteParticipantsCount > 0
    ) {
      onConversationConnected();
    }
  }, [connectionState, remoteParticipantsCount, onConversationConnected]);

  return null;
}

function LiveKitCallRoom({
  children,
  minimized,
  onConversationConnected,
  statusText,
  userInfo,
}: LiveKitCallRoomProps) {
  const token = useCallRNDState((state) => state.token);
  const callType = useCallRNDState((state) => state.callType);
  const setDisableCallRND = useCallRNDState((state) => state.setDisableCallRND);

  if (!token) {
    return (
      <div className="flex flex-1 min-h-0 flex-col">
        {!minimized && (
          <WaitingCallStage statusText={statusText} userInfo={userInfo} />
        )}
        {children}
      </div>
    );
  }

  return (
    <LiveKitRoom
      className="flex flex-1 min-h-0 flex-col"
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      video={callType === "video"}
      audio={true}
      onError={(error: any) => {
        toast.error(error.message);
        setDisableCallRND();
      }}
    >
      <ConversationConnectionWatcher
        onConversationConnected={onConversationConnected}
      />
      <CallStage
        minimized={minimized}
        statusText={statusText}
        userInfo={userInfo}
      />
      <RoomAudioRenderer />
      {children}
    </LiveKitRoom>
  );
}

export default LiveKitCallRoom;
