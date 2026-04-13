/* eslint-disable @typescript-eslint/no-explicit-any */
import { ENV } from "@/constants/env-exports";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { Webhook } from "svix";

export type ClerkWebhookResult = {
  type: string;
  data: any;
};

export async function verifyClerkWebhook(
  request: NextRequest,
): Promise<ClerkWebhookResult> {
  const payload = await request.text();
  const headerList = headers();

  const svix_id = (await headerList).get("svix-id");
  const svix_timestamp = (await headerList).get("svix-timestamp");
  const svix_signature = (await headerList).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new Error("Missing Svix headers");
  }

  const wh = new Webhook(ENV.CLERK.CLERK_WEBHOOKS_SECRET);

  let evt: any;
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed", err);
    throw new Error("Invalid webhook signature");
  }

  return {
    type: evt.type,
    data: evt.data,
  };
}
