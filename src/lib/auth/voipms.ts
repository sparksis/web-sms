import { AuthAdapter, AuthCredentials } from "./types";
import { generateSessionKey, encrypt } from "@/lib/crypto";

const DECRYPTION_KEY_KEY = "voipms_decryption_key";

export class VoipMsAuthAdapter implements AuthAdapter {
  async login(credentials: AuthCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Generate local decryption key
      const decryptionKey = await generateSessionKey();

      // 2. Encrypt credentials locally
      const { encrypted: encryptedPayload, iv } = await encrypt(JSON.stringify(credentials), decryptionKey);

      // 3. Store encrypted credentials on the server (keyed by Auth0 ID automatically on server)
      const storeResponse = await fetch("/api/voipms/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encryptedPayload,
          iv,
        }),
      });

      if (!storeResponse.ok) {
        const errorData = await storeResponse.json() as { error?: string };
        return { success: false, error: errorData.error || "Failed to initialize secure session" };
      }

      // 4. Test the proxy with the new session
      const testResponse = await fetch("/api/voipms/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Decryption-Key": decryptionKey,
        },
        body: JSON.stringify({
          method: "getDIDsInfo",
        }),
      });

      const data = await testResponse.json() as { status: string };

      if (data.status === "success" || data.status === "no_did") {
        // 5. Persist only the decryption key locally
        localStorage.setItem(DECRYPTION_KEY_KEY, decryptionKey);
        return { success: true };
      }

      return {
        success: false,
        error: data.status === "invalid_credentials" ? "Invalid email or API password" : data.status,
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error. Please check your connection." };
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem(DECRYPTION_KEY_KEY);
    // Cleanup old keys
    localStorage.removeItem("voipms_session_id");
    localStorage.removeItem("voipms_credentials_v2");
    localStorage.removeItem("voipms_credentials");
  }

  getCredentials(): AuthCredentials | null {
    return null;
  }

  getSessionInfo(): { decryptionKey: string } | null {
    if (typeof window === "undefined") return null;
    const decryptionKey = localStorage.getItem(DECRYPTION_KEY_KEY);

    if (!decryptionKey) return null;
    return { decryptionKey };
  }

  isAuthenticated(): boolean {
    return this.getSessionInfo() !== null;
  }
}

export const authAdapter: VoipMsAuthAdapter = new VoipMsAuthAdapter();
