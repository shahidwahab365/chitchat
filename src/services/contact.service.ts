import { SupabaseClient } from "@supabase/supabase-js";

export async function findContact(
  supabase: SupabaseClient,
  { userName, userId }: { userName: string; userId: string | undefined },
) {
  try {
    // Step 1: Fetch users
    const { data: users, error: usersError } = await supabase
      .from("users_public")
      .select("*")
      .filter("user_id", "neq", userId)
      .ilike("username", `%${userName}%`)
      .eq("is_deleted", false)
      .order("username", { ascending: true })
      .limit(10);

    if (usersError) throw new Error(usersError.message);
    if (!users || users.length === 0) return [];

    // Step 2: Fetch contact statuses for all matched users
    const { data: contacts, error: contactsError } = await supabase
      .from("contacts")
      .select("contact_user_id, status")
      .eq("user_id", userId)
      .in(
        "contact_user_id",
        users.map((u) => u.user_id), // fetch all statuses for these users
      )
      .neq("is_deleted", true);

    if (contactsError) throw new Error(contactsError.message);

    // Step 3: Merge users with their contact status
    return users.map((u) => {
      const statusObj = contacts?.find((c) => c.contact_user_id === u.user_id);
      return {
        ...u,
        contactStatus: statusObj?.status ?? null,
      };
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function sendConnectionToContact(
  supabase: SupabaseClient,
  {
    contact_id,
    senderName,
  }: {
    contact_id: string;
    senderName: string;
  },
) {
  try {
    const { error: contactErr } = await supabase.from("contacts").insert({
      contact_user_id: contact_id,
    });

    if (contactErr) {
      if (contactErr.code === "23505") {
        await supabase
          .from("contacts")
          .update({ status: "requested", is_deleted: false })
          .eq("contact_user_id", contact_id)
          .or("status.eq.ignored, status.eq.accepted");

        return null;
      }

      throw new Error(contactErr.message);
    }

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        contact_id,
        notification_type: "connect_request",
        title: "New Connection Request",
        body: `${senderName} wants to connect`,
        data: null,
      });

    if (notificationError) {
      throw new Error(notificationError.message);
    }

    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getPendingContacts(
  supabase: SupabaseClient,
  { userId }: { userId: string },
) {
  try {
    const { data, error } = await supabase
      .from("contacts")
      .select(
        "*, info: users!contacts_contact_user_id_fkey(avatar_url, full_name)",
      )
      .eq("user_id", userId)
      .eq("status", "requested")
      .neq("is_deleted", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getContacts(
  supabase: SupabaseClient,
  { userId }: { userId: string },
) {
  try {
    const { data, error } = await supabase
      .from("contacts")
      .select(
        "*, info: users!contacts_contact_user_id_fkey(avatar_url, full_name)",
      )
      .or(`user_id.eq.${userId}`)
      .eq("status", "accepted")
      .neq("is_deleted", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getInvitations(
  supabase: SupabaseClient,
  { userId }: { userId: string },
) {
  try {
    const { data, error } = await supabase
      .from("contacts")
      .select("*, info: users!contacts_user_id_fkey(avatar_url, full_name)")
      .eq("contact_user_id", userId)
      .eq("status", "requested")
      .neq("is_deleted", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function withdrawConnectionRequest(
  supabase: SupabaseClient,
  { contact_id }: { contact_id: string },
) {
  try {
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", contact_id);

    if (error) {
      throw new Error(error.message);
    }

    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function responseToConnectionRequest(
  supabase: SupabaseClient,
  {
    id,
    accept,
    senderName,
    contact_user_id,
  }: {
    senderName: string;
    id: string;
    accept: boolean;
    contact_user_id: string;
  },
) {
  try {
    const { error } = await supabase
      .from("contacts")
      .update({
        status: accept ? "accepted" : "ignored",
      })
      .eq("id", id)
      .eq("status", "requested")
      .neq("is_deleted", true);

    if (error) {
      throw new Error(error.message);
    }

    if (accept) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          contact_id: contact_user_id,
          notification_type: "connect_request",
          title: `${senderName}`,
          body: `Accepted your invitation`,
          data: null,
        });

      if (notificationError) {
        throw new Error(notificationError.message);
      }
    }

    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function removeContact(
  supabase: SupabaseClient,
  { id }: { id: string },
) {
  try {
    const { error } = await supabase
      .from("contacts")
      .update({ is_deleted: true })
      .eq("id", id)
      .neq("is_deleted", true);

    if (error) {
      throw new Error(error.message);
    }

    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
