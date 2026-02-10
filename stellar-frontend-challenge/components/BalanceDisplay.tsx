/**
 * BalanceDisplay Component
 * 
 * Displays user's XLM balance with refresh functionality
 * 
 * Features:
 * - Show XLM balance with nice formatting
 * - Refresh balance button
 * - Loading skeleton/spinner
 * - Multiple asset support (bonus feature ready)
 */

'use client';

import { useState, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaSync, FaCoins } from 'react-icons/fa';
import { Card } from './example-components';

interface BalanceDisplayProps {
  publicKey: string;
}

export default function BalanceDisplay({ publicKey }: BalanceDisplayProps) {
  const [balance, setBalance] = useState<string>('0');
  const [assets, setAssets] = useState<Array<{ code: string; issuer: string; balance: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = async () => {
    try {
      setRefreshing(true);
      const balanceData = await stellar.getBalance(publicKey);
      setBalance(balanceData.xlm);
      setAssets(balanceData.assets);
    } catch (error) {
      console.error('Error fetching balance:', error);
      alert('Failed to fetch balance. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    }
  }, [publicKey]);

  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7,
    });
  };

  if (loading) {
    return (
      <Card title="💰 Your Balance">
        <div className="animate-pulse">
          <div className="h-16 bg-white/5 rounded-lg mb-4"></div>
          <div className="h-10 bg-white/5 rounded-lg w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FaCoins className="text-black" />
          Your Balance
        </h2>
        <button
          onClick={fetchBalance}
          disabled={refreshing}
          className="text-black hover:text-slate-700 disabled:opacity-50 transition-colors"
          title="Refresh balance"
        >
          <FaSync className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* XLM Balance */}
      <div className="bg-white border-2 border-black rounded-xl p-6 mb-4">
        <p className="text-slate-600 text-sm mb-2">Available Balance</p>
        <div className="flex items-baseline gap-2">
          <p className="text-5xl font-bold text-black">
            {formatBalance(balance)}
          </p>
          <p className="text-2xl text-slate-700">XLM</p>
        </div>
        
        {/* USD Estimate (placeholder for bonus feature) */}
        <p className="text-slate-500 text-sm mt-2">
          ≈ ${(parseFloat(balance) * 0.12).toFixed(2)} USD
        </p>
      </div>

      {/* Other Assets */}
      {assets.length > 0 && (
        <div className="space-y-2">
          <p className="text-slate-600 text-sm mb-3">Other Assets</p>
          {assets.map((asset, index) => (
            <div
              key={index}
              className="bg-white border-2 border-black rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="text-black font-semibold">{asset.code}</p>
                <p className="text-slate-500 text-xs font-mono truncate max-w-[200px]">
                  {asset.issuer}
                </p>
              </div>
              <p className="text-black text-lg font-bold">
                {formatBalance(asset.balance)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-white border-2 border-black rounded-lg">
        <p className="text-slate-700 text-xs">
          💡 <strong>Tip:</strong> Keep at least 1 XLM in your account for network reserves.
        </p>
      </div>
    </Card>
  );
}

