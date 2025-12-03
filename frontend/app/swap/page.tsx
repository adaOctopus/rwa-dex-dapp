"use client";

// Swap page component for token swapping functionality
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useWalletStore } from "@/store/walletStore";
import SwapInterface from "@/components/SwapInterface";

export default function SwapPage() {
  const { isConnected } = useWalletStore();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-white text-xl">Please connect your wallet to swap tokens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Swap Tokens</h1>
        <div className="max-w-2xl mx-auto">
          <SwapInterface />
        </div>
      </div>
    </div>
  );
}

