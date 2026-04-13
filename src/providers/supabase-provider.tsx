"use client";

import { createContext, useContext, useMemo, useEffect } from "react";
import { useSession } from "@clerk/nextjs";
import { ENV } from "@/constants/env-exports";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();

  const supabase = useMemo(() => {
    if (!ENV.SUPABASE.SUPABASE_URL || !ENV.SUPABASE.SUPABASE_PUBLISHABLE_KEY) {
      throw new Error("Supabase credentials missing");
    }

    return createClient(
      ENV.SUPABASE.SUPABASE_URL,
      ENV.SUPABASE.SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          fetch: async (url, options = {}) => {
            const clerkToken = await session?.getToken({
              template: "supabase",
            });

            const headers = new Headers(options?.headers);

            if (clerkToken) {
              headers.set("Authorization", `Bearer ${clerkToken}`);
            }

            return fetch(url, { ...options, headers });
          },
        },
      },
    );
  }, [session]);

  useEffect(() => {
    const setRealtimeAuth = async () => {
      if (session) {
        const token = await session.getToken({ template: "supabase" });
        if (token) {
          supabase.realtime.setAuth(token);
        }
      }
    };

    setRealtimeAuth();
  }, [session, supabase]);

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within SupabaseProvider");
  }
  return context;
};
