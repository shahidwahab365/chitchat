import { getMessageType } from "@/lib/get-message-type";
import { uploadFile, uploadVoiceNote } from "@/lib/supabase/upload-file";
import { useSupabase } from "@/providers/supabase-provider";
import { deleteMessage, sendMessage } from "@/services/message.service";
import { IMessages } from "@/types/messages";
import { ISendMessageProps } from "@/types/send-message-props";
import { useSession, useUser } from "@clerk/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSendMessage = ({ setPercentage }: { setPercentage: any }) => {
  const supabase = useSupabase();
  const { user } = useUser();
  const client = useQueryClient();
  const { session } = useSession();

  return useMutation({
    mutationKey: ["sendMessage"],
    mutationFn: async ({
      content,
      duration,
      reply_to_message_id,
      recipient_id,
      selectedFiles,
      voice_note,
    }: ISendMessageProps) => {
      if (voice_note) {
        await uploadVoiceNote({ file: voice_note, session });

        return sendMessage(supabase, {
          sender_id: user?.id!,
          message_type: "voice_note",
          content,
          file_name: [voice_note.name],
          file_size: [String(voice_note.size)],
          duration,
          reply_to_message_id,
          recipient_id,
        });
      }

      const uploadedFiles: string[] = [];
      if (selectedFiles) {
        for (const file of selectedFiles) {
          const res = await uploadFile({
            file,
            session,
            setPercentage,
          });
          uploadedFiles.push(res as string);
        }
      }

      return sendMessage(supabase, {
        sender_id: user?.id!,
        message_type: getMessageType(content, uploadedFiles),
        content,
        file_name: uploadedFiles,
        file_size: [...(selectedFiles?.map((file: any) => file.size) || [])],
        duration,
        reply_to_message_id,
        recipient_id,
      });
    },

    onMutate: async (variables) => {
      await client.cancelQueries({
        queryKey: ["messages", variables.recipient_id],
      });

      const previousMessages = client.getQueryData<{ data: IMessages[] }>([
        "messages",
        variables.recipient_id,
      ]);

      const uploadedFiles = variables.selectedFiles?.map((f) => f.name) ?? [];

      const optimisticMessage: IMessages = {
        id: crypto.randomUUID(),
        sender_id: user?.id!,
        recipient_id: variables.recipient_id!,
        message_type: variables.voice_note
          ? "voice_note"
          : getMessageType(variables.content, uploadedFiles),
        content: variables.content ?? "",
        file_name: variables.voice_note
          ? [variables.voice_note]
          : (variables.selectedFiles ?? undefined),
        file_size: variables.voice_note
          ? [String(variables.voice_note.size)]
          : variables.file_size,
        duration: variables.duration,
        reply_to_message_id: variables.reply_to_message_id,
        is_edited: false,
        message_read_status: "sent",
        created_at: new Date().toISOString(),
      };

      client.setQueryData(
        ["messages", variables.recipient_id],
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any, index: number) => {
              if (index === 0) {
                return {
                  ...page,
                  data: [optimisticMessage, ...page.data],
                };
              }

              return page;
            }),
          };
        },
      );

      return { previousMessages };
    },

    onError: (error, variables, context) => {
      toast.error("Failed to send message", {
        description: error.message,
      });

      if (context?.previousMessages) {
        client.setQueryData(
          ["messages", variables.recipient_id],
          context.previousMessages,
        );
      }
    },

    onSettled: (_data, _error, variables) => {
      client.invalidateQueries({
        queryKey: ["messages", variables.recipient_id],
      });
    },

    onSuccess: () => {
      setPercentage(null);
    },
  });
};

export const useDeleteMessage = ({
  setOpen,
  recipient_id,
}: {
  setOpen: (e: boolean) => void;
  recipient_id: string;
}) => {
  const client = useQueryClient();
  const supabase = useSupabase();

  return useMutation({
    mutationKey: ["deleteMessage"],
    mutationFn: async ({ message_id }: { message_id: string }) => {
      return deleteMessage(supabase, { message_id });
    },
    onError: (error) => {
      toast.error("Failed to delete message", {
        description: error.message,
      });
    },
    onSuccess: (_, { message_id }) => {
      client.setQueryData(["messages", recipient_id], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((msg: any) => msg.id !== message_id),
          })),
        };
      });

      setOpen(false);
      toast.success("Message deleted");
    },
  });
};
