# Buy Me a Coffee on Stellar

Support creators with XLM on Stellar. Create a coffee page, receive coffees on-chain, and withdraw anytime. Built for the Stellar Level 2 challenge (multi-wallet, deployed contract, real-time events).

![Stellar](https://img.shields.io/badge/Stellar-Testnet-purple?style=for-the-badge&logo=stellar) ![Status](https://img.shields.io/badge/Status-Ready-success?style=for-the-badge)

---

## Quick start

```bash
# 1. Build contract
cd smart-contract
cargo build --target wasm32-unknown-unknown --release
cd ..

# 2. Deploy to testnet (writes frontend/.env.local)
.\deploy_contract.ps1   # Windows PowerShell

# 3. Run frontend
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Connect **Freighter** (testnet), create a coffee page, and send a coffee.

---

## What you need

- **Node.js** 18+
- **Rust** + wasm target: `rustup target add wasm32-unknown-unknown`
- **Soroban CLI** (for build/deploy): [Stellar Soroban](https://developers.stellar.org/docs/tools/software/soroban-cli)
- **Freighter** wallet (testnet) + testnet XLM from a [faucet](https://laboratory.stellar.org/#account-creator?network=test)

---

## Env (frontend)

Create `frontend/.env.local` (or let the deploy script create it):

- `NEXT_PUBLIC_CONTRACT_ID` – contract ID after deploy
- `NEXT_PUBLIC_STELLAR_NETWORK=testnet` (optional)

---

## Level 2 requirements

- **3 error types**: Wallet not found, User rejected, Insufficient balance
- **Contract on testnet**: Deploy with `deploy_contract.ps1`
- **Contract called from frontend**: create_campaign, donate, withdraw, get_campaign, get_campaign_count
- **Transaction status**: Pending → Success (with Stellar Explorer link) or Failed
- **Wallet options**: Connect Wallet → Freighter / Albedo
- **Events & sync**: Contract emits CampaignCreated / DonationReceived; UI refetches every 15s

---

## Deployment info (for submission)

| Item | Value |
|------|--------|
| **Deployed contract address** | `CD7SRE3NRLB6KXY336BE3LJ2D7GMI754DBAKLLSXBWTGWY4FOHM4UPWP` |
| **Contract on Explorer** | [View (testnet)](https://stellar.expert/explorer/testnet/contract/CD7SRE3NRLB6KXY336BE3LJ2D7GMI754DBAKLLSXBWTGWY4FOHM4UPWP) |
| **Deploy tx hash** | `d07b024237022cc72a88a8231a704556944e994ded428dc442f22eb4c6a2d3c7a` · [View tx](https://stellar.expert/explorer/testnet/tx/d07b024237022cc72a88a8231a704556944e994ded428dc442f22eb4c6a2d3c7a) |
| **Initialize tx hash** (contract call) | `025f07757aff3c134ea6c27fbf8400046da57e432b9f5df47372d01ae77ba5902` |

---

## Submission checklist

- [ ] Public GitHub repo
- [x] README with setup (this file)
- [ ] Min 2+ meaningful commits
- [ ] (Optional) Live demo link
- [ ] Screenshot: wallet options (Freighter / Albedo)
- [x] Deployed contract address in README
- [x] Transaction hash of a contract call (above; verifiable on [Stellar Explorer testnet](https://stellar.expert/explorer/testnet))

---

## Structure

- `smart-contract/` – Soroban (Rust) contract: create page, donate, withdraw, events
- `frontend/` – Next.js app (Connect Wallet, coffee pages, donate, withdraw)
- `deploy_contract.ps1` – Build, deploy, init, generate TypeScript bindings

Made for the Stellar Developer Challenge.


screenshots:
main page:
<img width="1919" height="879" alt="image" src="https://github.com/user-attachments/assets/4abd5bc4-443c-47d7-b07b-bc77a7155d97" />

connected wallet:
<img width="1881" height="903" alt="image" src="https://github.com/user-attachments/assets/1e927c86-cab3-4bf5-8810-5865dee20739" />


Creating camppaign
<img width="1898" height="902" alt="image" src="https://github.com/user-attachments/assets/66674a26-ceb8-4913-9731-10f5f75e1666" />


created campaign list
<img width="1892" height="907" alt="image" src="https://github.com/user-attachments/assets/1d8b99ab-9146-4171-89fb-1de5fa27fa8d" />


sending xlm on that campaign
<img width="1915" height="914" alt="image" src="https://github.com/user-attachments/assets/66694c09-4bac-402a-b17a-0dda7a077469" />


