/**
 * Example Components
 * 
 * These are example components you can use as inspiration for your UI.
 * Feel free to modify, delete, or create your own components!
 */

'use client';

import { useState } from 'react';

// Example: Loading Spinner
export function LoadingSpinner() {
  return (
    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  );
}

// Example: Balance Card
export function BalanceCard({ 
  balance, 
  label 
}: { 
  balance: string; 
  label: string; 
}) {
  return (
    <div className="rounded-xl p-6 shadow-sm border-2 border-black bg-white">
      <p className="text-slate-600 text-sm mb-2">{label}</p>
      <p className="text-4xl font-bold text-black">{balance}</p>
    </div>
  );
}

// Example: Transaction Item
export function TransactionItem({
  type,
  amount,
  asset,
  date,
  hash,
  explorerLink,
}: {
  type: string;
  amount?: string;
  asset?: string;
  date: string;
  hash: string;
  explorerLink: string;
}) {
  return (
    <div className="bg-white hover:bg-slate-50 rounded-lg p-4 transition-colors border-2 border-black">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-black font-semibold">
            {type === 'payment' ? '💸' : '📝'} {type}
          </p>
          {amount && (
            <p className="text-slate-700">
              {amount} {asset || 'XLM'}
            </p>
          )}
        </div>
        
        <a
          href={explorerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-black hover:text-slate-700 text-sm underline"
        >
          View →
        </a>
      </div>
      <div className="flex justify-between text-xs text-slate-600">
        <span>{new Date(date).toLocaleString()}</span>
        <span className="font-mono">{hash.slice(0, 8)}...</span>
      </div>
    </div>
  );
}

// Example: Copy to Clipboard Button
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-black hover:text-slate-700 text-sm underline"
    >
      {copied ? '✓ Copied!' : '📋 Copy'}
    </button>
  );
}

// Example: Alert/Toast Component
export function Alert({
  type,
  message,
  onClose,
}: {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className="bg-white text-slate-900 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg flex justify-between items-center border-2 border-black"
    >
      <span className="text-sm">
        <span className="font-semibold mr-2">
          {type === 'success' ? 'Success:' : type === 'error' ? 'Error:' : 'Info:'}
        </span>
        {message}
      </span>
      <button
        onClick={onClose}
        className="ml-4 text-slate-700 hover:text-black"
      >
        ✕
      </button>
    </div>
  );
}

// Example: Card Component
export function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="p-6">
      {title && (
        <h2 className="text-xl font-semibold text-slate-900 mb-4">{title}</h2>
      )}
      {children}
      </div>
    </div>
  );
}

// Example: Input Component
export function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-slate-200 text-xs font-medium mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border-2 border-slate-900 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50"
      />
      {error && <p className="text-black text-xs mt-1 underline">{error}</p>}
    </div>
  );
}

// Example: Button Component
export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  const variants = {
    primary: 'bg-black text-white hover:bg-slate-900',
    secondary: 'bg-white text-slate-900 hover:bg-slate-50 border-2 border-slate-900',
    danger: 'bg-black text-white hover:bg-slate-900',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${
        fullWidth ? 'w-full' : ''
      } inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium px-4 py-2 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

// Example: Empty State Component
export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-slate-900 text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

// Example: Modal Component
export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}