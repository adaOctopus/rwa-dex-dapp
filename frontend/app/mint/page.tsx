"use client";

// Mint page for minting new tokens
import Navbar from "@/components/Navbar";
import { useWalletStore } from "@/store/walletStore";

export default function MintPage() {
  const { isConnected } = useWalletStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Mint Tokens</h1>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <p className="text-white text-center">
              {isConnected ? "Mint functionality coming soon" : "Please connect your wallet"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

