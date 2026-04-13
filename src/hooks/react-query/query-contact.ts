import { useSupabase } from "@/providers/supabase-provider";
import {
  findContact,
  getContacts,
  getInvitations,
  getPendingContacts,
} from "@/services/contact.service";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

export const useFindContact = ({
  userName,
  enabled,
}: {
  userName: string;
  enabled: boolean;
}) => {
  const supabase = useSupabase();
  const { user } = useUser();

  return useQuery({
    queryKey: ["find-contact", userName],
    queryFn: async () => {
      return await findContact(supabase, { userName, userId: user?.id });
    },
    staleTime: 60_000,
    enabled: enabled && !!userName,
  });
};

export const useGetPendingContacts = () => {
  const supabase = useSupabase();
  const { user } = useUser();

  return useQuery({
    queryKey: ["get-pending-contacts", user?.id],
    queryFn: async () => {
      return await getPendingContacts(supabase, { userId: user?.id! });
    },
    staleTime: 60_000,
    enabled: !!user?.id,
  });
};

export const useGetInvitations = () => {
  const supabase = useSupabase();
  const { user } = useUser();

  return useQuery({
    queryKey: ["get-invitations", user?.id],
    queryFn: async () => {
      return await getInvitations(supabase, { userId: user?.id! });
    },
    staleTime: 60_000,
    enabled: !!user?.id,
  });
};
export const useGetContacts = () => {
  const supabase = useSupabase();
  const { user } = useUser();

  return useQuery({
    queryKey: ["get-contacts", user?.id],
    queryFn: async () => {
      return await getContacts(supabase, { userId: user?.id! });
    },
    staleTime: 60_000,
    enabled: !!user?.id,
  });
};
