"use client";

import { useWalletStore } from "@/store/walletStore";

export default function WalletConnect() {
  const { isConnected, address, connect, disconnect } = useWalletStore();

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-300">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
    >
      Connect Wallet
    </button>
  );
}

