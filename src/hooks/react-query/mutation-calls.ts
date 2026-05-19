import { useSupabase } from "@/providers/supabase-provider";
import {
  insertCall,
  sendCallSignal,
  updateCall,
  updateIsInCall,
} from "@/services/call.service";
import { useCallRNDState } from "@/store/use-call-rnd";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSendCallSignal = ({
  callee_id,
  setIsRinging,
}: {
  callee_id?: string;
  setIsRinging: (v: boolean) => void;
}) => {
  const supabase = useSupabase();
  const { user } = useUser();
  const setDisableCallRND = useCallRNDState((state) => state.setDisableCallRND);
  const updateLiveKitInfo = useCallRNDState((state) => state.updateLiveKitInfo);
  const client = useQueryClient();

  return useMutation({
    mutationKey: ["send-call-signal", callee_id],
    mutationFn: async ({
      calleeId,
      callType,
      call_status,
      room_name,
    }: {
      calleeId: string;
      callType: "audio" | "video";
      call_status: "ringing" | "close" | "missed" | "accepted";
      room_name?: string | null;
    }) => {
      return await sendCallSignal(supabase, {
        user_id: user?.id!,
        callee_id: calleeId,
        caller_id: user?.id!,
        call_type: callType,
        call_mode: "direct",
        call_status,
        room_name,
      });
    },
    onSuccess: (res: any, variables) => {
      const { roomName } = res;
      
      if (variables.call_status === "ringing") {
        updateLiveKitInfo({ roomName, token: null });
      }
      setIsRinging(variables.call_status === "ringing");
      if (variables.call_status === "close") {
        client.invalidateQueries({
          queryKey: ["get-calls", user?.id],
        });
      }
    },
    onError: (error) => {
      toast.error(error.message);
      setDisableCallRND();
    },
  });
};

export const useUpdateIsInCall = () => {
  const supabase = useSupabase();
  const { user } = useUser();

  return useMutation({
    mutationKey: ["update-is-in-call"],
    mutationFn: async ({ is_in_call }: { is_in_call: boolean }) => {
      return await updateIsInCall(supabase, { user_id: user?.id!, is_in_call });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useInsertCall = () => {
  const supabase = useSupabase();
  return useMutation({
    mutationKey: ["insert-call"],
    mutationFn: async ({
      call_type,
      caller_id,
      callee_id,
      call_mode,
      status,
    }: {
      call_type?: "video" | "audio";
      group_id?: string;
      caller_id: string;
      callee_id: string;
      call_mode: "group" | "direct";
      status: "ingoing" | "outgoing" | "missed" | "rejected";
    }) => {
      return await insertCall(supabase, {
        call_type,
        caller_id,
        callee_id,
        call_mode,
        status,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateCall = () => {
  const supabase = useSupabase();
  return useMutation({
    mutationKey: ["update-call"],
    mutationFn: async ({
      caller_id,
      call_status,
    }: {
      caller_id: string;
      call_status: "ingoing" | "outgoing" | "missed";
    }) => {
      return await updateCall(supabase, { caller_id, call_status });
    },
    onError: (error) => {
      throw new Error(error.message);
    },
  });
};
