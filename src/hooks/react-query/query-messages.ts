import { useSupabase } from "@/providers/supabase-provider";
import {
  downloadAttachements,
  getMessages,
  previewAttachement,
} from "@/services/message.service";
import { useUser } from "@clerk/nextjs";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetMessages = ({
  recipient_id,
  limit = 20,
}: {
  recipient_id: string;
  limit?: number;
}) => {
  const supabase = useSupabase();
  const { user } = useUser();
  return useInfiniteQuery({
    queryKey: ["messages", recipient_id],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      return await getMessages(supabase, {
        user_id: user?.id!,
        recipient_id,
        limit,
        page: pageParam,
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.page + 1;
      }

      return undefined;
    },
    enabled: !!user?.id && !!recipient_id,
    staleTime: 1000 * 60,
  });
};

export const usePreviewAttachement = ({
  path,
  isEnabled,
  type
}: {
  path: string[];
  isEnabled: boolean;
  type: string;
}) => {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["preview-attachement", path],
    queryFn: async () => {
      return await previewAttachement(supabase, { path, type });
    },
    staleTime: 60_000,
    enabled: path.length > 0 && isEnabled,
  });
};

export const useDownloadAttachement = ({
  setDownFName,
  downFName,
}: {
  setDownFName: (e: string | null) => void;
  downFName: string | null;
}) => {
  const supabase = useSupabase();

  return useMutation({
    mutationKey: ["download-attachement"],
    mutationFn: async ({ path }: { path: string }) => {
      return await downloadAttachements(supabase, { path });
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", downFName || Date.now().toString());
      document.body.appendChild(link);
      link.click();
      link?.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Attachement Downloading Completed");
      setDownFName(null);
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Something went wrong while downloading attachement yet",
      );
      setDownFName(null);
    },
  });
};
