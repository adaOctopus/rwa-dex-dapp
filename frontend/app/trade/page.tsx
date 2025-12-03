"use client";

// Trade page for liquidity management (add/remove liquidity)
import Navbar from "@/components/Navbar";
import { useWalletStore } from "@/store/walletStore";
import LiquidityInterface from "@/components/LiquidityInterface";
import OraclePrice from "@/components/OraclePrice";

export default function TradePage() {
  const { isConnected } = useWalletStore();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-white text-xl">Please connect your wallet to manage liquidity</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Liquidity Management</h1>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <LiquidityInterface />
          </div>
          <div>
            <OraclePrice />
          </div>
        </div>
      </div>
    </div>
  );
}

