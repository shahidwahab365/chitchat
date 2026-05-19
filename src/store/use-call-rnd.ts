import { create } from "zustand";

type CallRNDType = {
  roomName: string | null;
  token: string | null;
  isShowCallRND: boolean;
  callType: "video" | "audio" | null;
  callMode: "direct" | "group" | null;
  setEnableCallRND: ({
    type,
    callee_id,
    callMode,
    callDirection,
    caller_id,
    call_status,
  }: {
    type: "video" | "audio";
    callee_id: string;
    callMode: "direct" | "group" | null;
    callDirection: "ingoing" | "outgoing" | null;
    caller_id?: string | null;
    call_status?: "ringing" | "close" | "missed" | "accepted" | null;
  }) => void;
  updateLiveKitInfo: ({
    roomName,
    token,
  }: {
    roomName: string | null;
    token: string | null;
  }) => void;
  updateCallStatus: ({
    call_status,
  }: {
    call_status: "ringing" | "close" | "missed" | "accepted";
  }) => void;
  setDisableCallRND: () => void;
  callee_id: string | null;
  callDirection: "ingoing" | "outgoing" | null;
  caller_id?: string | null;
  call_status: "ringing" | "close" | "missed" | "accepted" | null;
};

export const useCallRNDState = create<CallRNDType>((set) => ({
  isShowCallRND: false,
  callType: null,
  callee_id: null,
  callMode: null,
  callDirection: null,
  caller_id: null,
  call_status: null,
  roomName: null,
  token: null,
  setEnableCallRND: ({
    type,
    callee_id,
    callMode,
    callDirection,
    caller_id,
    call_status,
  }) => {
    set(() => ({
      isShowCallRND: true,
      callType: type,
      callee_id,
      callMode,
      callDirection,
      caller_id,
      call_status,
    }));
  },
  updateLiveKitInfo: ({
    roomName,
    token,
  }: {
    roomName: string | null;
    token: string | null;
  }) => set(() => ({ roomName, token })),
  updateCallStatus: ({
    call_status,
  }: {
    call_status: "ringing" | "close" | "missed" | "accepted";
  }) => set(() => ({ call_status })),
  setDisableCallRND: () => {
    set(() => ({
      isShowCallRND: false,
      callType: null,
      callee_id: null,
      callMode: null,
      callDirection: null,
      caller_id: null,
      call_status: null,
      token: null,
      roomName: null,
    }));
  },
}));
