import { create } from "zustand";

type CallRNDType = {
  isShowCallRND: boolean;
  callType: "video" | "audio" | null;
  setEnableCallRND: (type: "video" | "audio") => void;
  setDisableCallRND: () => void;
};

export const useCallRNDState = create<CallRNDType>((set) => ({
  isShowCallRND: false,
  callType: null,
  setEnableCallRND: (type) => {
    set(() => ({
      isShowCallRND: true,
      callType: type,
    }));
  },
  setDisableCallRND: () => {
    set(() => ({
      isShowCallRND: false,
      callType: null,
    }));
  },
}));
