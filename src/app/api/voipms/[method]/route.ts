import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSession } from "@auth0/nextjs-auth0/edge";
import { decrypt } from "@/lib/crypto";

export const runtime = "edge";

/**
 * Secure proxy for VoIP.ms API.
 * 1. Retrieves encrypted credentials from KV using Auth0 user ID.
 * 2. Decrypts credentials in-memory using key from X-Decryption-Key header.
 * 3. Forwards request to VoIP.ms API.
 */
export async function POST(
  request: NextRequest
) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub as string;
    const decryptionKey = request.headers.get("X-Decryption-Key");

    if (!decryptionKey) {
      return NextResponse.json({ error: "Missing decryption key" }, { status: 401 });
    }

    const { env } = await getCloudflareContext();
    const SESSION_KV = (env as unknown as { SESSION_KV: KVNamespace }).SESSION_KV;

    if (!SESSION_KV) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const stored = await SESSION_KV.get(userId);
    if (!stored) {
      return NextResponse.json({ error: "VoIP.ms credentials not found" }, { status: 401 });
    }

    const { encryptedPayload, iv } = JSON.parse(stored);

    // Decrypt credentials in-memory.
    // CRITICAL: The server never logs or persists this decryption key.
    const decryptedBody = await decrypt(encryptedPayload, iv, decryptionKey);
    const credentials = JSON.parse(decryptedBody);

    const body = await request.json() as { method: string; [key: string]: unknown };
    const { method, ...rest } = body;

    const voipParams = new URLSearchParams();
    voipParams.append("api_username", credentials.email);
    voipParams.append("api_password", credentials.apiPassword);
    voipParams.append("method", method);

    // Append any additional parameters from the request body
    Object.entries(rest).forEach(([key, value]) => {
      voipParams.append(key, String(value));
    });

    const response = await fetch(`https://voip.ms/api/v1/rest.php?${voipParams.toString()}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
