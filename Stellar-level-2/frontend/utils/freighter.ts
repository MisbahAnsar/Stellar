import {
  isConnected,
  requestAccess,
} from "@stellar/freighter-api";

export const checkConnection = async () => {
  try {
    const isInstalled = await isConnected();
    console.log("[Freighter] isConnected result:", isInstalled);
    return !!isInstalled;
  } catch (e) {
    console.error("[Freighter] Error checking connection:", e);
    return false;
  }
};

export type WalletResponse = {
  publicKey: string | null;
  error: string | null;
};

export const retrievePublicKey = async (): Promise<WalletResponse> => {
  try {
    const connected = await checkConnection();
    if (!connected) {
      return { publicKey: null, error: "Freighter not found" };
    }

    console.log("[Freighter] Requesting access...");
    // @ts-ignore - Handle potential type mismatch from library
    const result = await requestAccess();
    console.log("[Freighter] access result:", result);

    let publicKey = "";

    if (typeof result === "string") {
      publicKey = result;
    } else if (result && typeof result === "object" && "address" in result) {
      // Handle case where library returns object with address
      publicKey = (result as any).address;
    } else {
      // Fallback or error
      console.warn("[Freighter] Unexpected result type:", typeof result);
    }

    if (!publicKey) {
      return { publicKey: null, error: "User declined access or no key returned" };
    }

    return { publicKey, error: null };
  } catch (e: any) {
    console.error("[Freighter] retrievePublicKey detailed error:", e);
    return { publicKey: null, error: e.message || "Unknown error occurred" };
  }
};
