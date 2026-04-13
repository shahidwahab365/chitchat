export interface IMessages {
  id: string;
  sender_id: string;
  recipient_id: string;
  message_type:
    | "text"
    | "image"
    | "video"
    | "audio"
    | "file"
    | "text-image"
    | "text-video"
    | "text-audio"
    | "text-file"
    | "text-image-file"
    | "image-file"
    | "voice_note";
  content: string;
  file_name?: string[] | File[];
  file_size?: string[];
  duration?: number;
  reply_to_message_id?: string;
  is_edited: boolean;
  message_read_status: "sent" | "delivered" | "read";
  created_at?: string;
}
