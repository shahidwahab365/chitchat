import { ENV } from "@/constants/env-exports";
import { IMessages } from "@/types/messages";
import { PaginationType } from "@/types/pagination";
import { ISendMessageProps } from "@/types/send-message-props";
import { SupabaseClient } from "@supabase/supabase-js";

export async function sendMessage(
  supabase: SupabaseClient,
  {
    sender_id,
    message_type,
    content,
    file_name,
    file_size,
    duration,
    reply_to_message_id,
    recipient_id,
  }: ISendMessageProps,
) {
  try {
    const { data, error } = await supabase.from("messages").insert([
      {
        sender_id,
        message_type,
        content,
        file_name,
        file_size,
        duration,
        reply_to_message_id,
        recipient_id,
      },
    ]);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getMessages(
  supabase: SupabaseClient,
  {
    user_id,
    recipient_id,
    limit,
    page,
  }: { user_id: string; recipient_id: string; limit: number; page: number },
): Promise<{
  data: IMessages[];
  pagination: PaginationType;
}> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("messages")
      .select(
        "id, sender_id, recipient_id, message_type, content, file_name, file_size, duration, reply_to_message_id, is_edited, message_read_status, created_at",
        {
          count: "exact",
        },
      )
      .or(
        `and(sender_id.eq.${user_id},recipient_id.eq.${recipient_id}),and(sender_id.eq.${recipient_id},recipient_id.eq.${user_id})`,
      )
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data ?? [],
      pagination: {
        total,
        totalPages,
        hasNextPage: totalPages > page,
        hasPreviousPage: page > 1,
        page,
        limit,
      },
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteMessage(
  supabase: SupabaseClient,
  { message_id }: { message_id: string },
) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .update({ is_deleted: true })
      .eq("id", message_id);

    if (error) throw new Error(error.message);

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function previewAttachement(
  supabase: SupabaseClient,
  { path, type }: { path: string[]; type: string },
) {
  try {
    const bucket =
      type === "voice_note"
        ? ENV.SUPABASE.STORAGE_VOICE_NOTE_BUCKET_NAME
        : ENV.SUPABASE.STORAGE_BUCKET_NAME;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrls(path, 86400);

    if (error) throw new Error(error.message);

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function downloadAttachements(
  supabase: SupabaseClient,
  { path }: { path: string },
) {
  try {
    const { data, error } = await supabase.storage
      .from("chitchaat-bucket")
      .download(path);

    if (error) throw new Error(error.message);

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
