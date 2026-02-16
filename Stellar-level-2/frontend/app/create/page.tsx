"use client";
import { useState } from "react";
import { toast } from "sonner";
import { checkConnection, retrievePublicKey } from "../../utils/freighter";
import { classifyStellarError, STELLAR_EXPLORER_TX } from "../../utils/errors";
import { Wallet, Calendar, DollarSign, Type, Sparkles } from "lucide-react";
import { Client } from "contracts";
import { signTransaction } from "@stellar/freighter-api";
import { RPC_URL, NETWORK_PASSPHRASE } from "../../utils/consts";
import { TransactionBuilder, Networks } from "@stellar/stellar-sdk";

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_CONTRACT_ID || "";

export default function CreateCampaign() {
    const [formData, setFormData] = useState({
        name: "",
        target: "",
        deadline: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const isConnected = await checkConnection();
            if (!isConnected) {
                toast.error("Wallet not found", { description: "Install Freighter or connect a Stellar wallet." });
                setLoading(false);
                return;
            }

            const wallet = await retrievePublicKey();
            if (!wallet.publicKey) {
                const { message } = classifyStellarError(new Error(wallet.error || ""));
                toast.error("Connection failed", { description: message });
                setLoading(false);
                return;
            }

            console.log("Creating campaign:", formData);
            console.log("Using Passphrase:", NETWORK_PASSPHRASE);
            console.log("Contract ID:", CONTRACT_ID);

            if (!CONTRACT_ID) {
                toast.error("Contract ID not set. Please check configuration.");
                setLoading(false);
                return;
            }

            const client = new Client({
                networkPassphrase: NETWORK_PASSPHRASE,
                contractId: CONTRACT_ID,
                rpcUrl: RPC_URL,
                publicKey: wallet.publicKey,
                allowHttp: true,
            });

            // Convert deadline to unix timestamp (seconds)
            const deadlineDate = new Date(formData.deadline);
            const deadlineEpoch = BigInt(Math.floor(deadlineDate.getTime() / 1000));
            const targetAmount = BigInt(Math.floor(Number(formData.target) * 10_000_000));

            const loadingToast = toast.loading("Transaction pending…", { description: "Approve in your wallet." });

            console.log("Invoking contract...", {
                name: formData.name,
                target: targetAmount,
                deadline: deadlineEpoch,
                owner: wallet.publicKey
            });

            // Prepare transaction
            // Note: generate bindings expects {name: string, target: i128, deadline: u64, owner: string}
            // i128 and u64 are BigInts in JS environment usually, or strings depending on spec. 30:60 in generated code imports u64 etc but types are aliases to bigint or number.
            // We assume BigInt.
            const tx = await client.create_campaign({
                name: formData.name,
                target: targetAmount,
                deadline: deadlineEpoch,
                owner: wallet.publicKey,
            });

            console.log("Transaction built, signing...");

            const sent = await tx.signAndSend({
                signTransaction: async (xdr: string) => {
                    console.log("Signing XDR:", xdr);
                    try {
                        const parsedTx = TransactionBuilder.fromXDR(xdr, Networks.TESTNET) as any;
                        console.log("XDR parsed successfully. Source account:", parsedTx.source);
                    } catch (e) { console.error("Error parsing XDR:", e); }

                    const response = await signTransaction(xdr, {
                        networkPassphrase: NETWORK_PASSPHRASE,
                    });

                    // @ts-ignore
                    if (response.error) throw new Error(response.error);
                    // @ts-ignore
                    if (!response.signedTxXdr) throw new Error("User declined or Freighter failed to sign");
                    // @ts-ignore
                    return { signedTxXdr: response.signedTxXdr };
                },
            });

            toast.dismiss(loadingToast);
            const txHash = (sent as any).sendTransactionResponse?.hash ?? String(sent.result);
            toast.success("Transaction successful", {
                description: (
                    <a href={`${STELLAR_EXPLORER_TX}/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">
                        View on Stellar Explorer
                    </a>
                ),
                duration: 8000,
            });

            // Reset form
            setFormData({
                name: "",
                target: "",
                deadline: "",
                description: "",
            });

        } catch (err: any) {
            console.error("Campaign creation failed:", err);
            toast.dismiss();
            const { message } = classifyStellarError(err);
            toast.error("Transaction failed", { description: message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
                        Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">Coffee Page</span>
                    </h1>
                    <p className="mt-4 text-lg text-stone-400 max-w-2xl mx-auto">
                        Set a goal and let supporters buy you a coffee with XLM on Stellar.
                    </p>
                </div>

                <div className="glass-panel rounded-3xl shadow-2xl overflow-hidden border border-white/10">
                    <div className="p-8 md:p-12 relative">
                        {/* Decorative blob */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-500/20 blur-3xl rounded-full pointer-events-none"></div>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">

                            {/* Campaign Basics */}
                            <div className="space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
                                        <Type size={18} className="text-blue-400" /> Campaign Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-5 py-4 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-500 focus:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                                        placeholder="e.g., Help Build a Community Garden"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
                                            <DollarSign size={18} className="text-green-400" /> Target Amount (XLM)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                className="w-full pl-5 pr-16 py-4 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-500 focus:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium font-mono text-lg"
                                                placeholder="5000"
                                                value={formData.target}
                                                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-slate-500">XLM</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-300 mb-2">
                                            <Calendar size={18} className="text-purple-400" /> Deadline
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-5 py-4 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-500 focus:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium [color-scheme:dark]"
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        required
                                        rows={6}
                                        className="w-full px-5 py-4 rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-500 focus:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium resize-none"
                                        placeholder="Tell your story. Why is this cause important? (Note: Description is currently stored locally)"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 text-white font-bold text-lg rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${loading
                                        ? "bg-slate-700 cursor-not-allowed"
                                        : "bg-gradient-to-r from-amber-600 to-amber-500 hover:shadow-amber-500/25 hover:-translate-y-1"
                                        }`}
                                >
                                    {loading ? "Creating on Blockchain..." : <><Sparkles size={20} className="text-amber-300" /> Create Coffee Page</>}
                                </button>
                                <p className="text-center text-slate-500 text-sm mt-4">
                                    Requires Freighter Wallet connection & Testnet XLM.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
