import { AuthAdapter, AuthCredentials } from "./types";

const CREDENTIALS_KEY = "voipms_credentials_v2";

/**
 * Simple XOR-based "encryption" for local storage.
 * NOTE: For production, a more robust solution like Web Crypto API with user-derived keys
 * would be preferred, but this provides a layer beyond plaintext.
 */
function obfuscate(text: string): string {
  return btoa(text.split('').map((char, i) =>
    String.fromCharCode(char.charCodeAt(0) ^ (i % 255))
  ).join(''));
}

function deobfuscate(text: string): string {
  try {
    return atob(text).split('').map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) ^ (i % 255))
    ).join('');
  } catch {
    return "";
  }
}

export class VoipMsAuthAdapter implements AuthAdapter {
  async login(credentials: AuthCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      // Use the proxy for validation
      const response = await fetch("/api/voipms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...credentials,
          method: "getDIDsInfo",
        }),
      });

      const data = await response.json();

      if (data.status === "success" || data.status === "no_did") {
        const encrypted = obfuscate(JSON.stringify(credentials));
        localStorage.setItem(CREDENTIALS_KEY, encrypted);
        return { success: true };
      }

      return {
        success: false,
        error: data.status === "invalid_credentials" ? "Invalid email or API password" : data.status
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error. Please check your connection." };
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem(CREDENTIALS_KEY);
    // Also remove old version if exists
    localStorage.removeItem("voipms_credentials");
  }

  getCredentials(): AuthCredentials | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    if (!stored) return null;

    try {
      const decrypted = deobfuscate(stored);
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCredentials() !== null;
  }
}

export const authAdapter: AuthAdapter = new VoipMsAuthAdapter();
