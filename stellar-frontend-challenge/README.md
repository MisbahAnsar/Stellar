# Thankful - Stellar Testnet Payment App

A modern web application for sending thank-you messages with XLM payments on Stellar testnet. Built with Next.js, TypeScript, and Tailwind CSS.

## Project Description

Thankful enables users to connect their Freighter wallet, view XLM balance, send payments with personalized messages, and track transaction history on Stellar testnet. Features a clean hero-style layout with dark-outlined UI components.

## Features

✅ **Wallet Setup**: Freighter wallet integration with Stellar Testnet  
✅ **Wallet Connection**: Connect/disconnect functionality with error handling  
✅ **Balance Handling**: Real-time XLM balance display with auto-refresh  
✅ **Transaction Flow**: Send XLM payments with success/failure feedback and transaction hash  
✅ **Development Standards**: Modern UI, wallet integration, error handling

## Setup Instructions

### Prerequisites
- Node.js 18+
- Freighter Wallet Extension ([Install](https://freighter.app))
- npm or yarn

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd stellar-frontend-challenge

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Getting Testnet XLM

1. Connect your Freighter wallet
2. Copy wallet address from navbar
3. Visit [Stellar Laboratory Account Creator](https://laboratory.stellar.org/#account-creator?network=test)
4. Paste address and click "Fund"
5. Refresh app to see balance

## Usage

**Connect Wallet**: Click "Connect wallet" in navbar → Approve in Freighter

**Send Payment**: 
- Go to "Send transaction" tab
- Enter recipient address (56 chars, starts with 'G')
- Enter amount in XLM
- Add message (optional, max 28 chars)
- Click "Send Payment" → Approve in wallet

**View History**: Click "Check history" tab to see recent transactions

## Technology Stack

- Next.js 14.2.0 | TypeScript 5.4.5 | Tailwind CSS 3.4.4
- Stellar SDK 12.3.0 | Stellar Wallets Kit 1.9.5

## Screenshots

### Wallet Connected State UI:

<img width="1911" height="905" alt="image" src="https://github.com/user-attachments/assets/3f926b52-3f4f-4bf8-b1fd-bb1aa061feea" />

### Balance Displayed:

<img width="1911" height="905" alt="image" src="https://github.com/user-attachments/assets/739e9276-af01-4b5f-b9a4-5aafb0b9b13b" />

### Successful Testnet Transaction:

<img width="1916" height="908" alt="image" src="https://github.com/user-attachments/assets/701ccb15-6b1c-4c10-af82-f4a399ef6bdf" />

### Transaction Result Shown to User:

<img width="1919" height="969" alt="image" src="https://github.com/user-attachments/assets/61a1f362-2fa5-48a5-8301-f2f720bdc40f" />

https://stellar.expert/explorer/testnet/tx/c7d604c6ce8d7644ff1f67adac29c8a9f5e2113c7e6a124a01c6826500212fb9

## Error Handling

<img width="832" height="632" alt="image" src="https://github.com/user-attachments/assets/dace26f0-5b08-4845-9058-3d4b31b87931" />

## Important Notes

⚠️ **Stellar Testnet only - Do not use real funds**

## Resources

- [Stellar Docs](https://developers.stellar.org/) | [Stellar Laboratory](https://laboratory.stellar.org/)
- [Freighter Wallet](https://freighter.app) | [Stellar Expert](https://stellar.expert/explorer/testnet)

---

Built with ❤️ for the Stellar Community
