import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const roomName = body.roomName;
    const userId = body.userId;
    const userName = body.userName ?? body.userId;

    if (!roomName || !userId) {
      return NextResponse.json(
        { error: "roomName and userId are required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret)
      return new NextResponse("LiveKit server env vars are missing", {
        status: 500,
      });

    const at = new AccessToken(apiKey, apiSecret, {
      identity: String(userId),
      name: String(userName),
      ttl: "10m",
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
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
