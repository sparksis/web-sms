import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSession } from "@auth0/nextjs-auth0/edge";

export const runtime = "edge";

/**
 * Stores encrypted VoIP.ms credentials in Cloudflare KV.
 * Keyed by Auth0 user ID ('sub') for persistence across sessions.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub as string;
    const { encryptedPayload, iv } = await request.json() as { encryptedPayload: string; iv: string };

    if (!encryptedPayload || !iv) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { env } = await getCloudflareContext();
    const SESSION_KV = (env as unknown as { SESSION_KV: KVNamespace }).SESSION_KV;

    if (!SESSION_KV) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Store encrypted credentials keyed by Auth0 user ID
    await SESSION_KV.put(userId, JSON.stringify({ encryptedPayload, iv }), {
      expirationTtl: 86400 * 30, // Extended TTL for user persistence (30 days)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session storage error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
