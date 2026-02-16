/**
 * Classify Stellar/Soroban errors for Level 2: 3 error types
 * - Wallet not found
 * - User rejected (transaction or connection)
 * - Insufficient balance
 */
export type StellarErrorType = "wallet_not_found" | "user_rejected" | "insufficient_balance" | "unknown";

export function classifyStellarError(e: unknown): { type: StellarErrorType; message: string } {
  const msg = e instanceof Error ? e.message : String(e ?? "Unknown error");
  const lower = msg.toLowerCase();

  if (
    lower.includes("freighter not found") ||
    lower.includes("wallet not found") ||
    lower.includes("no wallet") ||
    lower.includes("extension")
  ) {
    return { type: "wallet_not_found", message: "Wallet not found. Install Freighter or another Stellar wallet." };
  }

  if (
    lower.includes("reject") ||
    lower.includes("denied") ||
    lower.includes("declined") ||
    lower.includes("user denied") ||
    lower.includes("cancelled") ||
    lower.includes("canceled")
  ) {
    return { type: "user_rejected", message: "You rejected the transaction or connection." };
  }

  if (
    lower.includes("insufficient") ||
    lower.includes("balance") ||
    lower.includes("low reserve") ||
    lower.includes("not enough") ||
    lower.includes("underfunded")
  ) {
    return { type: "insufficient_balance", message: "Insufficient balance. Get testnet XLM from a faucet." };
  }

  return { type: "unknown", message: msg || "Something went wrong." };
}

export const STELLAR_EXPLORER_TX = "https://stellar.expert/explorer/testnet/tx";
