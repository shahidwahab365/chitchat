import { createWebhookClient } from "@/lib/supabase/createWebHookClient";
import { WebhookReceiver } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!,
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const authorization = request.headers.get("Authorization");

    if (!authorization) {
      return NextResponse.json({
        success: false,
        error: "Missing Authorization header",
      });
    }

    const supabase = createWebhookClient();
    const event = await receiver.receive(body, authorization);

    if (event.event === "room_finished") {
      const started_at = new Date(Number(event.room?.creationTime) * 1000);

      const ended_at = new Date(Number(event.createdAt) * 1000);

      const duration = Math.floor(
        (ended_at.getTime() - started_at.getTime()) / 1000,
      );

      await supabase
        .from("calls")
        .update({
          started_at,
          ended_at,
          duration,
        })
        .eq("room_name", event.room?.name)
        .eq("is_deleted", false);
    }

    return NextResponse.json({
      success: true,
      status: 200,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
