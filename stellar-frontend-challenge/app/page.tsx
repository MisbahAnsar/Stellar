/**
 * Stellar Payment Dashboard - Main Page
 * 
 * This is the main page that brings all components together.
 * All blockchain logic is in lib/stellar-helper.ts (DO NOT MODIFY)
 * 
 * Your job: Make this UI/UX amazing! 🎨
 */

'use client';

import { useState } from 'react';
import PaymentForm from '@/components/PaymentForm';
import TransactionHistory from '@/components/TransactionHistory';
import { stellar } from '@/lib/stellar-helper';

export default function Home() {
  const [publicKey, setPublicKey] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [navbarBalance, setNavbarBalance] = useState<string | null>(null);
  const [navbarBalanceLoading, setNavbarBalanceLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const refreshNavbarBalance = async (key: string) => {
    try {
      setNavbarBalanceLoading(true);
      const balanceData = await stellar.getBalance(key);
      setNavbarBalance(balanceData.xlm);
    } catch (error) {
      console.error('Error fetching navbar balance:', error);
    } finally {
      setNavbarBalanceLoading(false);
    }
  };

  const handleConnected = async (key: string) => {
    setPublicKey(key);
    setIsConnected(true);
    await refreshNavbarBalance(key);
  };

  const handleConnectClick = async () => {
    try {
      setConnecting(true);
      const key = await stellar.connectWallet();
      await handleConnected(key);
    } catch (error: any) {
      console.error('Connection error:', error);
      
      // Show user-friendly error message
      let errorMessage = error.message || 'Failed to connect wallet';
      
      if (errorMessage.includes('not installed')) {
        errorMessage = 
          'Freighter wallet is not installed.\n\n' +
          'Please install Freighter extension first:\n' +
          'https://freighter.app\n\n' +
          'After installing, refresh this page and try again.';
      } else if (errorMessage.includes('not connected') || errorMessage.includes('not unlocked')) {
        errorMessage = 
          'Freighter wallet is not connected or unlocked.\n\n' +
          'Please unlock your Freighter wallet and try again.';
      }
      
      alert(`Failed to connect wallet:\n${errorMessage}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    stellar.disconnect();
    setPublicKey('');
    setIsConnected(false);
    setNavbarBalance(null);
    setWalletMenuOpen(false);
  };

  const handlePaymentSuccess = () => {
    // Refresh balance and transaction history
    setRefreshKey(prev => prev + 1);
    if (publicKey) {
      refreshNavbarBalance(publicKey);
    }
    // Show success toast
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 5000);
  };

  const handleCopyNavbarAddress = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const formatShortAddress = (address: string) => {
    return stellar.formatAddress(address, 4, 4);
  };

  const formatNavbarBalance = (balance: string | null) => {
    if (!balance) return '--';
    const num = parseFloat(balance);
    if (Number.isNaN(num)) return '--';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Success Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down w-[calc(100%-2rem)] max-w-md">
          <div className="bg-black text-white px-4 py-3 sm:px-6 sm:py-4 rounded-lg shadow-2xl flex items-center gap-2 sm:gap-3 border-2 border-black">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-black text-base sm:text-xl font-bold">✓</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base sm:text-lg">Sent successfully</p>
              <p className="text-xs sm:text-sm text-slate-100">A small step to make it right</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="ml-2 text-white/80 hover:text-white text-lg sm:text-xl flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-6">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border border-slate-700 bg-slate-900 text-xs sm:text-sm font-semibold tracking-wide text-slate-50">
                Make It Right
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Balance pill */}
              <button
                type="button"
                disabled={!isConnected}
                className="hidden sm:inline-flex h-9 items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-2 sm:px-3 text-xs sm:text-sm font-medium text-slate-50 shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-300 disabled:pointer-events-none disabled:opacity-50"
              >
                <span className="mr-1.5 h-2 w-2 rounded-full bg-slate-50 inline-block" />
                {navbarBalanceLoading
                  ? 'Balance: ...'
                  : `Balance: ${formatNavbarBalance(navbarBalance)} XLM`}
              </button>
              {/* Mobile balance - shorter version */}
              {isConnected && !navbarBalanceLoading && navbarBalance && (
                <button
                  type="button"
                  disabled
                  className="sm:hidden inline-flex h-8 items-center justify-center rounded-md border border-slate-700 bg-slate-900 px-2 text-xs font-medium text-slate-50 shadow-sm disabled:opacity-60"
                >
                  <span className="mr-1 h-1.5 w-1.5 rounded-full bg-slate-50 inline-block" />
                  {formatNavbarBalance(navbarBalance)}
                </button>
              )}

              {/* Connect / wallet button with dropdown when connected */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (!isConnected) {
                      void handleConnectClick();
                    } else {
                      setWalletMenuOpen(open => !open);
                    }
                  }}
                  className="inline-flex h-8 sm:h-9 items-center justify-center rounded-md bg-slate-900 px-2 sm:px-4 text-xs sm:text-sm font-medium text-white shadow transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50"
                  disabled={connecting}
                >
                  {isConnected && publicKey ? (
                    <span className="flex items-center gap-1 sm:gap-2">
                      <span className="text-[10px] sm:text-xs font-medium">
                        {formatShortAddress(publicKey)}
                      </span>
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wide opacity-80">
                        ▾
                      </span>
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm">
                      {connecting ? 'Connecting…' : 'Connect'}
                    </span>
                  )}
                </button>

                {isConnected && publicKey && walletMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md border border-slate-700 bg-slate-900 shadow-lg overflow-hidden z-20">
                    <button
                      type="button"
                      onClick={handleCopyNavbarAddress}
                      className="w-full px-4 py-2 text-left text-sm text-slate-50 hover:bg-slate-800 transition-colors"
                    >
                      Copy address
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="w-full px-4 py-2 text-left text-sm text-slate-50 hover:bg-slate-800 border-t border-slate-700"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
        {!isConnected ? (
          /* Hero - when not connected */
          <section className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center min-h-[60vh] sm:min-h-[70vh]">
            {/* Left side: Header, description, button */}
            <div className="space-y-4 sm:space-y-6">
              <h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-black leading-tight sm:leading-[75px] heading-serif text-slate-50"
              >
                Make things right, one on‑chain apology at a time.
              </h1>
              <p 
                className="text-xs sm:text-sm md:text-[14px] font-normal leading-relaxed sm:leading-[22.75px] text-slate-300"
              >
                Connect your wallet, choose who you owe an apology to, and attach a short message to make things right.
                We&apos;ll handle the Stellar testnet payment so your gesture lands quickly and clearly.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => void handleConnectClick()}
                  disabled={connecting}
                  className="w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 sm:px-6 text-sm font-medium text-white shadow transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50"
                >
                  {connecting ? 'Connecting…' : 'Connect wallet to get started'}
                </button>
              </div>
            </div>

            {/* Right side: Info panel when not connected */}
            <div className="hidden lg:flex flex-col rounded-lg border border-slate-800 bg-slate-900 p-6 min-h-[320px]">
              <div className="space-y-3">
                <p className="text-[10px] tracking-[0.24em] uppercase text-slate-400">
                  How this works
                </p>
                <p className="text-sm font-medium text-slate-50">
                  Send a small on‑chain apology with a short note attached.
                </p>
                <ol className="mt-2 space-y-2 text-xs text-slate-300 list-decimal list-inside">
                  <li>Connect your Freighter wallet.</li>
                  <li>Enter the address of the person you&apos;re apologizing to.</li>
                  <li>Choose an amount and write a short apology message (max 28 chars).</li>
                  <li>Confirm the transaction in your wallet.</li>
                </ol>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                <p className="text-[11px] font-semibold text-slate-200">
                  Example apology
                </p>
                <div className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2">
                  <p className="text-[11px] text-slate-100 font-mono">
                    &quot;Sorry I dropped the ball on our plans — here&apos;s a small
                    XLM to make it up.&quot;
                  </p>
                </div>
                <p className="text-[11px] text-slate-500">
                  Once you connect, you&apos;ll see the full form and your history on this side.
                </p>
              </div>
            </div>
          </section>
        ) : (
          /* Hero - when connected */
          <section className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* Left side: Header, description, button */}
            <div className="space-y-4 sm:space-y-6">
              <h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[60px] font-black leading-tight sm:leading-[75px] heading-serif text-slate-50"
              >
                Make things right, one on‑chain apology at a time.
              </h1>
              <p 
                className="text-xs sm:text-sm md:text-[14px] font-normal leading-relaxed sm:leading-[22.75px] text-slate-300"
              >
                Choose who you owe an apology to, send a small XLM amount, and attach a short note so they know you mean it.
                We&apos;ll handle the Stellar testnet payment so your gesture lands quickly and clearly.
              </p>
            </div>

            {/* Right side: Tabbed container */}
            <div className="rounded-lg border border-slate-800 bg-slate-900 shadow-sm w-full text-slate-50">
              {/* Tabs */}
              <div className="flex border-b border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveTab('send')}
                  className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'send'
                      ? 'border-b-2 border-slate-50 text-slate-50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Send apology
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === 'history'
                      ? 'border-b-2 border-slate-50 text-slate-50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Check history
                </button>
              </div>

              {/* Tab content */}
              <div className="p-4 sm:p-6">
                {activeTab === 'send' ? (
                  <div key={`payment-${refreshKey}`}>
                    <PaymentForm publicKey={publicKey} onSuccess={handlePaymentSuccess} />
                  </div>
                ) : (
                  <div key={`history-${refreshKey}`}>
                    <TransactionHistory publicKey={publicKey} />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
