/**
 * TransactionHistory Component
 * 
 * Displays recent transactions for the connected wallet
 * 
 * Features:
 * - List recent transactions
 * - Show: amount, from/to, date
 * - Link to Stellar Expert for details
 * - Empty state when no transactions
 * - Loading state
 * - Refresh functionality
 */

'use client';

import { useState, useEffect } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaHistory, FaSync, FaArrowUp, FaArrowDown, FaExternalLinkAlt } from 'react-icons/fa';
import { EmptyState } from './example-components';

interface Transaction {
  id: string;
  type: string;
  amount?: string;
  asset?: string;
  from?: string;
  to?: string;
  createdAt: string;
  hash: string;
}

interface TransactionHistoryProps {
  publicKey: string;
}

export default function TransactionHistory({ publicKey }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limit] = useState(10);

  const fetchTransactions = async () => {
    try {
      setRefreshing(true);
      const txs = await stellar.getRecentTransactions(publicKey, limit);
      setTransactions(txs);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      fetchTransactions();
    }
  }, [publicKey]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatAddress = (address?: string): string => {
    if (!address) return 'N/A';
    return stellar.formatAddress(address, 4, 4);
  };

  const isOutgoing = (tx: Transaction): boolean => {
    return tx.from === publicKey;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-slate-100 rounded-lg border-2 border-slate-900"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <FaHistory className="text-slate-900" />
          Transaction history
        </h2>
        <button
          onClick={fetchTransactions}
          disabled={refreshing}
          className="text-slate-500 hover:text-slate-700 disabled:opacity-50 transition-colors"
          title="Refresh transactions"
        >
          <FaSync className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No Transactions Yet"
          description="Your transaction history will appear here once you start sending or receiving XLM."
        />
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const outgoing = isOutgoing(tx);
            
            return (
              <div
                key={tx.id}
                className="bg-white hover:bg-slate-50 rounded-xl p-3 sm:p-4 transition-all border-2 border-slate-900 hover:border-slate-800"
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-100 text-black">
                      {outgoing ? <FaArrowUp className="text-sm sm:text-base" /> : <FaArrowDown className="text-sm sm:text-base" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-900 font-semibold text-sm sm:text-base">
                        {outgoing ? 'Sent' : 'Received'}
                      </p>
                      {tx.amount && (
                        <p className="text-base sm:text-lg font-bold text-black">
                          {outgoing ? '-' : '+'}{parseFloat(tx.amount).toFixed(2)} {tx.asset || 'XLM'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <a
                    href={stellar.getExplorerLink(tx.hash, 'tx')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black hover:text-slate-700 text-xs sm:text-sm flex items-center gap-1 transition-colors flex-shrink-0 underline"
                  >
                    <span className="hidden sm:inline">Details</span>
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div>
                  <p className="text-slate-500 text-[10px] sm:text-xs mb-1">From</p>
                  <p className="text-slate-800 font-mono text-xs sm:text-sm break-all">{formatAddress(tx.from)}</p>
                  </div>
                  <div>
                  <p className="text-slate-500 text-[10px] sm:text-xs mb-1">To</p>
                  <p className="text-slate-800 font-mono text-xs sm:text-sm break-all">{formatAddress(tx.to)}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t-2 border-slate-900">
                  <p className="text-slate-500 text-[10px] sm:text-xs">{formatDate(tx.createdAt)}</p>
                  <p className="text-slate-400 text-[10px] sm:text-xs font-mono">{tx.hash.slice(0, 12)}...</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {transactions.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-slate-500 text-sm">
            Showing last {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

