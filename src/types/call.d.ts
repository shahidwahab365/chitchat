export interface Call {
  id: number;
  call_type: "video" | "audio";
  status: "ringing" | "ongoing" | "ended" | "missed" | "rejected" | "ingoing";
  started_at: Date | number;
  ended_at: Date | number;
  duration: number;
  is_deleted?: boolean;
  caller_id?: number;
  call_mode: "direct" | "group";
  created_at: Date | number;
  callee_id: string;
}
