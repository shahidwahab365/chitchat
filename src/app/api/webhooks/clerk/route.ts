import { capitalizeName } from "@/lib/capitalize-name";
import { createWebhookClient } from "@/lib/supabase/createWebHookClient";
import { verifyClerkWebhook } from "@/lib/verify-clerk-webhook";
import { NextRequest, NextResponse } from "next/server";

async function deleteUser({ user_id }: { user_id: string }) {
  const supabase = createWebhookClient();

  const { data: existing, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user_id);

  if (selectError) throw new Error(selectError.message);
  if (!existing || existing.length === 0) {
    console.log("No user found to delete:", user_id);
    return null;
  }

  const { error, data } = await supabase
    .from("users")
    .update({ is_deleted: true })
    .eq("user_id", user_id)
    .select();

  if (error) throw new Error(error.message);

  return data;
}

async function addNewUser({
  user_id,
  username,
  avatar_url,
  email,
  full_name,
}: {
  user_id: string;
  username: string;
  avatar_url: string;
  email: string;
  full_name: string;
}) {
  const supabase = createWebhookClient();

  const { data: oldUsers, error: selectError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email);

  if (selectError) throw new Error(selectError.message);

  if (!oldUsers || oldUsers.length === 0) {
    const { data, error } = await supabase
      .from("users")
      .insert({
        user_id,
        username,
        avatar_url,
        email,
        full_name: full_name.length ? capitalizeName({ name: full_name }) : "",
        is_deleted: false,
      })
      .select();

    if (error) throw new Error(error.message);

    return data;
  }

  const existingUserId = oldUsers[0].user_id;
  const { data, error } = await supabase
    .from("users")
    .update({
      user_id,
      avatar_url,
      full_name: full_name.length ? capitalizeName({ name: full_name }) : "",
      is_deleted: false,
    })
    .eq("user_id", existingUserId)
    .select();

  if (error) throw new Error(error.message);

  return data;
}

export async function POST(request: NextRequest) {
  try {
    const { data, type } = await verifyClerkWebhook(request);

    if (type === "user.deleted") {
      await deleteUser({ user_id: data.id });
    } else if (type === "user.created") {
      const primaryEmail = data.email_addresses?.find(
        (e: any) => e.id === data.primary_email_address_id,
      )?.email_address;

      await addNewUser({
        user_id: data.id,
        username: data.username ?? null,
        full_name: [data.first_name, data.last_name].filter(Boolean).join(" "),
        email: primaryEmail,
        avatar_url: data.image_url ?? null,
      });
    }

    return new NextResponse("Ok", { status: 200 });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 400 });
  }
}
