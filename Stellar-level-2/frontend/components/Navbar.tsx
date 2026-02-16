import Link from "next/link";
import ConnectWallet from "./ConnectWallet";
import { Coffee } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="fixed w-full border-b border-amber-950/30 bg-stone-950/80 backdrop-blur-xl z-50 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
                        <Coffee size={20} className="fill-current" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-white group-hover:text-amber-100 transition-colors">
                        Buy Me a Coffee
                    </span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link
                        href="/create"
                        className="text-stone-300 hover:text-white font-semibold transition-colors text-sm uppercase tracking-wide hover:underline decoration-amber-500 underline-offset-4"
                    >
                        Create Page
                    </Link>
                    <ConnectWallet />
                </div>
            </div>
        </nav>
    );
}
