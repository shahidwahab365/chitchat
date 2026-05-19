import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { currentUser } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomName: RN } = body;
    const user = await currentUser();
    const userId = user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret)
      return new NextResponse("LiveKit server env vars are missing", {
        status: 500,
      });
    
    const roomName = RN && RN.trim() ? RN : uuidv4();
    const at = new AccessToken(apiKey, apiSecret, {
      identity: String(userId),
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      roomName,
      token,
      url: process.env.LIVEKIT_URL,
    });
  } catch (error: any) {
    return new NextResponse(
      error.message || "Failed to generate calling token",
      {
        status: 400,
      },
    );
  }
}
