"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import WalletConnect from "@/components/WalletConnect";
import { useWalletStore } from "@/store/walletStore";

export default function Home() {
  const { isConnected, address } = useWalletStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to RWA DEX
          </h1>
          <p className="text-xl text-gray-300">
            Decentralized Exchange with AMM, Lending, and Yield Farming
          </p>
        </div>

        {!isConnected ? (
          <div className="max-w-md mx-auto mt-12">
            <WalletConnect />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
              <p className="text-white text-center">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Swap</h2>
                <p className="text-gray-300">Trade tokens with minimal slippage</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Liquidity</h2>
                <p className="text-gray-300">Add liquidity and earn fees</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Lend</h2>
                <p className="text-gray-300">Supply assets and earn interest</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Borrow</h2>
                <p className="text-gray-300">Borrow against your collateral</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Yield</h2>
                <p className="text-gray-300">Stake tokens and earn rewards</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

