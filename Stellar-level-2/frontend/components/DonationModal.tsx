"use client";
import { useState } from "react";
import { X, Heart, Loader2 } from "lucide-react";

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDonate: (amount: string) => Promise<void>;
    campaignName: string;
}

export default function DonationModal({ isOpen, onClose, onDonate, campaignName }: DonationModalProps) {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

        setLoading(true);
        try {
            await onDonate(amount);
            setAmount(""); // Reset on success
            onClose();
        } catch (e) {
            // Error is handled in parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-panel">

                {/* Header */}
                <div className="p-6 border-b border-amber-950/30 flex justify-between items-center bg-stone-800/50">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        Buy a coffee for <span className="text-amber-400 line-clamp-1 max-w-[140px]">{campaignName}</span>
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="text-center mb-2">
                        <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                            <Heart size={32} fill="currentColor" className="text-amber-500/50" />
                        </div>
                        <p className="text-stone-300">
                            Send a coffee with XLM. Enter the amount (in XLM) you’d like to send.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">
                            Donation Amount (XLM)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0.0000001"
                                step="any"
                                required
                                autoFocus
                                placeholder="10"
                                className="w-full pl-4 pr-16 py-3 rounded-xl bg-slate-950/50 border border-slate-700/50 text-white placeholder-slate-500 focus:bg-slate-950 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono text-lg"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">XLM</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !amount || Number(amount) <= 0}
                        className={`w-full py-3.5 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${loading
                                ? "bg-slate-700 cursor-not-allowed"
                                : "bg-gradient-to-r from-amber-600 to-amber-500 hover:shadow-amber-500/25 hover:-translate-y-0.5"
                            }`}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Send Coffee"}
                    </button>
                </form>
            </div>
        </div>
    );
}
