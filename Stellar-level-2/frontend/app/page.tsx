"use client";
import Link from "next/link";
import { ArrowRight, Heart, Users, Shield, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { TransactionBuilder, Networks } from "@stellar/stellar-sdk";
import { Client, Campaign } from "contracts";
import { NATIVE_TOKEN_ADDRESS, RPC_URL, NETWORK_PASSPHRASE } from "../utils/consts";
import { checkConnection, retrievePublicKey } from "../utils/freighter";
import { signTransaction } from "@stellar/freighter-api";
import { toast } from "sonner";
import DonationModal from "../components/DonationModal";
import { classifyStellarError, STELLAR_EXPLORER_TX } from "../utils/errors";

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || process.env.NEXT_PUBLIC_BUY_ME_A_COFFEE_CONTRACT_ID || "";

export default function Home() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<{ id: number; name: string } | null>(null);
  const [userPublicKey, setUserPublicKey] = useState<string>("");

  useEffect(() => {
    async function init() {
      const isConnected = await checkConnection();
      if (isConnected) {
        const wallet = await retrievePublicKey();
        if (wallet.publicKey) {
          setUserPublicKey(wallet.publicKey);
        }
      }
    }
    init();
  }, []);

  async function fetchCampaigns() {
    if (!CONTRACT_ID) {
      setLoading(false);
      return;
    }
    try {
      const client = new Client({
        networkPassphrase: NETWORK_PASSPHRASE,
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        allowHttp: true,
      });

      const count = await client.get_campaign_count();
      const total = Number(count.result);
      const loadedCampaigns = [];

      for (let i = 1; i <= total; i++) {
        try {
          const res = await client.get_campaign({ campaign_id: BigInt(i) });
          if (res.result && res.result.active) {
            loadedCampaigns.push({ ...res.result, id: i });
          }
        } catch (e) {
          console.error(`Failed to fetch campaign ${i}`, e);
        }
      }
      setCampaigns(loadedCampaigns);
    } catch (e) {
      console.error("Error fetching campaigns", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Real-time sync: refetch campaigns periodically so UI reflects contract events (donations, new campaigns)
  useEffect(() => {
    if (!CONTRACT_ID) return;
    const interval = setInterval(fetchCampaigns, 15000);
    return () => clearInterval(interval);
  }, [CONTRACT_ID]);



  const openDonateModal = (campaignId: number, campaignName: string) => {
    setSelectedCampaign({ id: campaignId, name: campaignName });
    setIsModalOpen(true);
  };

  const handleDonate = async (amountStr: string) => {
    if (!selectedCampaign) return;
    if (!CONTRACT_ID) {
      toast.error("Contract not configured", { description: "Set NEXT_PUBLIC_CONTRACT_ID in .env.local (run deploy script)." });
      return;
    }

    try {
      const isConnected = await checkConnection();
      if (!isConnected) {
        toast.error("Wallet not found", { description: "Install Freighter or connect a Stellar wallet." });
        return;
      }

      const wallet = await retrievePublicKey();
      if (!wallet.publicKey) {
        const { message } = classifyStellarError(new Error(wallet.error || ""));
        toast.error("Connection failed", { description: message });
        return;
      }

      const client = new Client({
        networkPassphrase: NETWORK_PASSPHRASE,
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        publicKey: wallet.publicKey,
        allowHttp: true,
      });

      // Amount in stroops (7 decimals)
      const amountBigInt = BigInt(Math.floor(Number(amountStr) * 10_000_000));

      const loadingToast = toast.loading("Transaction pending…", { description: "Approve in your wallet." });

      const tx = await client.donate({
        campaign_id: BigInt(selectedCampaign.id),
        amount: amountBigInt,
        token: NATIVE_TOKEN_ADDRESS,
        from: wallet.publicKey
      });

      const sent = await tx.signAndSend({
        signTransaction: async (xdr: string) => {
          console.log("Signing XDR:", xdr);
          try {
            const parsedTx = TransactionBuilder.fromXDR(xdr, Networks.TESTNET) as any;
            console.log("XDR parsed successfully. Source:", parsedTx.source);
          } catch (e) { console.error("Error parsing XDR:", e); }

          const response = await signTransaction(xdr, {
            networkPassphrase: NETWORK_PASSPHRASE,
          });

          // @ts-ignore
          if (response.error) throw new Error(response.error);

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

      setTimeout(() => window.location.reload(), 2000);
    } catch (e: any) {
      console.error("Donation failed", e);
      toast.dismiss();
      const { type, message } = classifyStellarError(e);
      toast.error(type === "unknown" ? "Transaction failed" : "Transaction failed", { description: message });
      throw e;
    }
  }


  const handleWithdraw = async (campaignId: number, campaignName: string) => {
    try {
      if (!userPublicKey) {
        toast.error("Please connect wallet first");
        return;
      }
      if (!CONTRACT_ID) {
        toast.error("Contract not configured", { description: "Set NEXT_PUBLIC_CONTRACT_ID in .env.local." });
        return;
      }

      const client = new Client({
        networkPassphrase: NETWORK_PASSPHRASE,
        contractId: CONTRACT_ID,
        rpcUrl: RPC_URL,
        publicKey: userPublicKey,
        allowHttp: true,
      });

      const loadingToast = toast.loading("Transaction pending…", { description: "Approve in your wallet." });

      const tx = await client.withdraw({
        campaign_id: BigInt(campaignId),
        token: NATIVE_TOKEN_ADDRESS,
      });

      const sent = await tx.signAndSend({
        signTransaction: async (xdr: string) => {
          console.log("Signing XDR:", xdr);
          try {
            const parsedTx = TransactionBuilder.fromXDR(xdr, Networks.TESTNET) as any;
            console.log("XDR parsed successfully. Source:", parsedTx.source);
          } catch (e) { console.error("Error parsing XDR:", e); }

          const response = await signTransaction(xdr, {
            networkPassphrase: NETWORK_PASSPHRASE,
          });

          // @ts-ignore
          if (response.error) throw new Error(response.error);

          // @ts-ignore
          return { signedTxXdr: response.signedTxXdr };
        }
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

      setTimeout(() => window.location.reload(), 2000);
    } catch (e: any) {
      console.error("Withdrawal failed", e);
      toast.dismiss();
      const { message } = classifyStellarError(e);
      toast.error("Transaction failed", { description: message });
    }
  };

  return (
    <div className="relative overflow-hidden pt-20">

      {/* Hero Section */}
      <div className="relative py-20 sm:py-32">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-amber-300 text-sm font-medium animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            Live on Stellar Testnet
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-6 leading-tight">
            Buy Me a Coffee <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600">
              on Stellar
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-xl text-stone-300 leading-relaxed font-light">
            Support creators with XLM. Create your page, receive coffees on-chain, and withdraw anytime.
            Transparent and trustless on Stellar.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <Link
              href="/create"
              className="px-8 py-4 rounded-full bg-amber-500 text-stone-900 font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Create Your Page <ArrowRight size={20} />
            </Link>
            <a
              href="#campaigns"
              className="px-8 py-4 rounded-full glass text-white font-bold text-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
            >
              Explore Pages
            </a>
          </div>
        </div>

        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] -z-10 mix-blend-screen pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[80px] -z-10 mix-blend-screen pointer-events-none"></div>
      </div>

      {/* Stats / Trust Section */}
      <div className="py-12 border-y border-amber-950/30 bg-stone-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 glass rounded-2xl group hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30 group-hover:scale-110 transition-transform">
                <Shield />
              </div>
              <h3 className="text-lg font-bold text-white">Secure & On-Chain</h3>
              <p className="text-stone-400 mt-2 font-light">Powered by Stellar Smart Contracts.</p>
            </div>
            <div className="p-6 glass rounded-2xl group hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 bg-amber-600/20 text-amber-400 rounded-xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30 group-hover:scale-110 transition-transform">
                <Heart />
              </div>
              <h3 className="text-lg font-bold text-white">Direct Support</h3>
              <p className="text-stone-400 mt-2 font-light">Coffees go straight to the page owner.</p>
            </div>
            <div className="p-6 glass rounded-2xl group hover:bg-white/5 transition-colors">
              <div className="w-12 h-12 bg-yellow-600/20 text-yellow-400 rounded-xl flex items-center justify-center mx-auto mb-4 border border-yellow-500/30 group-hover:scale-110 transition-transform">
                <Users />
              </div>
              <h3 className="text-lg font-bold text-white">Community Love</h3>
              <p className="text-stone-400 mt-2 font-light">Support creators you care about.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div id="campaigns" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              Coffee Pages <Sparkles className="text-amber-300" size={24} />
            </h2>
            <p className="text-stone-400 mt-2">Support creators with a coffee.</p>
          </div>
          {/* <Link href="/explore" className="text-blue-400 font-semibold hover:text-blue-300 flex items-center gap-1 transition-colors">View All <ArrowRight size={16} /></Link> */}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-amber-500" size={48} />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-20 bg-stone-900/30 rounded-3xl border border-amber-950/30">
            <p className="text-stone-400 text-lg">No coffee pages yet.</p>
            <Link href="/create" className="mt-4 inline-block px-6 py-3 bg-amber-600 rounded-xl text-white font-bold hover:bg-amber-500 transition-colors">Create the first one!</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="group glass-panel rounded-3xl hover:shadow-2xl hover:shadow-amber-900/20 hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col border border-amber-950/20">
                <div className="h-48 bg-gradient-to-br from-stone-800 to-stone-900 p-6 flex items-end relative overflow-hidden">
                  <div className="absolute inset-0 bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors"></div>
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Heart size={100} />
                  </div>
                  <span className="relative px-3 py-1 bg-amber-500/20 backdrop-blur-md text-amber-200 text-xs font-bold rounded-full border border-amber-500/30">
                    Coffee Page
                  </span>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {campaign.name}
                    </h3>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                        style={{ width: `${Math.min((Number(campaign.balance) / Number(campaign.target)) * 100, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-stone-500 text-xs uppercase font-bold tracking-wider">Raised</p>
                        <p className="font-bold text-white text-lg">{(Number(campaign.balance) / 10000000).toLocaleString()} <span className="text-sm font-normal text-stone-500">XLM</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-stone-500 text-xs uppercase font-bold tracking-wider">Target</p>
                        <p className="font-bold text-white text-lg">{(Number(campaign.target) / 10000000).toLocaleString().replace(/,/g, '')} <span className="text-sm font-normal text-stone-500">XLM</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-amber-950/20 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-stone-400">
                      <TrendingUp size={14} className="text-green-500" />
                      <span className="text-sm font-medium">Active</span>
                    </div>

                    {userPublicKey === campaign.owner ? (
                      <button
                        onClick={() => handleWithdraw(campaign.id, campaign.name)}
                        className="px-5 py-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/50 text-sm font-bold rounded-xl hover:bg-amber-500/20 transition-colors shadow-lg active:scale-95 flex items-center gap-2"
                      >
                        Withdraw
                      </button>
                    ) : (
                      <button
                        onClick={() => openDonateModal(campaign.id, campaign.name)}
                        className="px-5 py-2.5 bg-amber-500 text-stone-900 text-sm font-bold rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 active:scale-95"
                      >
                        Buy a Coffee
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDonate={handleDonate}
        campaignName={selectedCampaign?.name || ""}
      />
    </div>
  );
}
