import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSession } from "@auth0/nextjs-auth0/edge";
import { decrypt } from "@/lib/crypto";

export const runtime = "edge";

/**
 * Maps the user's DIDs to their Auth0 User ID in KV.
 * This is used by the webhook to identify the user when an incoming SMS arrives.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub as string;
    const { env } = await getCloudflareContext();
    const SESSION_KV = (env as unknown as { SESSION_KV: KVNamespace }).SESSION_KV;

    if (!SESSION_KV) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Since we need the VoIP.ms credentials to get the DIDs, and they are encrypted...
    // We expect the client to trigger this after login, or we fetch them here if we have the decryption key.
    // However, for security, the decryption key is only on the client.
    // The client can send the DIDs to be mapped.

    const body = await request.json();
    if (body.dids && Array.isArray(body.dids)) {
      const promises = body.dids.map((did: string) =>
        SESSION_KV.put(`did_map:${did}`, userId)
      );
      await Promise.all(promises);
      return NextResponse.json({ success: true, count: body.dids.length });
    }

    // Fallback: If no DIDs provided, the client might be asking the server to fetch them.
    // But the server doesn't have the decryption key unless provided in the header.
    const decryptionKey = request.headers.get("X-Decryption-Key");
    if (decryptionKey) {
        const stored = await SESSION_KV.get(userId);
        if (stored) {
            const { encryptedPayload, iv } = JSON.parse(stored);
            const decryptedBody = await decrypt(encryptedPayload, iv, decryptionKey);
            const credentials = JSON.parse(decryptedBody);

            const voipParams = new URLSearchParams();
            voipParams.append("api_username", credentials.email);
            voipParams.append("api_password", credentials.apiPassword);
            voipParams.append("method", "getDIDsInfo");

            const response = await fetch(`https://voip.ms/api/v1/rest.php?${voipParams.toString()}`);
            const data = await response.json() as { status: string; dids?: { number: string }[] };

            if (data.status === "success" && data.dids) {
                const promises = data.dids.map(d => SESSION_KV.put(`did_map:${d.number}`, userId));
                await Promise.all(promises);
                return NextResponse.json({ success: true, count: data.dids.length });
            }
        }
    }

    return NextResponse.json({ error: "No DIDs provided and could not fetch them" }, { status: 400 });
  } catch (error) {
    console.error("DID map error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
