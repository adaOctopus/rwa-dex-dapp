"use client";

// Mint page for minting new ERC20 tokens
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navbar from "@/components/Navbar";
import { useWalletStore } from "@/store/walletStore";

const TEST_TOKEN_ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
];

export default function MintPage() {
  const { isConnected, signer, address } = useWalletStore();
  const [tokenAddress, setTokenAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [tokenInfo, setTokenInfo] = useState<{ name: string; symbol: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenAddress && signer && address) {
      loadTokenInfo();
    }
  }, [tokenAddress, signer, address]);

  const loadTokenInfo = async () => {
    if (!signer || !tokenAddress) return;

    try {
      const token = new ethers.Contract(tokenAddress, TEST_TOKEN_ABI, signer);
      const [name, symbol, balance] = await Promise.all([
        token.name(),
        token.symbol(),
        token.balanceOf(address),
      ]);

      setTokenInfo({ name, symbol });
      setTokenBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error loading token info:", error);
      setTokenInfo(null);
    }
  };

  const handleMint = async () => {
    if (!signer || !mintAmount || !tokenAddress) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const token = new ethers.Contract(tokenAddress, TEST_TOKEN_ABI, signer);
      const amountWei = ethers.parseEther(mintAmount);
      
      const tx = await token.mint(address, amountWei);
      await tx.wait();
      
      alert("Tokens minted successfully!");
      setMintAmount("");
      loadTokenInfo();
    } catch (error: any) {
      console.error("Mint error:", error);
      alert(`Mint failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-white text-xl">Please connect your wallet to mint tokens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Mint Tokens</h1>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Token Address (TestToken)</label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
                />
                {tokenInfo && (
                  <p className="text-gray-300 text-sm mt-2">
                    {tokenInfo.name} ({tokenInfo.symbol})
                  </p>
                )}
              </div>
              <div>
                <label className="block text-white mb-2">Amount to Mint</label>
                <input
                  type="number"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  placeholder="0.0"
                  className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
                />
              </div>
              {tokenBalance !== "0" && (
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-white text-sm mb-1">Your Balance</p>
                  <p className="text-2xl font-bold text-white">{tokenBalance} {tokenInfo?.symbol || "Tokens"}</p>
                </div>
              )}
              <button
                onClick={handleMint}
                disabled={loading || !mintAmount || !tokenAddress}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Minting..." : "Mint Tokens"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

