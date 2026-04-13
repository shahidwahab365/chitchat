import { SupabaseClient } from "@supabase/supabase-js";

export async function getNotifications(
  supabase: SupabaseClient,
  {
    user_id,
    page = 1,
    limit = 5,
  }: {
    user_id: string;
    page: number;
    limit: number;
  },
) {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("notifications")
      .select(
        "id, created_at, data, body, is_read, notification_type, title, info:users(avatar_url)",
        { count: "exact" },
      )
      .eq("contact_id", user_id)
      .eq("is_deleted", false)
      .range(from, to)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    const total = count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error: any) {
    throw new Error(error.message);
  }
}
