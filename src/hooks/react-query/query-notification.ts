import { useSupabase } from "@/providers/supabase-provider";
import { getNotifications } from "@/services/notification.service";
import { useUser } from "@clerk/nextjs";
import { useInfiniteQuery } from "@tanstack/react-query";

export const useNotification = ({ limit = 5 }) => {
  const supabase = useSupabase();
  const { user } = useUser();

  return useInfiniteQuery({
    queryKey: ["notifications", user?.id],
    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      return await getNotifications(supabase, {
        user_id: user?.id!,
        page: pageParam,
        limit,
      });
    },

    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },

    staleTime: 60_000,
  });
};
