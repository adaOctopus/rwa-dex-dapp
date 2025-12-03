"use client";

// Oracle price feed component for displaying token prices
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWalletStore } from "@/store/walletStore";

const ORACLE_ABI = [
  "function getPrice(address tokenA, address tokenB) external view returns (uint256 price)",
  "function consult(address tokenIn, uint256 amountIn, address tokenOut) external view returns (uint256 amountOut)",
];

export default function OraclePrice() {
  const { provider } = useWalletStore();
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [price, setPrice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPrice = async () => {
    if (!provider || !tokenA || !tokenB) return;

    setLoading(true);
    try {
      const oracleAddress = process.env.NEXT_PUBLIC_ORACLE_ADDRESS || "";
      if (!oracleAddress) {
        alert("Oracle address not configured");
        setLoading(false);
        return;
      }

      const oracle = new ethers.Contract(oracleAddress, ORACLE_ABI, provider);
      const priceWei = await oracle.getPrice(tokenA, tokenB);
      const priceFormatted = ethers.formatEther(priceWei);
      setPrice(priceFormatted);
    } catch (error: any) {
      console.error("Error fetching price:", error);
      alert(`Failed to fetch price: ${error.message}`);
      setPrice(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenA && tokenB) {
      fetchPrice();
      const interval = setInterval(fetchPrice, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [tokenA, tokenB, provider]);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Price Oracle</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-white mb-2">Token A Address</label>
          <input
            type="text"
            value={tokenA}
            onChange={(e) => setTokenA(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
          />
        </div>
        <div>
          <label className="block text-white mb-2">Token B Address</label>
          <input
            type="text"
            value={tokenB}
            onChange={(e) => setTokenB(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
          />
        </div>
        {price && (
          <div className="bg-white/20 rounded-lg p-4">
            <p className="text-white text-sm mb-1">Current Price</p>
            <p className="text-2xl font-bold text-white">{price} {tokenB.slice(0, 6)}... / {tokenA.slice(0, 6)}...</p>
          </div>
        )}
        <button
          onClick={fetchPrice}
          disabled={loading || !tokenA || !tokenB}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh Price"}
        </button>
      </div>
    </div>
  );
}

