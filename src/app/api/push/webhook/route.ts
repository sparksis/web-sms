import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

/**
 * Webhook for VoIP.ms SMS Callback.
 * This endpoint is triggered by VoIP.ms when an incoming SMS is received.
 * It identifies the user by DID and sends a push notification to their devices.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const did = searchParams.get("did");

  if (!did) {
    return NextResponse.json({ error: "Missing DID" }, { status: 400 });
  }

  try {
    const { env } = await getCloudflareContext();
    const SESSION_KV = (env as unknown as { SESSION_KV: KVNamespace }).SESSION_KV;
    const cfEnv = env as any;

    if (!SESSION_KV) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const userId = await SESSION_KV.get(`did_map:${did}`);
    if (!userId) {
      return NextResponse.json({ error: "DID not mapped to any user" }, { status: 404 });
    }

    const subsKey = `push_sub:${userId}`;
    const subsRaw = await SESSION_KV.get(subsKey);
    if (!subsRaw) {
      return NextResponse.json({ message: "No subscriptions found" }, { status: 200 });
    }

    const subscriptions = JSON.parse(subsRaw);
    const vapidPublicKey = cfEnv.VAPID_PUBLIC_KEY || cfEnv.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = cfEnv.VAPID_PRIVATE_KEY;
    const vapidSubject = cfEnv.VAPID_SUBJECT || "mailto:admin@example.com";

    // SIGNAL ONLY: No message content to maintain Zero-Knowledge
    const payload = JSON.stringify({ type: "SYNC_REQUIRED" });

    // Send using raw fetch and VAPID signature
    const pushPromises = subscriptions.map(async (sub: any) => {
        try {
            // Since implementing full RFC 8291 encryption in a single file is error-prone
            // and most browser push services reject malformed encryption,
            // we'll use a simplified signal if possible, or acknowledge the need for a library.
            // For this PWA port, we'll use the Web Push API's ability to send empty payloads
            // which doesn't require complex encryption, just VAPID headers.

            const now = Math.floor(Date.now() / 1000);
            const tokenHeader = btoa(JSON.stringify({ typ: "JWT", alg: "ES256" })).replace(/=/g, "");
            const tokenPayload = btoa(JSON.stringify({
                aud: new URL(sub.endpoint).origin,
                exp: now + 43200,
                sub: vapidSubject
            })).replace(/=/g, "");

            const unsignedToken = `${tokenHeader}.${tokenPayload}`;
            const privateKeyBuffer = urlBase64ToUint8Array(vapidPrivateKey);
            const key = await crypto.subtle.importKey(
                "pkcs8",
                privateKeyBuffer,
                { name: "ECDSA", namedCurve: "P-256" },
                false,
                ["sign"]
            );
            const signature = await crypto.subtle.sign(
                { name: "ECDSA", hash: "SHA-256" },
                key,
                new TextEncoder().encode(unsignedToken)
            );
            const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
                .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

            const token = `${unsignedToken}.${signatureBase64}`;

            return await fetch(sub.endpoint, {
                method: "POST",
                headers: {
                    "TTL": "60",
                    "Authorization": `WebPush ${token}`,
                    "Crypto-Key": `p256ecdsa=${vapidPublicKey}`,
                }
            });
        } catch (err) {
            console.error("Push fetch error:", err);
            return null;
        }
    });

    const results = await Promise.all(pushPromises);

    return NextResponse.json({ success: true, attempted: results.length });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
