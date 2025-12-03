"use client";

// Liquidity management component for adding and removing liquidity from pools
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWalletStore } from "@/store/walletStore";

const ROUTER_ABI = [
  "function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) external returns (uint256 amountA, uint256 amountB)",
  "function getAmountsOut(uint256 amountIn, address[] calldata path) external view returns (uint256[] memory amounts)",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
];

const PAIR_ABI = [
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
];

export default function LiquidityInterface() {
  const { signer, address } = useWalletStore();
  const [action, setAction] = useState<"add" | "remove">("add");
  const [tokenA, setTokenA] = useState("");
  const [tokenB, setTokenB] = useState("");
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [liquidity, setLiquidity] = useState("");
  const [lpBalance, setLpBalance] = useState("0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (action === "remove" && signer && tokenA && tokenB) {
      loadLpBalance();
    }
  }, [action, signer, tokenA, tokenB, address]);

  const loadLpBalance = async () => {
    if (!signer || !tokenA || !tokenB) return;

    try {
      const routerAddress = process.env.NEXT_PUBLIC_ROUTER_ADDRESS || "";
      const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "";
      
      if (!routerAddress || !factoryAddress) return;

      // Get pair address from factory
      const factoryAbi = ["function getPair(address tokenA, address tokenB) external view returns (address pair)"];
      const factory = new ethers.Contract(factoryAddress, factoryAbi, signer);
      const pairAddress = await factory.getPair(tokenA, tokenB);

      if (pairAddress === ethers.ZeroAddress) {
        setLpBalance("0");
        return;
      }

      const pair = new ethers.Contract(pairAddress, PAIR_ABI, signer);
      const balance = await pair.balanceOf(address);
      setLpBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error loading LP balance:", error);
    }
  };

  const handleAddLiquidity = async () => {
    if (!signer || !amountA || !amountB || !tokenA || !tokenB) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const routerAddress = process.env.NEXT_PUBLIC_ROUTER_ADDRESS || "";
      if (!routerAddress) {
        alert("Router address not configured");
        setLoading(false);
        return;
      }

      const router = new ethers.Contract(routerAddress, ROUTER_ABI, signer);
      const tokenAContract = new ethers.Contract(tokenA, ERC20_ABI, signer);
      const tokenBContract = new ethers.Contract(tokenB, ERC20_ABI, signer);

      // Check and approve tokens
      const amountAWei = ethers.parseEther(amountA);
      const amountBWei = ethers.parseEther(amountB);
      
      const allowanceA = await tokenAContract.allowance(address, routerAddress);
      if (allowanceA < amountAWei) {
        const approveTx = await tokenAContract.approve(routerAddress, ethers.MaxUint256);
        await approveTx.wait();
      }

      const allowanceB = await tokenBContract.allowance(address, routerAddress);
      if (allowanceB < amountBWei) {
        const approveTx = await tokenBContract.approve(routerAddress, ethers.MaxUint256);
        await approveTx.wait();
      }

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      const tx = await router.addLiquidity(
        tokenA,
        tokenB,
        amountAWei,
        amountBWei,
        (amountAWei * BigInt(95)) / BigInt(100), // 5% slippage
        (amountBWei * BigInt(95)) / BigInt(100),
        address,
        deadline
      );

      await tx.wait();
      alert("Liquidity added successfully!");
      setAmountA("");
      setAmountB("");
      loadLpBalance();
    } catch (error: any) {
      console.error("Add liquidity error:", error);
      alert(`Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!signer || !liquidity || !tokenA || !tokenB) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const routerAddress = process.env.NEXT_PUBLIC_ROUTER_ADDRESS || "";
      if (!routerAddress) {
        alert("Router address not configured");
        setLoading(false);
        return;
      }

      const router = new ethers.Contract(routerAddress, ROUTER_ABI, signer);
      
      // Get pair address
      const factoryAddress = process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "";
      const factoryAbi = ["function getPair(address tokenA, address tokenB) external view returns (address pair)"];
      const factory = new ethers.Contract(factoryAddress, factoryAbi, signer);
      const pairAddress = await factory.getPair(tokenA, tokenB);

      if (pairAddress === ethers.ZeroAddress) {
        alert("Pair does not exist");
        setLoading(false);
        return;
      }

      // Approve LP tokens
      const pair = new ethers.Contract(pairAddress, PAIR_ABI, signer);
      const liquidityWei = ethers.parseEther(liquidity);
      const allowance = await pair.allowance(address, routerAddress);
      
      if (allowance < liquidityWei) {
        const approveTx = await pair.approve(routerAddress, ethers.MaxUint256);
        await approveTx.wait();
      }

      const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
      const tx = await router.removeLiquidity(
        tokenA,
        tokenB,
        liquidityWei,
        0, // amountAMin
        0, // amountBMin
        address,
        deadline
      );

      await tx.wait();
      alert("Liquidity removed successfully!");
      setLiquidity("");
      loadLpBalance();
    } catch (error: any) {
      console.error("Remove liquidity error:", error);
      alert(`Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setAction("add")}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            action === "add"
              ? "bg-blue-600 text-white"
              : "bg-white/20 text-gray-300 hover:bg-white/30"
          }`}
        >
          Add Liquidity
        </button>
        <button
          onClick={() => setAction("remove")}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            action === "remove"
              ? "bg-blue-600 text-white"
              : "bg-white/20 text-gray-300 hover:bg-white/30"
          }`}
        >
          Remove Liquidity
        </button>
      </div>

      {action === "add" ? (
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
          <div>
            <label className="block text-white mb-2">Amount A</label>
            <input
              type="number"
              value={amountA}
              onChange={(e) => setAmountA(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Amount B</label>
            <input
              type="number"
              value={amountB}
              onChange={(e) => setAmountB(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
            />
          </div>
          <button
            onClick={handleAddLiquidity}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Liquidity"}
          </button>
        </div>
      ) : (
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
          <div>
            <label className="block text-white mb-2">LP Token Balance: {lpBalance}</label>
          </div>
          <div>
            <label className="block text-white mb-2">Amount to Remove</label>
            <input
              type="number"
              value={liquidity}
              onChange={(e) => setLiquidity(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30"
            />
          </div>
          <button
            onClick={handleRemoveLiquidity}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "Removing..." : "Remove Liquidity"}
          </button>
        </div>
      )}
    </div>
  );
}

