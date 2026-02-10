/**
 * Stellar Helper - Blockchain Logic with Stellar Wallets Kit
 * ⚠️ DO NOT MODIFY THIS FILE! ⚠️
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { 
  StellarWalletsKit, 
  WalletNetwork, 
  allowAllModules,
  FREIGHTER_ID 
} from '@creit.tech/stellar-wallets-kit';

export class StellarHelper {
  private server: StellarSdk.Horizon.Server;
  private networkPassphrase: string;
  private kit: StellarWalletsKit;
  private network: WalletNetwork;
  private publicKey: string | null = null;

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.server = new StellarSdk.Horizon.Server(
      network === 'testnet'
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org'
    );
    this.networkPassphrase =
      network === 'testnet'
        ? StellarSdk.Networks.TESTNET
        : StellarSdk.Networks.PUBLIC;
    
    this.network = network === 'testnet' 
      ? WalletNetwork.TESTNET 
      : WalletNetwork.PUBLIC;

    // Stellar Wallets Kit'i initialize et
    this.kit = new StellarWalletsKit({
      network: this.network,
      selectedWalletId: FREIGHTER_ID,
      modules: allowAllModules(),
    });
  }

  isFreighterInstalled(): boolean {
    // Try multiple ways to detect Freighter
    if (typeof window === 'undefined') return false;
    
    // Check for Freighter API in various possible locations
    const win = window as any;
    return !!(
      win.freighterApi ||
      win.freighter ||
      win.__freighter ||
      (win.chrome && win.chrome.runtime && win.chrome.runtime.id)
    );
  }

  async connectWallet(): Promise<string> {
    try {
      // Set wallet to Freighter directly
      this.kit.setWallet(FREIGHTER_ID);

      // Try to get address directly from Freighter
      // This will fail if Freighter is not installed or not connected
      const { address } = await this.kit.getAddress();

      if (!address) {
        throw new Error('Failed to get address from Freighter wallet. Please make sure Freighter is installed and unlocked.');
      }

      this.publicKey = address;
      return address;
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      
      // Check error message to provide helpful feedback
      const errorMsg = error.message || String(error);
      
      if (
        errorMsg.includes('not installed') ||
        errorMsg.includes('not found') ||
        errorMsg.includes('not available') ||
        errorMsg.includes('Freighter') && errorMsg.includes('not')
      ) {
        throw new Error('Freighter wallet is not installed. Please install Freighter extension first: https://freighter.app');
      }
      
      if (errorMsg.includes('not connected') || errorMsg.includes('not unlocked')) {
        throw new Error('Freighter wallet is not connected or unlocked. Please unlock your Freighter wallet and try again.');
      }
      
      throw new Error('Failed to connect to Freighter wallet: ' + errorMsg);
    }
  }

  async getBalance(publicKey: string): Promise<{
    xlm: string;
    assets: Array<{ code: string; issuer: string; balance: string }>;
  }> {
    const account = await this.server.loadAccount(publicKey);
    
    const xlmBalance = account.balances.find(
      (b) => b.asset_type === 'native'
    );

    const assets = account.balances
      .filter((b) => b.asset_type !== 'native')
      .map((b: any) => ({
        code: b.asset_code,
        issuer: b.asset_issuer,
        balance: b.balance,
      }));

    return {
      xlm: xlmBalance && 'balance' in xlmBalance ? xlmBalance.balance : '0',
      assets,
    };
  }

  async sendPayment(params: {
    from: string;
    to: string;
    amount: string;
    memo?: string;
  }): Promise<{ hash: string; success: boolean }> {
    const account = await this.server.loadAccount(params.from);

    const transactionBuilder = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    }).addOperation(
      StellarSdk.Operation.payment({
        destination: params.to,
        asset: StellarSdk.Asset.native(),
        amount: params.amount,
      })
    );

    if (params.memo) {
      transactionBuilder.addMemo(StellarSdk.Memo.text(params.memo));
    }

    const transaction = transactionBuilder.setTimeout(180).build();

    // Wallet Kit ile imzala
    const { signedTxXdr } = await this.kit.signTransaction(transaction.toXDR(), {
      networkPassphrase: this.networkPassphrase,
    });

    const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(
      signedTxXdr,
      this.networkPassphrase
    );

    const result = await this.server.submitTransaction(
      transactionToSubmit as StellarSdk.Transaction
    );

    return {
      hash: result.hash,
      success: result.successful,
    };
  }

  async getRecentTransactions(
    publicKey: string,
    limit: number = 10
  ): Promise<Array<{
    id: string;
    type: string;
    amount?: string;
    asset?: string;
    from?: string;
    to?: string;
    createdAt: string;
    hash: string;
  }>> {
    const payments = await this.server
      .payments()
      .forAccount(publicKey)
      .order('desc')
      .limit(limit)
      .call();

    return payments.records.map((payment: any) => ({
      id: payment.id,
      type: payment.type,
      amount: payment.amount,
      asset: payment.asset_type === 'native' ? 'XLM' : payment.asset_code,
      from: payment.from,
      to: payment.to,
      createdAt: payment.created_at,
      hash: payment.transaction_hash,
    }));
  }

  getExplorerLink(hash: string, type: 'tx' | 'account' = 'tx'): string {
    const network = this.networkPassphrase === StellarSdk.Networks.TESTNET ? 'testnet' : 'public';
    return `https://stellar.expert/explorer/${network}/${type}/${hash}`;
  }

  formatAddress(address: string, startChars: number = 4, endChars: number = 4): string {
    if (address.length <= startChars + endChars) {
      return address;
    }
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  }

  disconnect() {
    this.publicKey = null;
    return true;
  }
}

export const stellar = new StellarHelper('testnet');