# Make It Right – Stellar Testnet Apology App

A tiny Stellar testnet experience where you send on‑chain “apology” payments with a short note attached. Built with Next.js, TypeScript, and Tailwind CSS.

## What this app does

This project lets you:

- Connect a Stellar wallet and see your XLM testnet balance in the navbar
- Send a small XLM transfer with an optional apology message (text memo)
- View a clean, card‑based history of recent transactions
- Get clear feedback when things succeed or fail (toasts + inline alerts)

All blockchain logic lives in `lib/stellar-helper.ts` (intentionally left untouched for the challenge).

## Main features

- **Wallet connection**: Connect / disconnect with loading states and basic error handling  
- **Balance display**: Navbar balance pill with auto‑refresh after successful sends  
- **Send flow**:
  - Recipient address validation (must be a 56‑character G‑address)
  - Amount validation with helpful error copy
  - Optional memo limited to 28 characters (Stellar text memo constraint)
  - Success card with transaction hash + link out to a block explorer
- **Transaction history**:
  - Sent vs received, amounts, asset, relative time, and truncated hashes
  - Quick link to view each transaction on an explorer
- **Responsive layout & dark styling**:
  - Split hero layout on desktop (copy left, panel right)
  - Tabbed panel for “Send apology” / “Check history” when connected
  - Dark, minimal navbar with wallet + balance controls

## Getting started

### Prerequisites

- Node.js 18+
- npm (or pnpm/yarn if you prefer)

### Install & run

```bash
# From the repository root
cd stellar-frontend-challenge

npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Testnet XLM

To actually send payments you’ll need some testnet XLM in your wallet. Use any Stellar testnet faucet / account‑creator you like, fund your address, and then refresh the app to see the updated balance in the navbar.

## How to use the UI

- **Connect your wallet**: Use the button in the top‑right navbar, then approve in your wallet extension.  
- **Send an apology**:
  - Switch to the **Send apology** tab (when connected)
  - Paste the recipient’s Stellar address
  - Enter an amount in XLM
  - Add an optional short apology message (≤ 28 characters)
  - Submit and approve the transaction in your wallet
- **Check history**:
  - Switch to the **Check history** tab to see your most recent on‑chain activity

## Tech stack

- Next.js + React (`app` router)
- TypeScript
- Tailwind CSS
- Stellar SDK (via the provided helper in `lib/stellar-helper.ts`)

## Screenshots / images

_(Reserved space for UI screenshots – intentionally left empty for now.)_

## Notes

- **Testnet only** – never use real funds here.  
- The focus of this repo is front‑end UX on top of the provided Stellar helper; the blockchain logic itself is already wired up for you.
