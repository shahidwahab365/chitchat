import { ENV } from "@/constants/env-exports";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    ENV.SUPABASE.SUPABASE_URL,
    ENV.SUPABASE.SUPABASE_SECRET_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch (error: any) {
            throw new Error(error.message);
          }
        },
      },
    },
  );
}
