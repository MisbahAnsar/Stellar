"use client";
import { useState, useEffect, useRef } from "react";
import { retrievePublicKey, checkConnection } from "../utils/freighter";
import { classifyStellarError } from "../utils/errors";
import { AlertCircle, Wallet, ChevronDown, LogOut } from "lucide-react";

type WalletOption = "freighter" | "albedo";

export default function ConnectWallet() {
    const [publicKey, setPublicKey] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [showOptions, setShowOptions] = useState(false);
    const [showConnectedMenu, setShowConnectedMenu] = useState(false);
    const connectedMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!showConnectedMenu) return;
        function handleClickOutside(e: MouseEvent) {
            if (connectedMenuRef.current && !connectedMenuRef.current.contains(e.target as Node)) {
                setShowConnectedMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showConnectedMenu]);

    useEffect(() => {
        async function check() {
            try {
                if (await checkConnection()) {
                    const res = await retrievePublicKey();
                    if (res.publicKey) setPublicKey(res.publicKey);
                }
            } catch (err) {
                console.error("Wallet check failed", err);
            }
        }
        check();
    }, []);

    const handleConnect = async (option: WalletOption) => {
        setError("");
        setShowOptions(false);

        if (option === "albedo") {
            setError("Albedo: open albedo.stellar.org to connect. Freighter is supported in-app.");
            return;
        }

        const isInstalled = await checkConnection();
        if (!isInstalled) {
            setError("Wallet not found");
            return;
        }

        const response = await retrievePublicKey();
        if (response.publicKey && typeof response.publicKey === "string") {
            setPublicKey(response.publicKey);
            setError("");
        } else {
            const { message } = classifyStellarError(new Error(response.error || ""));
            setError(message);
        }
    };

    const handleDisconnect = () => {
        setPublicKey("");
        setShowConnectedMenu(false);
    };

    return (
        <div className="flex flex-col items-end relative">
            {publicKey ? (
                <div className="relative" ref={connectedMenuRef}>
                    <button
                        onClick={() => setShowConnectedMenu(!showConnectedMenu)}
                        className="px-5 py-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl font-mono text-sm font-bold flex items-center gap-2 hover:bg-amber-500/20 transition-colors"
                    >
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        {publicKey.length > 8 ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` : publicKey}
                        <ChevronDown size={16} className={showConnectedMenu ? "rotate-180" : ""} />
                    </button>
                    {showConnectedMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 py-2 bg-stone-900 border border-amber-950/50 rounded-xl shadow-2xl z-50 animate-fade-in-up">
                            <button
                                onClick={handleDisconnect}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 text-left text-red-400 font-medium"
                            >
                                <LogOut size={18} />
                                Disconnect
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="relative">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-900 font-bold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 flex items-center gap-2"
                        >
                            Connect Wallet <ChevronDown size={16} />
                        </button>
                        {showOptions && (
                            <div className="absolute top-full right-0 mt-2 w-56 py-2 bg-stone-900 border border-amber-950/50 rounded-xl shadow-2xl z-50 animate-fade-in-up">
                                <button
                                    onClick={() => handleConnect("freighter")}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 text-left text-white font-medium"
                                >
                                    <Wallet size={18} className="text-amber-400" />
                                    Freighter
                                </button>
                                <button
                                    onClick={() => handleConnect("albedo")}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 text-left text-stone-400 font-medium"
                                >
                                    <Wallet size={18} />
                                    Albedo
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="absolute top-full right-0 mt-2 w-72 p-4 bg-stone-900 border border-red-500/50 rounded-xl text-red-200 text-sm shadow-2xl z-50 animate-fade-in-up">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-white mb-1">Connection Failed</p>
                                    {error.toLowerCase().includes("wallet not found") || error.toLowerCase().includes("freighter") ? (
                                        <div className="space-y-2">
                                            <p className="text-stone-300">Install the Freighter extension.</p>
                                            <a
                                                href="https://www.freighter.app/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Download Freighter
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-stone-300 break-words">{error}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
