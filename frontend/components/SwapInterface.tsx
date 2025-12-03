"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWalletStore } from "@/store/walletStore";

// Router ABI (simplified)
const ROUTER_ABI = [
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)",
  "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)",
];

export default function SwapInterface() {
  const { signer, provider } = useWalletStore();
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [tokenIn, setTokenIn] = useState("");
  const [tokenOut, setTokenOut] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [loading, setLoading] = useState(false);

  // Load contract addresses from deployment file
  useEffect(() => {
    // In production, load from deployments JSON
    // For now, these would be set after deployment
  }, []);

  const handleSwap = async () => {
    if (!signer || !amountIn || !tokenIn || !tokenOut) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // This is a placeholder - actual implementation would use deployed contract addresses
      const routerAddress = process.env.NEXT_PUBLIC_ROUTER_ADDRESS || "";
      
      if (!routerAddress) {
        alert("Router address not configured. Please deploy contracts first.");
        setLoading(false);
        return;
      }

      const router = new ethers.Contract(routerAddress, ROUTER_ABI, signer);
      const path = [tokenIn, tokenOut];
      const amountInWei = ethers.parseEther(amountIn);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes

      // Get expected output
      const amounts = await router.getAmountsOut(amountInWei, path);
      const expectedOut = amounts[1];
      const slippageAmount = (expectedOut * BigInt(1000 - parseFloat(slippage) * 10)) / BigInt(1000);
      
      const tx = await router.swapExactTokensForTokens(
        amountInWei,
        slippageAmount,
        path,
        await signer.getAddress(),
        deadline
      );

      await tx.wait();
      alert("Swap successful!");
      setAmountIn("");
      setAmountOut("");
    } catch (error: any) {
      console.error("Swap error:", error);
      alert(`Swap failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-white mb-2">Token In</label>
          <input
            type="text"
            value={tokenIn}
            onChange={(e) => setTokenIn(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
          />
        </div>
        <div>
          <label className="block text-white mb-2">Amount In</label>
          <input
            type="number"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            placeholder="0.0"
            className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
          />
        </div>
        <div>
          <label className="block text-white mb-2">Token Out</label>
          <input
            type="text"
            value={tokenOut}
            onChange={(e) => setTokenOut(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
          />
        </div>
        <div>
          <label className="block text-white mb-2">Slippage Tolerance (%)</label>
          <input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            step="0.1"
            className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
          />
        </div>
        <button
          onClick={handleSwap}
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Swapping..." : "Swap"}
        </button>
      </div>
    </div>
  );
}

