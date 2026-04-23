import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSession } from "@auth0/nextjs-auth0/edge";

export const runtime = "edge";

/**
 * Stores a Web Push subscription for the authenticated user.
 * Subscriptions are stored in KV as an array, as a user might have multiple devices.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub as string;
    const subscription = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const { env } = await getCloudflareContext();
    const SESSION_KV = (env as unknown as { SESSION_KV: KVNamespace }).SESSION_KV;

    if (!SESSION_KV) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const key = `push_sub:${userId}`;
    const existing = await SESSION_KV.get(key);
    let subscriptions: any[] = existing ? JSON.parse(existing) : [];

    // Avoid duplicates
    if (!subscriptions.some(s => s.endpoint === subscription.endpoint)) {
      subscriptions.push(subscription);
      await SESSION_KV.put(key, JSON.stringify(subscriptions));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push subscribe error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Removes a Web Push subscription.
 */
export async function DELETE(request: NextRequest) {
    try {
      const session = await getSession();
      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const userId = session.user.sub as string;
      const { endpoint } = await request.json() as { endpoint: string };

      if (!endpoint) {
        return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
      }

      const { env } = await getCloudflareContext();
      const SESSION_KV = (env as unknown as { SESSION_KV: KVNamespace }).SESSION_KV;

      if (!SESSION_KV) {
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
      }

      const key = `push_sub:${userId}`;
      const existing = await SESSION_KV.get(key);
      if (existing) {
        let subscriptions: any[] = JSON.parse(existing);
        subscriptions = subscriptions.filter(s => s.endpoint !== endpoint);
        await SESSION_KV.put(key, JSON.stringify(subscriptions));
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Push unsubscribe error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
