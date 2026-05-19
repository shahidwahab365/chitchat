import { API } from "@/constants/routes";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getLiveKitToken({
  RN = "",
}: {
  RN?: string | null;
}): Promise<{
  token: string;
  roomName: string;
} | null> {
  const res = await fetch(API.LIVE_KIT, {
    method: "POST",
    body: JSON.stringify({ roomName: RN }),
  });

  if (!res) return null;

  const { token, roomName } = await res?.json();

  return { token, roomName };
}

export async function insertCall(
  supabase: SupabaseClient,
  {
    call_type,
    caller_id,
    callee_id,
    call_mode,
    status,
    room_name,
  }: {
    call_type?: "video" | "audio";
    caller_id: string;
    callee_id: string;
    call_mode: "group" | "direct";
    status: "ingoing" | "outgoing" | "missed" | "rejected";
    room_name?: string | null;
  },
) {
  const created_at = new Date().toISOString();

  const { data: callData, error: callError } = await supabase
    .from("calls")
    .insert({
      created_at,
      call_type,
      status,
      caller_id,
      call_mode,
      callee_id,
      room_name,
    })
    .select()
    .single();

  if (callError) throw new Error(`Failed to create call: ${callError.message}`);

  return callData;
}

export async function updateCall(
  supabase: SupabaseClient,
  {
    caller_id,
    call_status,
  }: { caller_id: string; call_status: "ingoing" | "outgoing" | "missed" },
) {
  try {
    await supabase
      .from("calls")
      .update({ status: call_status })
      .eq("caller_id", caller_id)
      .eq("is_deleted", false);

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function sendCallSignal(
  supabase: SupabaseClient,
  {
    user_id,
    callee_id,
    call_type,
    caller_id,
    call_mode,
    call_status,
    room_name,
  }: {
    user_id: string;
    callee_id: string;
    call_type: "audio" | "video";
    caller_id: string;
    call_mode: "direct" | "group";
    call_status: "ringing" | "close" | "missed" | "accepted";
    room_name?: string | null;
  },
) {
  try {
    const { data, error } = await supabase
      .from("contacts")
      .select("user_id, contact_user_id, status, is_deleted")
      .eq("user_id", caller_id)
      .eq("contact_user_id", callee_id)
      .eq("status", "accepted")
      .eq("is_deleted", false)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Calls are allowed for contacts only.");
    }

    if (call_status === "ringing") {
      const { error: is_in_call_error, data: is_in_call_data } = await supabase
        .from("users_public")
        .select("user_id, is_in_call")
        .eq("user_id", callee_id);

      if (is_in_call_error) throw new Error(is_in_call_error.message);
      if (is_in_call_data[0].is_in_call)
        throw new Error("The user is busy on another call.");
    }

    const callChannel = supabase.channel(`incomming-call:${callee_id}`, {
      config: { private: false },
    });

    let roomName = room_name ?? null;
    let token = null;

    if (call_status === "ringing") {
      const result = await getLiveKitToken({ RN: roomName });
      if (!result) {
        throw new Error("Failed to create a call session");
      }

      const { token: TN, roomName: RN } = result;
      roomName = RN;
      token = TN;
    }

    const [, channel_Res] = await Promise.all([
      supabase
        .from("users")
        .update({ is_in_call: call_status === "close" ? false : true })
        .eq("user_id", user_id),

      callChannel.send({
        type: "broadcast",
        event: "CALL",
        payload: {
          caller_id,
          call_type,
          callDirection: "outgoing",
          call_mode,
          call_status,
          roomName,
        },
      }),
    ]).catch((error: any) => {
      throw new Error(error.message);
    });

    if (call_status === "ringing") {
      await insertCall(supabase, {
        call_type,
        caller_id,
        callee_id,
        call_mode,
        status: "outgoing",
        room_name: roomName!,
      });
    }

    return { channel_Res, token, roomName };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
export async function updateIsInCall(
  supabase: SupabaseClient,
  { user_id, is_in_call }: { user_id: string; is_in_call: boolean },
) {
  try {
    await supabase.from("users").update({ is_in_call }).eq("user_id", user_id);

    return true;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getCalls(
  supabase: SupabaseClient,
  { userId }: { userId: string },
) {
  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .eq("is_deleted", false)
    .or(`caller_id.eq.${userId},callee_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) console.log(error);
  if (error) throw new Error(error.message);

  return data;
}
