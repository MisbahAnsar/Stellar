/**
 * WalletConnection Component
 * 
 * Handles wallet connection/disconnection and displays connected address
 * 
 * Features:
 * - Connect button with loading state
 * - Show connected address
 * - Disconnect functionality
 * - Copy address to clipboard
 * - Check if Freighter is installed
 */

'use client';

import { useState } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaWallet, FaCopy, FaCheck } from 'react-icons/fa';
import { MdLogout } from 'react-icons/md';
import { Card } from './example-components';

interface WalletConnectionProps {
  onConnect: (publicKey: string) => void;
  onDisconnect: () => void;
}

export default function WalletConnection({ onConnect, onDisconnect }: WalletConnectionProps) {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      const key = await stellar.connectWallet();
      setPublicKey(key);
      setIsConnected(true);
      onConnect(key);
    } catch (error: any) {
      console.error('Connection error:', error);
      alert(`Failed to connect wallet:\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    stellar.disconnect();
    setPublicKey('');
    setIsConnected(false);
    onDisconnect();
  };

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <Card title="🔐 Connect your wallet">
        <p className="text-slate-600 mb-6 text-sm">
          Connect your Stellar wallet to start sending on‑chain apologies on testnet.
        </p>
        
        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-3 rounded-md bg-black px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-[#24130e] border-r-transparent" />
              Connecting...
            </>
          ) : (
            <>
              <FaWallet className="text-base" />
              Connect wallet
            </>
          )}
        </button>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-slate-700 text-xs mb-3 font-medium">
            💡 Supported wallets
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div>✓ Freighter</div>
            <div>✓ xBull</div>
            <div>✓ Albedo</div>
            <div>✓ Rabet</div>
            <div>✓ Lobstr</div>
            <div>✓ Hana</div>
            <div>✓ WalletConnect</div>
            <div>✓ More...</div>
          </div>
          <p className="text-slate-500 text-[11px] mt-3">
            Click &quot;Connect wallet&quot; to choose your preferred wallet.
          </p>
        </div>
      </Card>
    );
  }

  // When connected, header/navbar shows the status; this component becomes minimal.
  return null;
}

