"use client";

// Yield page for yield farming and staking
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navbar from "@/components/Navbar";
import { useWalletStore } from "@/store/walletStore";

const YIELD_FARM_ABI = [
  "function stake(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function getReward() external",
  "function exit() external",
  "function earned(address account) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function rewardPerToken() external view returns (uint256)",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
];

export default function YieldPage() {
  const { isConnected, signer, address } = useWalletStore();
  const [yieldFarmAddress, setYieldFarmAddress] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [stakedBalance, setStakedBalance] = useState("0");
  const [earnedRewards, setEarnedRewards] = useState("0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (yieldFarmAddress && signer && address) {
      loadYieldData();
      const interval = setInterval(loadYieldData, 10000); // Update every 10 seconds
      return () => clearInterval(interval);
    }
  }, [yieldFarmAddress, signer, address]);

  const loadYieldData = async () => {
    if (!signer || !yieldFarmAddress || !address) return;

    try {
      const yieldFarm = new ethers.Contract(yieldFarmAddress, YIELD_FARM_ABI, signer);
      const [staked, earned] = await Promise.all([
        yieldFarm.balanceOf(address),
        yieldFarm.earned(address),
      ]);

      setStakedBalance(ethers.formatEther(staked));
      setEarnedRewards(ethers.formatEther(earned));
    } catch (error) {
      console.error("Error loading yield data:", error);
    }
  };

  const handleStake = async () => {
    if (!signer || !stakeAmount || !yieldFarmAddress) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const yieldFarm = new ethers.Contract(yieldFarmAddress, YIELD_FARM_ABI, signer);
      
      // Get staking token address from contract
      const stakingTokenAbi = ["function stakingToken() external view returns (address)"];
      const stakingTokenAddress = await yieldFarm.stakingToken();
      
      // Approve staking token
      const stakingToken = new ethers.Contract(stakingTokenAddress, ERC20_ABI, signer);
      const amountWei = ethers.parseEther(stakeAmount);
      const allowance = await stakingToken.allowance(address, yieldFarmAddress);
      
      if (allowance < amountWei) {
        const approveTx = await stakingToken.approve(yieldFarmAddress, ethers.MaxUint256);
        await approveTx.wait();
      }

      const tx = await yieldFarm.stake(amountWei);
      await tx.wait();
      
      alert("Staked successfully!");
      setStakeAmount("");
      loadYieldData();
    } catch (error: any) {
      console.error("Stake error:", error);
      alert(`Stake failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!signer || !withdrawAmount || !yieldFarmAddress) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const yieldFarm = new ethers.Contract(yieldFarmAddress, YIELD_FARM_ABI, signer);
      const amountWei = ethers.parseEther(withdrawAmount);
      
      const tx = await yieldFarm.withdraw(amountWei);
      await tx.wait();
      
      alert("Withdrawn successfully!");
      setWithdrawAmount("");
      loadYieldData();
    } catch (error: any) {
      console.error("Withdraw error:", error);
      alert(`Withdraw failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!signer || !yieldFarmAddress) {
      alert("Please configure yield farm address");
      return;
    }

    setLoading(true);
    try {
      const yieldFarm = new ethers.Contract(yieldFarmAddress, YIELD_FARM_ABI, signer);
      const tx = await yieldFarm.getReward();
      await tx.wait();
      
      alert("Rewards claimed successfully!");
      loadYieldData();
    } catch (error: any) {
      console.error("Claim rewards error:", error);
      alert(`Claim failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = async () => {
    if (!signer || !yieldFarmAddress) {
      alert("Please configure yield farm address");
      return;
    }

    setLoading(true);
    try {
      const yieldFarm = new ethers.Contract(yieldFarmAddress, YIELD_FARM_ABI, signer);
      const tx = await yieldFarm.exit();
      await tx.wait();
      
      alert("Exited successfully!");
      loadYieldData();
    } catch (error: any) {
      console.error("Exit error:", error);
      alert(`Exit failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-white text-xl">Please connect your wallet to participate in yield farming</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Yield Farming</h1>
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
            <div className="mb-4">
              <label className="block text-white mb-2">Yield Farm Contract Address</label>
              <input
                type="text"
                value={yieldFarmAddress}
                onChange={(e) => setYieldFarmAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
              />
            </div>
          </div>

          {yieldFarmAddress && (
            <>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Your Position</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="text-gray-300 text-sm mb-1">Staked</p>
                    <p className="text-2xl font-bold text-white">{stakedBalance}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="text-gray-300 text-sm mb-1">Earned Rewards</p>
                    <p className="text-2xl font-bold text-white">{earnedRewards}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Stake</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Amount to Stake</label>
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
                    />
                  </div>
                  <button
                    onClick={handleStake}
                    disabled={loading || !stakeAmount}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? "Staking..." : "Stake"}
                  </button>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Withdraw</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white mb-2">Amount to Withdraw</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
                    />
                  </div>
                  <button
                    onClick={handleWithdraw}
                    disabled={loading || !withdrawAmount}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? "Withdrawing..." : "Withdraw"}
                  </button>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Rewards</h2>
                <div className="space-y-3">
                  <button
                    onClick={handleClaimRewards}
                    disabled={loading || earnedRewards === "0"}
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? "Claiming..." : "Claim Rewards"}
                  </button>
                  <button
                    onClick={handleExit}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? "Exiting..." : "Exit (Withdraw All + Claim)"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

