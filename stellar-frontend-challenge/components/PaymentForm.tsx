/**
 * PaymentForm Component
 * 
 * Allows users to send XLM payments
 * 
 * Features:
 * - Input for recipient address
 * - Input for amount
 * - Optional memo field
 * - Form validation
 * - Success message with transaction hash
 * - Error handling with user-friendly messages
 */

'use client';

import { useState } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaPaperPlane, FaCheckCircle } from 'react-icons/fa';
import { Input, Button, Alert } from './example-components';

interface PaymentFormProps {
  publicKey: string;
  onSuccess?: () => void;
}

export default function PaymentForm({ publicKey, onSuccess }: PaymentFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string; memo?: string }>({});
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [txHash, setTxHash] = useState('');

  const validateForm = (): boolean => {
    const newErrors: { recipient?: string; amount?: string; memo?: string } = {};

    // Validate recipient address
    if (!recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else if (recipient.length !== 56 || !recipient.startsWith('G')) {
      newErrors.recipient = 'Invalid Stellar address (must start with G and be 56 characters)';
    }

    // Validate amount
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      } else if (numAmount < 0.0000001) {
        newErrors.amount = 'Amount is too small (minimum: 0.0000001 XLM)';
      }
    }

    // Validate message length (Stellar memos support up to 28 bytes for text memos)
    if (memo && memo.length > 28) {
      newErrors.memo = 'Message must be 28 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setAlert(null);
      setTxHash('');

      const result = await stellar.sendPayment({
        from: publicKey,
        to: recipient,
        amount: amount,
        memo: memo || undefined,
      });

      if (result.success) {
        setTxHash(result.hash);
        setAlert({
          type: 'success',
          message: `Sent successfully.`,
        });
        
        // Clear form
        setRecipient('');
        setAmount('');
        setMemo('');
        setErrors({});

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }

        // Scroll to success message to ensure user sees it
        setTimeout(() => {
          const successElement = document.getElementById('transaction-success');
          if (successElement) {
            successElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      let errorMessage = 'Failed to send payment. ';

      // Try to parse detailed Horizon error codes if available
      const resultCodes = error?.response?.data?.extras?.result_codes;
      const opCode: string | undefined = Array.isArray(resultCodes?.operations)
        ? resultCodes.operations[0]
        : undefined;
      const txCode: string | undefined = resultCodes?.transaction;

      if (opCode === 'op_underfunded' || txCode === 'tx_insufficient_balance') {
        errorMessage += 'Insufficient balance.';
      } else if (opCode === 'op_no_destination') {
        errorMessage += 'Destination account does not exist or is not funded.';
      } else if (opCode === 'op_low_reserve') {
        errorMessage += 'Balance too low to meet minimum reserve requirements.';
      } else if (txCode === 'tx_bad_auth') {
        errorMessage += 'Transaction could not be authorized. Please reconnect your wallet and try again.';
      } else if (error.message && error.message.includes('insufficient')) {
        errorMessage += 'Insufficient balance.';
      } else if (error.message && error.message.includes('destination')) {
        errorMessage += 'Invalid destination account.';
      } else if (error.message && error.message.includes('max 28 bytes')) {
        errorMessage += 'Message is too long (maximum 28 characters).';
      } else {
        errorMessage += error.message || 'Please try again.';
      }

      setAlert({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {alert && (
        <div className="mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {txHash && (
        <div 
          id="transaction-success"
          className="mb-4 p-3 sm:p-5 bg-white border-2 border-black rounded-lg animate-pulse shadow-lg"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-full flex items-center justify-center animate-bounce">
                <FaCheckCircle className="text-white text-base sm:text-xl" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-black font-bold text-sm sm:text-lg mb-1">✅ Apology sent successfully</p>
              <p className="text-slate-700 text-xs sm:text-sm mb-2 sm:mb-3">Your transaction has been confirmed on Stellar testnet.</p>
              <div className="bg-white p-2 sm:p-3 rounded border border-black/20 mb-2 sm:mb-3">
                <p className="text-slate-600 text-[10px] sm:text-xs font-medium mb-1">Transaction Hash:</p>
                <p className="text-slate-800 text-[10px] sm:text-xs font-mono break-all">{txHash}</p>
              </div>
              <a
                href={stellar.getExplorerLink(txHash, 'tx')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 sm:gap-2 text-black hover:text-slate-700 font-semibold text-xs sm:text-sm underline"
              >
                View on Stellar Expert →
              </a>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Recipient Address"
          placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          value={recipient}
          onChange={setRecipient}
          error={errors.recipient}
        />

        <Input
          label="Amount (XLM)"
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={setAmount}
          error={errors.amount}
        />

        <Input
          label="Message (Optional)"
          placeholder="Add a short apology note..."
          value={memo}
          onChange={setMemo}
          error={errors.memo}
        />

        <div className="pt-2">
          <Button
            onClick={() => {}}
            variant="primary"
            disabled={loading}
            fullWidth
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
                Sending...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FaPaperPlane />
                Send apology
              </span>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-white border-2 border-slate-900 rounded-lg">
        <p className="text-slate-800 text-xs">
          ⚠️ <strong>Double‑check</strong> the recipient address before sending. Transactions on the blockchain are irreversible.
        </p>
      </div>
    </div>
  );
}

